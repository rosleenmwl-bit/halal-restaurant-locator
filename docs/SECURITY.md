# Security

## Secret Handling
- Supabase service-role key: server-side only (`SUPABASE_SERVICE_ROLE_KEY` in Vercel env — never in client bundle)
- Supabase anon key: safe for client reads (RLS enforces access)
- Admin bypass secret (`ADMIN_SECRET`): checked server-side in `/api/admin/*` routes only; never returned to browser
- No secrets in `NEXT_PUBLIC_*` except the anon key

## Permission Model
**v1 (demo-open):** All rows readable by anyone. Writes go through `/api/` routes that check `ADMIN_SECRET` header. 
**Lock-down sprint:** Supabase Auth added; RLS write policies changed to `auth.uid() = user_id`; `ADMIN_SECRET` bypass removed.

## Approved-Tools Rule
Agent actions use only the four named tools in AGENTIC_LAYER.md. No `run_any`, no raw SQL execution from the frontend, no dynamic tool construction.

## Audit Principle
Every create, update, delete, and publish-toggle writes a row to `audit_logs` with `action`, `target_table`, `target_id`, `payload` (before/after), and `user_id`. Audit rows are never deleted or edited — append-only. If a meaningful action cannot be logged, it does not execute.

## Known Limitation (pre-lock-down)
Anyone who discovers an `/api/admin/*` endpoint and guesses `ADMIN_SECRET` can write data. This is acceptable for a personal site before lock-down; rotate the secret and add Auth before any sensitive or multi-user data is stored.