# Data Model

## `cuisines`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | nullable, for owner-scoping at lock-down |
| created_at | timestamptz | default now() |
| name | text | unique, e.g. "Turkish" |

## `restaurants`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| created_at | timestamptz | |
| name | text | restaurant name |
| city | text | |
| country | text | |
| address | text | full street address |
| cuisine_id | uuid FK | → cuisines.id |
| halal_status | text | `halal-certified` \| `muslim-friendly` \| `unverified` |
| halal_status_source | text | **AI field** — source of status determination |
| halal_status_confidence | numeric | **AI field** — 0.0–1.0 |
| halal_status_review_status | text | default `unreviewed`; **AI field** |
| signature_dish | text | |
| price_range | text | `£` \| `££` \| `£££` |
| average_rating | numeric | 0.0–5.0 |
| review_count | integer | |
| description | text | |
| phone | text | |
| website | text | |
| google_maps_url | text | |
| image_url | text | |
| is_published | boolean | default true |

## `audit_logs`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable until lock-down |
| created_at | timestamptz | |
| action | text | `create` \| `update` \| `delete` |
| target_table | text | e.g. `restaurants` |
| target_id | uuid | row affected |
| payload | jsonb | before/after snapshot |

## RLS
All tables: open v1 policies (select + all) for demo. Lock-down sprint replaces write policies with `auth.uid() = user_id`.