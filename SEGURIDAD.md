# Seguridad · Habitus by VIRTUS ARS

Habitus funciona 100 % en el dispositivo: no tiene servidor, cuentas, base de datos ni claves de API. Por eso algunos puntos de la lista de 20 no aplican hasta que se agregue un backend.

| # | Punto | Estado |
|---|-------|--------|
| 1 | Ocultar API Key | Cumple: no hay claves en el código |
| 2 | Purgar secretos de Git | Cumple: `.gitignore` excluye llaves y `.env`. Activa *Secret scanning* y *Push protection* en GitHub |
| 3 | Key pública de BD | Cumple: la app usa solo la clave pública (anon). La service_role vive únicamente en la función del servidor |
| 4 | RLS | Cumple: RLS activo en `profiles`; cada usuario solo lee su propio perfil |
| 5 | Encriptación | Datos en almacenamiento privado de la app (sandbox de Android). Sin cifrado adicional |
| 6 | Forzar autenticación | Cumple: login obligatorio con cuentas creadas por el administrador; el registro público está apagado |
| 7 | Restringir acceso a registros | Cumple: sin políticas de escritura; solo la función admin (service role) crea, suspende o elimina |
| 8 | Manipulación de campos | Cumple: al cargar, se validan tipos, rangos y largos |
| 9 | Cookies de sesión | Sesión con tokens de Supabase Auth (acceso corto + renovación); suspender bloquea la renovación |
| 10 | Hasheo de contraseñas | Cumple: Supabase Auth guarda el hash (bcrypt). Las contraseñas las genera el servidor al azar (12 caracteres) y el usuario no las cambia |
| 11 | Limitar acceso a login | Cumple: límites de intentos de Supabase Auth; la función admin valida cada acción en el servidor |
| 12 | Antibot | Opcional: activa CAPTCHA (Turnstile/hCaptcha) en Authentication > Attack Protection |
| 13 | Parametrización | Cumple: las consultas van por la API de Supabase (parametrizadas), sin SQL armado a mano |
| 14 | Validar inputs | Cumple: longitud máxima, recorte de espacios y validación de datos guardados |
| 15 | Escapar contenido | Cumple: todo texto del usuario se escapa antes de mostrarse |
| 16 | Restringir subida | No aplica (sin subidas) |
| 17 | Recortar respuestas de API | Cumple: el perfil pide solo los campos necesarios y la lista admin está limitada a 500 |
| 18 | Headers de seguridad | Parcial: la app usa CSP y referrer por `<meta>`; los headers HTTP reales aplican solo con servidor |
| 19 | HTTPS | Cumple: tráfico en claro bloqueado y contenido mixto prohibido. Solo se usa HTTPS para la tipografía |
| 20 | Escaneo de dependencias | Cumple: sin librerías de terceros; Dependabot vigila Gradle y GitHub Actions |

Endurecimiento extra de Android: copias de seguridad desactivadas, acceso a archivos del WebView desactivado, depuración remota apagada, enlaces externos solo por HTTPS y permisos mínimos en el workflow.


Nota: Habitus guarda los hábitos en el propio dispositivo (por usuario). La cuenta controla el ACCESO a la app. Para que el servidor controle también los datos hace falta sincronizarlos en la nube con RLS.
