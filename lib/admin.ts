import { cookies } from "next/headers";
export async function isAdmin() { const secret = process.env.ADMIN_SECRET; return Boolean(secret && (await cookies()).get("admin_session")?.value === secret); }
