import { createClient } from "@/lib/supabase/server";
import { getVisitorId } from "@/lib/visitor";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = ["vendor", "amount", "receipt_date", "category_id"] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];

const SOURCE_COLUMN: Record<EditableField, string> = {
  vendor: "vendor_source",
  amount: "amount_source",
  receipt_date: "receipt_date_source",
  category_id: "category_source",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { field, value } = body as { field?: string; value?: unknown };

    if (!field || !EDITABLE_FIELDS.includes(field as EditableField)) {
      return NextResponse.json(
        { error: `field must be one of: ${EDITABLE_FIELDS.join(", ")}` },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const visitorId = await getVisitorId();

    const { data: existing, error: fetchError } = await supabase
      .from("receipts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const f = field as EditableField;
    const oldValue = existing[f];

    const update: Record<string, unknown> = {
      [f]: value,
      [SOURCE_COLUMN[f]]: "manual",
      review_status: existing.review_status === "unreviewed" ? "reviewed" : existing.review_status,
    };

    const { data: updated, error: updateError } = await supabase
      .from("receipts")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw new Error(updateError.message);

    await writeAuditLog(supabase, {
      user_id: visitorId,
      action: "edit_field",
      object_type: "receipt",
      object_id: id,
      old_value: JSON.stringify({ [f]: oldValue }),
      new_value: JSON.stringify({ [f]: value }),
      source: "user",
    });

    return NextResponse.json({ receipt: updated });
  } catch (err) {
    console.error("[receipts/:id PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
