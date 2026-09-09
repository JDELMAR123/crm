# Paso a paso — lo que tienes que hacer tú

Marca cada casilla al terminar. Donde pone **(yo me encargo)** es trabajo mío;
tú solo necesitas darme el dato o el acceso.

---

## PARTE 1 — Poner el CRM en internet (1 día, ~30 min tuyos)

Esto te da un enlace real (`https://...`) y es requisito para conectar Meta.

- [ ] **1.1** Crea una cuenta gratis en **Vercel**: https://vercel.com/signup
      (puedes entrar con email o con Google).
- [ ] **1.2** Crea una cuenta gratis en **Neon** (base de datos): https://neon.tech
      → botón "Sign up". Crea un proyecto llamado `crm`, región Europa.
- [ ] **1.3** En Neon, copia la **Connection string** (empieza por
      `postgresql://...`). Pásamela por aquí (o pégala tú en Vercel cuando te lo
      indique).
- [ ] **1.4** Dime tu usuario de Vercel o instala la herramienta y dame acceso:
      abre una terminal y ejecuta `npx vercel login`, sigue el enlace que abre y
      confirma. Avísame cuando lo tengas.
- [ ] **1.5** **(yo me encargo)** Subo el proyecto a Vercel, configuro la base
      de datos, aplico el esquema y te doy el enlace final.
- [ ] **1.6** Abre el enlace que te dé y comprueba que ves el CRM.

> Alternativa con GitHub (mejor si vas a tocar el código a menudo): crea cuenta
> en https://github.com, dime el nombre de usuario, y conecto Vercel a GitHub
> para que cada cambio se publique solo.

---

## PARTE 2 — Cuentas de Meta (empieza YA, tarda 1–3 semanas)

Lo más lento es la verificación del negocio. Haz esta parte en paralelo a la 1.

### 2.1 Meta Business

- [ ] Entra en https://business.facebook.com y crea un **Business Manager**
      (nombre del negocio, tu email).
- [ ] Ve a **Configuración del negocio → Centro de seguridad → Verificación
      del negocio** y súbela:
  - Nombre legal, dirección y teléfono del negocio
  - Un documento que lo acredite (alta de autónomo, escritura, factura de
    suministro a nombre del negocio, etc.)
- [ ] Espera la aprobación (te llega por email; suele tardar de días a 2–3
      semanas).

### 2.2 Número de teléfono para WhatsApp

- [ ] Consigue un **número que NO esté usándose en la app normal de WhatsApp**
      (ni WhatsApp ni WhatsApp Business). Puede ser:
  - una SIM nueva de prepago, o
  - un número fijo/virtual que pueda recibir SMS o llamada
- [ ] Tenlo a mano para recibir el código de verificación en el paso 2.4.

### 2.3 Instagram

- [ ] En la app de Instagram del negocio: **Configuración → Tipo de cuenta →
      Cambiar a cuenta profesional** (elige "Empresa").
- [ ] Crea o ten una **página de Facebook** del negocio.
- [ ] Vincula la cuenta de Instagram a esa página:
      **Configuración de Instagram → Página → conectar**.
- [ ] En Instagram: **Configuración → Privacidad → Mensajes → permitir acceso a
      mensajes desde herramientas conectadas** (actívalo).

### 2.4 App de Meta

- [ ] Entra en https://developers.facebook.com → **Mis apps → Crear app** →
      tipo **"Empresa"**. Asóciala a tu Business Manager.
- [ ] Añade el producto **WhatsApp**:
  - Sigue el asistente, registra el número del paso 2.2 y verifícalo con el código.
  - Copia y guárdame estos 2 datos: **Identificador del número de teléfono
    (Phone Number ID)** y **Identificador de la cuenta de WhatsApp Business**.
- [ ] Añade el producto **Messenger** (para Instagram):
  - Vincula la página de Facebook del paso 2.3.
  - Copia y guárdame: **Identificador de la cuenta de Instagram**.
- [ ] Crea un **usuario del sistema** con token permanente:
  - Business Manager → **Usuarios → Usuarios del sistema → Añadir**
  - Dale rol de administrador sobre la app y sobre los activos de WhatsApp e
    Instagram.
  - **Generar token** con estos permisos:
    `whatsapp_business_messaging`, `whatsapp_business_management`,
    `pages_messaging`, `instagram_manage_messages`, `business_management`
  - Copia el token (empieza por `EAAG...`) y **guárdalo en sitio seguro** — solo
    se muestra una vez.

### 2.5 Conectar con el CRM — **(yo me encargo)**

- [ ] Me pasas los datos recogidos (Phone Number ID, IDs de cuentas, token).
- [ ] Yo los pongo en Vercel y configuro los webhooks en el panel de Meta.
- [ ] Probamos: te escribes un WhatsApp desde otro móvil al número y aparece la
      conversación en el CRM.

### 2.6 Revisión de Meta (App Review)

- [ ] Para operar con clientes reales (no solo números de prueba), Meta revisa
      los permisos. Necesitas:
  - Una **política de privacidad** publicada en una web (te doy una plantilla).
  - Un **vídeo corto** mostrando cómo se usan los mensajes en el CRM (lo
    grabamos juntos).
- [ ] Envías la solicitud y esperas (1–3 semanas).

---

## PARTE 3 — Activar la IA avanzada (opcional, 5 min)

Sin esto, el CRM ya clasifica las conversaciones con la IA básica incluida.
Para la IA avanzada, sigue **[IA_AVANZADA.md](IA_AVANZADA.md)** (crear una clave
de API y pegarla en Ajustes).

---

## Orden recomendado

1. Hoy: Parte 1 completa + arrancar Parte 2.1 (verificación de Meta).
2. Mientras Meta verifica: Parte 3 si quieres la IA avanzada.
3. Cuando Meta apruebe la verificación: resto de la Parte 2.
4. Al final: Parte 2.6 (App Review) y a producción.
