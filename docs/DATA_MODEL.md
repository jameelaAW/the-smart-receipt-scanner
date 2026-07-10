# Data Model

## receipts
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid nullable | owner; null = demo row |
| image_url | text | Supabase Storage URL |
| vendor | text | raw or AI-extracted |
| vendor_source | text | 'ai' or 'manual' |
| vendor_confidence | numeric | 0–1 |
| amount | numeric | in cents or decimal |
| amount_source | text | 'ai' or 'manual' |
| amount_confidence | numeric | 0–1 |
| receipt_date | date | extracted date |
| receipt_date_source | text | 'ai' or 'manual' |
| receipt_date_confidence | numeric | 0–1 |
| category_id | uuid FK → categories | auto-assigned |
| category_source | text | 'ai' or 'manual' |
| category_confidence | numeric | 0–1 |
| review_status | text | 'unreviewed' / 'reviewed' / 'manual_entry' |
| created_at | timestamptz | default now() |

## categories
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | e.g. 'Client Meeting' |
| icon | text | emoji shorthand |
| created_at | timestamptz | |

## subscriptions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| stripe_customer_id | text | |
| stripe_subscription_id | text | |
| status | text | 'trialing' / 'active' / 'canceled' |
| plan | text | 'free' / 'pro' |
| created_at | timestamptz | |

## RLS
- v1: permissive read + write on all tables (demo-first)
- Lock-down sprint: restrict receipts + subscriptions to `auth.uid() = user_id`