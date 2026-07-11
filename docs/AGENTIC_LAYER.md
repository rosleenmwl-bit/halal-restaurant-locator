# Agentic Layer

## Risk Levels & Actions

### Low Risk — Auto-execute
- Auto-tag cuisine type from restaurant name + description
- Auto-score halal_status_confidence using keyword rules on save
- Auto-generate a short SEO description from name + city + signature dish

### Medium Risk — Owner reviews draft before applying
- Suggest an updated halal_status after new certification evidence is found
- Bulk re-score confidence scores after rule update

### High Risk — Owner explicitly approves each
- Publish or unpublish a restaurant (sets is_published)
- Send email digest of new restaurants to subscriber list

### Critical — Human only, never automated
- Delete a restaurant record permanently
- Modify audit_logs

## Named Tools (approved list)
- `insert_restaurant` — creates one restaurant row + audit_log entry
- `update_restaurant` — patches fields + audit_log entry
- `set_published_status` — flips is_published + audit_log entry
- `score_halal_confidence` — runs keyword rules, updates AI fields only

## Audit Log Fields (per action)
`action`, `target_table`, `target_id`, `payload` (before + after snapshot), `user_id`, `created_at`

## v1 vs Later
- **v1:** Only `score_halal_confidence` runs automatically on save; all others are manual owner actions via admin UI
- **Later:** Agent drafts new restaurant entries from a URL the owner pastes; owner approves before insert