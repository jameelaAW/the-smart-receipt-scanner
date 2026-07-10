export type Category = {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
};

export type FieldSource = "ai" | "manual" | null;

export type Receipt = {
  id: string;
  user_id: string | null;
  image_url: string | null;
  vendor: string | null;
  vendor_source: FieldSource;
  vendor_confidence: number | null;
  amount: number | null;
  amount_source: FieldSource;
  amount_confidence: number | null;
  receipt_date: string | null;
  receipt_date_source: FieldSource;
  receipt_date_confidence: number | null;
  category_id: string | null;
  category_source: FieldSource;
  category_confidence: number | null;
  review_status: "unreviewed" | "reviewed" | "manual_entry";
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: "trialing" | "active" | "canceled" | null;
  plan: "free" | "pro" | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  object_type: string | null;
  object_id: string | null;
  old_value: string | null;
  new_value: string | null;
  source: "user" | "ai" | null;
  created_at: string;
};
