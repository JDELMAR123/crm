# Conectar WhatsApp e Instagram (Meta)

Esta guía cubre los trámites y la configuración para que el CRM reciba y envíe
mensajes reales. El código ya está listo: solo hay que rellenar variables de
entorno. Mientras tanto, el **Simulador** de la bandeja te permite probar todo.

## Resumen del proceso

| Paso | Quién | Tiempo aprox. |
| ---- | ----- | ------------- |
| 1. Cuenta de Meta Business + verificación del negocio | Tú | días–semanas |
| 2. App de Meta (tipo "Business") | Tú | 30 min |
| 3. WhatsApp: alta del número + Phone Number ID | Tú | 1 h |
| 4. Instagram: cuenta profesional + página de Facebook vinculada | Tú | 30 min |
| 5. Configurar webhooks apuntando al CRM (HTTPS público) | Tú + yo | 1 h |
| 6. Revisión de permisos de Meta (App Review) | Meta | 1–3 semanas |

## 1. Meta Business y verificación

1. Crea un [Meta Business Manager](https://business.facebook.com/).
2. En **Configuración del negocio → Centro de seguridad**, inicia la
   **verificación del negocio** (documento fiscal, dominio, teléfono).
   Sin esto no se pueden enviar mensajes fuera de la ventana de pruebas.

## 2. App de Meta

1. En [developers.facebook.com](https://developers.facebook.com/apps) → **Crear app** → tipo **Business**.
2. Añade los productos **WhatsApp** y **Messenger** (para Instagram).
3. Apunta el **App ID** y el **App Secret**.

## 3. WhatsApp

1. En el panel de WhatsApp de la app, añade un **número de teléfono** (no puede
   estar activo en la app normal de WhatsApp).
2. Copia el **Phone Number ID** y genera un **token de acceso permanente**
   (System User token con permisos `whatsapp_business_messaging`).
3. Rellena en `.env`:

   ```
   META_WHATSAPP_TOKEN="EAAG..."
   META_WHATSAPP_PHONE_ID="123456789012345"
   ```

## 4. Instagram

1. Convierte la cuenta de Instagram en **Profesional** y vincúlala a una
   **página de Facebook**.
2. En el panel de Messenger de la app, vincula la página y genera el
   **Page Access Token**.
3. Consigue el **Instagram Account ID** (Graph API: `GET /me/accounts` →
   `instagram_business_account`).
4. Rellena en `.env`:

   ```
   META_INSTAGRAM_TOKEN="EAAG..."
   META_INSTAGRAM_ACCOUNT_ID="17841400000000000"
   ```

## 5. Webhooks

El CRM expone estos endpoints (necesitan una URL pública con HTTPS):

| Canal | URL |
| ----- | --- |
| WhatsApp | `https://TU-DOMINIO/api/webhooks/whatsapp` |
| Instagram | `https://TU-DOMINIO/api/webhooks/instagram` |

1. Inventa una cadena secreta y ponla en `.env`:

   ```
   META_WEBHOOK_VERIFY_TOKEN="una-cadena-larga-y-secreta"
   ```

2. En el panel de cada producto (WhatsApp / Messenger) → **Webhooks**:
   - **Callback URL**: la URL de la tabla.
   - **Verify token**: la misma cadena de arriba.
   - Suscríbete a los campos `messages` (WhatsApp) y `messages` / `messaging`
     (Instagram).

3. **En desarrollo local** usa un túnel para tener HTTPS público:

   ```bash
   npx untun@latest tunnel http://localhost:3000
   # o: ngrok http 3000
   ```

   Usa la URL que te dé el túnel como Callback URL.

## 6. App Review

Para operar fuera del modo de pruebas, Meta exige revisar los permisos:
`whatsapp_business_messaging`, `pages_messaging`, `instagram_manage_messages`,
`business_management`. Prepara un vídeo mostrando el flujo y una política de
privacidad publicada.

## Comprobación

Cuando `.env` esté completo, reinicia el servidor. En la bandeja, el aviso
"canal no conectado" desaparece y los mensajes salientes se envían de verdad.
Prueba enviando un WhatsApp al número desde otro teléfono: debe aparecer una
conversación nueva con su análisis de IA.
