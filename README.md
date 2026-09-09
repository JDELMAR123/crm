# CRM para tiendas — WhatsApp + Instagram + IA

CRM **autoalojado** para pequeños comercios: unifica los mensajes de WhatsApp e
Instagram en una bandeja, y una IA clasifica cada conversación (qué quiere el
cliente, nivel de interés, en qué punto de la compra está) y propone la
respuesta.

Cada negocio despliega **su propia copia**: su base de datos, sus cuentas, su
configuración. No depende de ningún servicio central.

Stack: Next.js 16, TypeScript, Tailwind 4, Prisma 7, PostgreSQL.

---

## Desplegar tu copia

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJDELMAR123%2Fcrm&project-name=mi-crm&repository-name=mi-crm)

1. Pulsa el botón (necesitas una cuenta gratis de **Vercel**).
2. Cuando te lo pida, **crea una base de datos** desde la pestaña *Storage* →
   *Neon (Postgres)*. Se conecta sola.
3. **Deploy**. En 2–3 minutos tienes tu URL.
4. Abre la URL → el **asistente** te pide crear la cuenta de administrador.
5. Entra y completa los *Primeros pasos* desde el panel.

Guía detallada sin terminal: **[docs/INSTALACION.md](docs/INSTALACION.md)**.

---

## Qué incluye

- **Bandeja unificada**: WhatsApp, Instagram y un simulador para pruebas. Cada
  conversación queda ligada a un contacto; se responde desde el CRM.
- **Sectorización con IA**: etapa (Nuevo → Interesado → En proceso de compra →
  Cliente → Perdido), nivel de interés, qué producto quiere, señales de compra,
  resumen y borrador de respuesta.
  - **IA básica** (incluida, sin coste, sin cuentas externas) por defecto.
  - **IA avanzada** (entiende la conversación de verdad) activándola con una
    clave de API — ver [docs/IA_AVANZADA.md](docs/IA_AVANZADA.md).
- **Pipeline**: tablero Kanban que se ordena solo con el análisis de la IA.
- **Contactos**: alta, búsqueda, ficha, edición.
- **Acceso y equipo**: login propio (email + contraseña, sesiones en base de
  datos, sin servicios externos), roles admin / agente, asistente de primer uso.
- **Ajustes en la app**: negocio, IA, catálogo de productos y credenciales de
  Meta — todo se configura sin tocar código.

Los canales de WhatsApp/Instagram requieren una app de Meta: ver
[docs/META_SETUP.md](docs/META_SETUP.md). Hasta entonces, el simulador permite
probar todo el flujo.

---

## Configuración

Todo se hace desde **Ajustes** (`/ajustes`, solo administradores): nombre del
negocio, motor de IA + API key, catálogo de productos y colores, y credenciales
de WhatsApp/Instagram.

Variables de entorno (todas **opcionales** — lo de Ajustes tiene prioridad):

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL (la pone la integración de Neon) |
| IA avanzada | Se configura desde Ajustes — ver [docs/IA_AVANZADA.md](docs/IA_AVANZADA.md) |
| `META_*` | Credenciales de WhatsApp/Instagram por entorno |
| `CREATOR_EMAIL` + `CREATOR_PASSWORD` | Habilita el panel `/creador` (diagnóstico y control de la instalación) para ese correo |

---

## Desarrollo local

```bash
npm install
cp .env.example .env          # ajusta DATABASE_URL
npm run db:push               # crea las tablas
npm run db:seed               # admin@demo.local / demo1234 + datos de ejemplo
npm run dev                   # http://localhost:3000
```

En producción no se ejecuta el seed: la app arranca vacía y lleva al asistente
`/setup`. Cada `git push` a `main` despliega automáticamente (Vercel + GitHub) y
aplica las migraciones nuevas.

### Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run db:push` | Sincroniza el esquema con la base de datos |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Datos de ejemplo (solo desarrollo) |

---

## Estructura

```
prisma/schema.prisma       Modelos: User, Session, Settings, Contact, Conversation, Message
prisma/migrations/         Migraciones (se aplican solas en cada despliegue)
docs/                       Guías: INSTALACION, META_SETUP
proxy.ts                    Redirección a /login si no hay sesión (edge)
src/app/(auth)/             /login y /setup
src/app/(app)/              Todo lo protegido: panel, inbox, pipeline, contacts, equipo, ajustes, creador
src/app/api/webhooks/       Endpoints públicos de WhatsApp e Instagram
src/lib/auth/               Sesiones, contraseñas, guardas
src/lib/settings/           Configuración de la instalación
src/lib/creator/            Acceso de creador
src/lib/channels/           Adaptadores de canal
src/lib/ai/                 Motor de sectorización (IA básica | IA avanzada)
src/lib/actions/            Server Actions
```

---

## Licencia

[PolyForm Perimeter 1.0.1](LICENSE.md): puedes autoalojar y usar este software
para tu propio negocio, y modificarlo. **No** puedes revenderlo ni ofrecerlo
como producto o servicio que compita con él.
