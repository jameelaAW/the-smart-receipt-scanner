// scan_receipt(image_url) — named tool from AGENTIC_LAYER.md.
// Extraction schema per INTELLIGENCE_LAYER.md.
export type ExtractionResult = {
  vendor: string | null;
  vendor_confidence: number | null;
  amount: number | null;
  amount_confidence: number | null;
  receipt_date: string | null;
  receipt_date_confidence: number | null;
  suggested_category: string | null;
  category_confidence: number | null;
};

const SCHEMA_PROMPT = `You are reading a photo of a business receipt. Extract these fields and
respond with ONLY a JSON object, no prose, matching exactly this shape:
{
  "vendor": string | null,
  "vendor_confidence": number,        // 0-1
  "amount": number | null,            // total amount, decimal
  "amount_confidence": number,        // 0-1
  "receipt_date": string | null,      // YYYY-MM-DD
  "receipt_date_confidence": number,  // 0-1
  "suggested_category": string | null, // one of: "Client Meeting", "Office Supplies", "Travel", "Meals & Entertainment", "Equipment", "Uncategorized"
  "category_confidence": number       // 0-1
}
If the image is skewed, low-contrast, or partially unreadable, do your best and lower the
relevant confidence score rather than refusing.`;

/** Calls OpenAI Vision. Returns null (never throws) when the key is missing or the call fails
 *  — the caller falls back to manual_entry, per ARCHITECTURE.md "Core Without AI". */
export async function scanReceipt(imageDataUrl: string): Promise<ExtractionResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: SCHEMA_PROMPT },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        max_tokens: 500,
      }),
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      console.error("[openai] non-OK response", res.status, await res.text());
      return null;
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as ExtractionResult;
    return parsed;
  } catch (err) {
    console.error("[openai] scanReceipt failed", err);
    return null;
  }
}
