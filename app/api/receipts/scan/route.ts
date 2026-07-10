import { createClient } from "@/lib/supabase/server";
import { getIdentity } from "@/lib/identity";
import { scanReceipt } from "@/lib/openai";
import { assignCategory } from "@/lib/categorize";
import { writeAuditLog } from "@/lib/audit";
import { getSubscriptionForUser, isPro } from "@/lib/subscription";
import { FREE_SCAN_LIMIT, scansThisMonth } from "@/lib/scanLimit";
import { NextResponse } from "next/server";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // base64 data URL, ~4.5MB decoded image

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageDataUrl } = body as { imageDataUrl?: string };

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return NextResponse.json({ error: "imageDataUrl is required" }, { status: 400 });
    }
    if (!/^data:image\/(jpeg|png|jpg);base64,/.test(imageDataUrl)) {
      return NextResponse.json(
        { error: "Please upload a JPG or PNG" },
        { status: 400 },
      );
    }
    if (imageDataUrl.length > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image is too large" }, { status: 400 });
    }

    const supabase = await createClient();
    const { userId, isAuthenticated } = await getIdentity();

    // TASKS.md Sprint 4: "Gate scan endpoint: unauthenticated users see demo
    // only; prompt to sign up."
    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Sign up to start scanning receipts", signUpRequired: true },
        { status: 401 },
      );
    }

    const subscription = await getSubscriptionForUser(userId);
    if (!isPro(subscription)) {
      const used = await scansThisMonth(supabase, userId);
      if (used >= FREE_SCAN_LIMIT) {
        return NextResponse.json(
          { error: "You've used your 5 free scans — upgrade to continue" },
          { status: 403 },
        );
      }
    }

    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name");
    if (catError) throw new Error(catError.message);

    const extraction = await scanReceipt(imageDataUrl);

    let insertRow: Record<string, unknown>;

    if (!extraction) {
      // ARCHITECTURE.md "Core Without AI": nothing breaks, user fills in manually.
      insertRow = {
        user_id: userId,
        image_url: imageDataUrl,
        review_status: "manual_entry",
      };
    } else {
      const category = assignCategory({
        vendor: extraction.vendor,
        aiSuggestedCategory: extraction.suggested_category,
        aiConfidence: extraction.category_confidence,
      });
      const matched = categories?.find(
        (c) => c.name.toLowerCase() === category.name.toLowerCase(),
      );

      insertRow = {
        user_id: userId,
        image_url: imageDataUrl,
        vendor: extraction.vendor,
        vendor_source: "ai",
        vendor_confidence: extraction.vendor_confidence,
        amount: extraction.amount,
        amount_source: "ai",
        amount_confidence: extraction.amount_confidence,
        receipt_date: extraction.receipt_date,
        receipt_date_source: "ai",
        receipt_date_confidence: extraction.receipt_date_confidence,
        category_id: matched?.id ?? null,
        category_source: category.source,
        category_confidence: category.confidence,
        review_status: "unreviewed",
      };
    }

    const { data: receipt, error: insertError } = await supabase
      .from("receipts")
      .insert(insertRow)
      .select("*")
      .single();

    if (insertError) throw new Error(insertError.message);

    await writeAuditLog(supabase, {
      user_id: userId,
      action: extraction ? "scan_receipt" : "scan_receipt_failed",
      object_type: "receipt",
      object_id: receipt.id,
      new_value: JSON.stringify(insertRow),
      source: "ai",
    });

    return NextResponse.json({
      receipt,
      warning: extraction
        ? undefined
        : "Auto-extraction failed — please enter details manually",
    });
  } catch (err) {
    console.error("[receipts/scan]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
