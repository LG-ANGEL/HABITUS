# Cuentas administradas · Habitus by VIRTUS ARS

Las contraseñas las genera y administra SOLO el administrador. Los usuarios no pueden registrarse ni cambiarlas.

## Configuración (una sola vez, gratis en supabase.com)
1. Crea un proyecto nuevo en Supabase.
2. **SQL Editor** > pega `schema.sql` > **Run**.
3. **Authentication > Sign In / Providers > Email**: apaga **Allow new users to sign up**. (Esto impide que cualquiera cree cuentas.)
4. **Authentication > Users > Add user**: correo `admin@habitus.example`, una contraseña larga y marca **Auto Confirm User**.
5. En **SQL Editor** ejecuta:
   ```sql
   insert into public.profiles (id, username, role, expires_at)
   select id, 'admin', 'admin', '2099-01-01' from auth.users where email = 'admin@habitus.example';
   ```
6. **Edge Functions > Deploy a new function > Via Editor**: nombre `admin-users`, pega `functions/admin-users/index.ts` y **Deploy**.
7. **Project Settings > API**: copia **Project URL** y la clave **anon public**.
8. En `app/src/main/assets/index.html` completa `var CFG={url:"...",key:"..."}` con esos dos datos.
   NUNCA pongas la clave `service_role` en la app.
9. Sube los cambios a GitHub y descarga el APK nuevo.

## Uso
- Entra a la app con usuario `admin` y su contraseña. Aparece el **Panel del administrador**.
- **Crear**: escribe el usuario y los días; la app muestra la contraseña UNA sola vez. Cópiala y envíasela al usuario.
- **+30 d** extiende la suscripción, **Suspender/Activar**, **Nueva clave** y **Eliminar**.
- Al vencer o suspenderse, el usuario ve el aviso y no puede entrar.
