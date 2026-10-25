import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const DOM = "@habitus.example"; // debe coincidir con DOM en index.html
const url = Deno.env.get("SUPABASE_URL")!;
const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function genPass() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const a = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(a, (x) => c[x % c.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const admin = createClient(url, svc, { auth: { persistSession: false } });

  // 1) Autenticación obligatoria
  const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const { data: u } = await admin.auth.getUser(jwt);
  if (!u?.user) return json({ error: "No autorizado" }, 401);

  // 2) Solo el administrador activo
  const { data: me } = await admin.from("profiles").select("role,active").eq("id", u.user.id).single();
  if (me?.role !== "admin" || !me.active) return json({ error: "Solo el administrador" }, 403);

  let b: any;
  try { b = await req.json(); } catch { return json({ error: "Datos inválidos" }, 400); }
  const id = String(b.id || "");
  const needId = () => UUID.test(id) && id !== u.user.id;

  switch (b.action) {
    case "list": {
      const { data } = await admin.from("profiles")
        .select("id,username,role,active,expires_at,created_at")
        .order("created_at", { ascending: false }).limit(500);
      return json({ users: data });
    }
    case "create": {
      const user = String(b.username || "").toLowerCase();
      if (!/^[a-z0-9._-]{3,32}$/.test(user)) return json({ error: "Usuario inválido: 3 a 32 letras, números . _ -" }, 400);
      const days = Math.min(Math.max(parseInt(b.days) || 30, 1), 3650);
      const pass = genPass();
      const { data, error } = await admin.auth.admin.createUser({ email: user + DOM, password: pass, email_confirm: true });
      if (error || !data?.user) return json({ error: "No se pudo crear (¿el usuario ya existe?)" }, 400);
      const exp = new Date(Date.now() + days * 864e5).toISOString();
      const { error: e2 } = await admin.from("profiles").insert({ id: data.user.id, username: user, role: "user", active: true, expires_at: exp });
      if (e2) { await admin.auth.admin.deleteUser(data.user.id); return json({ error: "Error al crear el perfil" }, 500); }
      return json({ username: user, password: pass, expires_at: exp });
    }
    case "extend": {
      if (!needId()) return json({ error: "Usuario inválido" }, 400);
      const days = Math.min(Math.max(parseInt(b.days) || 30, 1), 3650);
      const { data: p } = await admin.from("profiles").select("expires_at").eq("id", id).single();
      if (!p) return json({ error: "No existe" }, 404);
      const base = Math.max(Date.now(), new Date(p.expires_at).getTime());
      await admin.from("profiles").update({ expires_at: new Date(base + days * 864e5).toISOString(), active: true }).eq("id", id);
      await admin.auth.admin.updateUserById(id, { ban_duration: "none" });
      return json({ ok: true });
    }
    case "set_active": {
      if (!needId()) return json({ error: "Usuario inválido" }, 400);
      const on = b.active === true;
      await admin.from("profiles").update({ active: on }).eq("id", id);
      // Suspender también bloquea el inicio de sesión y la renovación de sesión
      await admin.auth.admin.updateUserById(id, { ban_duration: on ? "none" : "876000h" });
      return json({ ok: true });
    }
    case "reset_password": {
      if (!needId()) return json({ error: "Usuario inválido" }, 400);
      const pass = genPass();
      const { error } = await admin.auth.admin.updateUserById(id, { password: pass });
      if (error) return json({ error: "No se pudo cambiar la contraseña" }, 400);
      return json({ password: pass });
    }
    case "delete": {
      if (!needId()) return json({ error: "Usuario inválido" }, 400);
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) return json({ error: "No se pudo eliminar" }, 400);
      return json({ ok: true });
    }
    default:
      return json({ error: "Acción desconocida" }, 400);
  }
});
