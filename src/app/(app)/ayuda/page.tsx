import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function Section({
  n,
  title,
  kicker,
  children,
}: {
  n: number;
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-black/10 pt-6 first:border-t-0 first:pt-0 dark:border-white/10">
      <div className="flex items-baseline gap-3">
        <span className="text-xl font-semibold text-brand">{n}</span>
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="text-xs opacity-50">{kicker}</p>
        </div>
      </div>
      <div className="space-y-3 pl-8 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function FeatureGrid({ items }: { items: { label: string; text: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-md border border-black/10 p-3 dark:border-white/10"
        >
          <div className="text-sm font-medium">{it.label}</div>
          <p className="text-xs opacity-60">{it.text}</p>
        </div>
      ))}
    </div>
  );
}

function Callout({
  tone,
  children,
}: {
  tone: "info" | "warn";
  children: React.ReactNode;
}) {
  const cls =
    tone === "info"
      ? "border-brand/30 bg-brand/10"
      : "border-amber-500/30 bg-amber-500/10";
  return (
    <div className={`rounded-md border p-3 text-sm ${cls}`}>{children}</div>
  );
}

export default async function AyudaPage() {
  await requireUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Ayuda</h1>
        <p className="opacity-70">
          Todo lo que necesitas para usar tu CRM día a día, explicado sin
          tecnicismos.
        </p>
      </div>

      <Section n={1} title="Qué es y qué no tienes que saber" kicker="Antes de tocar nada">
        <p>
          Este CRM junta tus conversaciones de <strong>WhatsApp e Instagram</strong> en
          una sola bandeja, y una inteligencia artificial las lee por ti: detecta qué
          quiere cada cliente, qué tan interesado está, y te deja un borrador de
          respuesta listo.
        </p>
        <FeatureGrid
          items={[
            { label: "Es tuyo", text: "Tu propia base de datos, tu propia dirección web. Nadie más ve tus conversaciones." },
            { label: "Funciona desde el navegador", text: "No hay nada que instalar en tu computadora ni en tu teléfono." },
            { label: "La IA nunca envía sola", text: "Siempre redacta un borrador; el envío final lo decides tú." },
          ]}
        />
      </Section>

      <Section n={2} title="Recorrido del panel" kicker="Lo primero que ves al entrar">
        <p>
          Arriba de todo tienes el menú: <strong>Inicio · Bandeja · Pipeline · Contactos
          · Productos · Equipo · Ajustes</strong>. La pantalla de <strong>Inicio</strong> es tu
          resumen del día:
        </p>
        <FeatureGrid
          items={[
            { label: "Primeros pasos", text: "Una lista corta que te guía las primeras veces. Desaparece sola cuando terminas." },
            { label: "Números del momento", text: "Contactos totales, mensajes sin leer, y cuántos están en pleno proceso de compra." },
            { label: "Leads más calientes", text: "Quiénes muestran más interés ahora mismo, según la IA." },
          ]}
        />
      </Section>

      <Section n={3} title="Bandeja: donde pasa todo" kicker="Tus conversaciones de WhatsApp e Instagram">
        <p>
          A la izquierda, la lista de conversaciones. Al abrir una, el hilo queda a la
          izquierda y a la derecha un panel con el <strong>análisis de la IA</strong>:
          interés (0-100), qué quiere, sentimiento, resumen y siguiente paso
          recomendado.
        </p>
        <p>
          Abajo del hilo hay un cuadro de respuesta con un <strong>borrador ya escrito</strong> por
          la IA — lo revisas, lo ajustas si quieres, y lo envías. Si algo no te
          convence, el botón <strong>Reanalizar</strong> vuelve a leer la conversación.
        </p>
        <Callout tone="warn">
          Mientras no tengas conectado WhatsApp o Instagram de verdad (eso lo hace tu
          administrador desde Ajustes → Canales), puedes <strong>simular mensajes</strong> para
          probar cómo responde la IA sin arriesgar una conversación real.
        </Callout>
      </Section>

      <Section n={4} title="Pipeline: tu embudo, solo" kicker="Nuevo → Interesado → En proceso de compra → Cliente → Perdido">
        <p>
          Un tablero de columnas donde cada contacto se acomoda solo, según la etapa
          que le asignó la IA en su última conversación. No mueves tarjetas a mano.
        </p>
      </Section>

      <Section n={5} title="Contactos" kicker="Tu agenda">
        <p>
          Busca por nombre, correo o empresa; da de alta uno nuevo a mano si hace
          falta; entra a la ficha de cualquiera para ver su historial completo.
        </p>
      </Section>

      <Section n={6} title="Productos: el corazón de la IA" kicker="Cuanto mejor lo llenes, mejor te entiende la IA">
        <p>
          Aquí cargas lo que vendes de verdad — no importa el rubro. Por cada
          producto: nombre y precio (la IA responde con cifras exactas), categoría y
          descripción (contexto extra), y palabras clave (todas las formas en que un
          cliente podría nombrarlo).
        </p>
        <p>
          Un producto <strong>inactivo</strong> deja de contar para la IA sin que tengas que
          borrarlo.
        </p>
      </Section>

      <Section n={7} title="Ajustes" kicker="Solo administradores — todo sin tocar código">
        <FeatureGrid
          items={[
            { label: "Marca", text: "Nombre del negocio, logo y color — se aplican a toda la interfaz." },
            { label: "Inteligencia artificial", text: "Elegir entre IA básica o avanzada." },
            { label: "Colores", text: "La lista de colores que la IA reconoce al leer un mensaje." },
            { label: "Canales", text: "Las credenciales de WhatsApp e Instagram, cuando las tengas." },
          ]}
        />
      </Section>

      <Section n={8} title="Equipo" kicker="Sumar a alguien más">
        <p>
          Invita a compañeros con su propio correo y contraseña. Elige su rol:
          <strong> Administrador</strong> (ve Ajustes y Equipo) o <strong>Agente</strong> (usa la
          bandeja, el pipeline y contactos, sin tocar la configuración).
        </p>
      </Section>

      <Section n={9} title="La IA, explicada simple" kicker="Dos motores, un mismo resultado">
        <FeatureGrid
          items={[
            { label: "IA básica (incluida)", text: "Activada desde el primer día, sin costo. Reconoce productos, tallas, colores e intención de compra por patrones del lenguaje." },
            { label: "IA avanzada (opcional)", text: "Entiende matices reales de la conversación. Se activa en Ajustes con una clave de API propia." },
          ]}
        />
        <p>Puedes cambiar entre una y otra cuando quieras, sin perder nada de tu historial.</p>
      </Section>

      <Section n={10} title="Preguntas frecuentes" kicker="Lo que suele preguntarse la primera semana">
        <div className="divide-y divide-black/10 dark:divide-white/10">
          <details className="group py-3 first:pt-0">
            <summary className="cursor-pointer list-none font-medium marker:content-none">
              Olvidé mi contraseña, ¿qué hago?
            </summary>
            <p className="mt-2 opacity-70">
              Pídele a otro administrador de tu equipo que te dé de alta de nuevo desde
              Equipo, o contacta a quien te vendió el CRM.
            </p>
          </details>
          <details className="group py-3">
            <summary className="cursor-pointer list-none font-medium marker:content-none">
              La IA se equivocó con un cliente, ¿lo puedo corregir?
            </summary>
            <p className="mt-2 opacity-70">
              Sí — abre esa conversación y pulsa <strong>Reanalizar</strong>. Si el error se
              repite seguido, revisa que el producto y sus palabras clave estén bien
              cargados en Productos: casi siempre es la causa.
            </p>
          </details>
          <details className="group py-3">
            <summary className="cursor-pointer list-none font-medium marker:content-none">
              ¿Necesito saber de tecnología para usar esto?
            </summary>
            <p className="mt-2 opacity-70">
              No. Todo lo que ves aquí se hace con clics, desde el navegador. Lo único
              técnico (conectar WhatsApp/Instagram de verdad) lo hace una sola vez tu
              administrador.
            </p>
          </details>
          <details className="group py-3">
            <summary className="cursor-pointer list-none font-medium marker:content-none">
              ¿Mis datos se comparten con alguien más?
            </summary>
            <p className="mt-2 opacity-70">
              No. Tu base de datos es tuya, separada de cualquier otro negocio que use
              este mismo sistema.
            </p>
          </details>
        </div>
      </Section>
    </div>
  );
}
