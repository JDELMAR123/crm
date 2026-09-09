# Instalar una copia nueva del CRM

Guía para desplegar una instalación independiente (una por cliente). Todo se
hace desde el navegador: **no hace falta terminal**.

Al terminar, el cliente tendrá su propia URL, su propia base de datos y su
propia configuración. No depende de ninguna otra instalación.

---

## Lo que necesitas antes de empezar

- Una cuenta de **Vercel** (gratis): https://vercel.com/signup
- Acceso al repositorio del CRM en GitHub (te lo da el creador del producto).

---

## Paso 1 — Conectar GitHub con Vercel (una sola vez por cuenta)

1. Entra en https://vercel.com/account/login-connections
2. En **GitHub**, pulsa **Connect** y autoriza.

## Paso 2 — Importar el proyecto

1. Ve a https://vercel.com/new
2. En **Import Git Repository**, busca `crm` y pulsa **Import**.
   - Si no aparece, pulsa **Adjust GitHub App Permissions** y da acceso al repo.
3. Framework: **Next.js** (se detecta solo). No cambies el *Build Command*.
4. **No pulses Deploy todavía** — primero la base de datos (Paso 3).

## Paso 3 — Crear la base de datos (automático)

1. En la misma pantalla de importación, abre la sección **Storage**
   (o, si ya desplegaste, ve a la pestaña **Storage** del proyecto).
2. **Create Database → Neon (Postgres)**.
3. Nombre: `crm` · Región: la más cercana al cliente (p. ej. Frankfurt).
4. **Create & Continue** → **Connect**.

Esto añade solo las variables de conexión (`DATABASE_URL`, etc.). No tienes
que copiar ninguna cadena a mano.

## Paso 4 — Variable del creador (opcional pero recomendado)

En **Environment Variables** añade:

| Key | Value |
| --- | ----- |
| `CREATOR_EMAIL` | tu correo |
| `CREATOR_PASSWORD` | una contraseña larga tuya |

Con las dos, al arrancar se crea una cuenta con ese correo y podrás entrar en
`TU-URL/login` para ver el panel `/creador` (diagnóstico y control de la
instalación, que el administrador del cliente no ve).

## Paso 5 — Desplegar

Pulsa **Deploy**. Tarda 2–3 minutos. Al terminar te da una URL
`https://algo.vercel.app`.

> Durante el despliegue, el CRM crea sus tablas en la base de datos
> automáticamente. No hay que hacer nada más.

## Paso 6 — Entregar al cliente

1. Abre la URL. Verás el **asistente de configuración**.
2. Crea la cuenta de **administrador del cliente** (su nombre, su email, su
   contraseña) y entrégasela.
3. El cliente entra y completa sus **Primeros pasos** desde el panel:
   nombre del negocio, catálogo de productos, motor de IA y, cuando los
   tenga, los canales de WhatsApp e Instagram (guía: `META_SETUP.md`).

---

## Dominio propio (opcional)

En el proyecto de Vercel → **Settings → Domains** → añade el dominio del
cliente y sigue las instrucciones de DNS.

## Actualizaciones

Cuando el creador publica una mejora en el repositorio, cada instalación
conectada a GitHub se actualiza sola en el siguiente push (Vercel redepliega
y aplica las migraciones nuevas). La configuración del cliente no se toca.
