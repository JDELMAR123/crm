import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CHANNEL_LABEL } from "@/lib/channels";
import { StageBadge, InterestBar } from "@/components/StageBadge";
import DeleteContactButton from "@/components/DeleteContactButton";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-black/10 py-3 text-sm dark:border-white/10">
      <dt className="opacity-70">{label}</dt>
      <dd className="col-span-2 whitespace-pre-wrap">{value || "—"}</dd>
    </div>
  );
}

export default async function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      conversations: { orderBy: { lastMessageAt: "desc" } },
    },
  });
  if (!contact) notFound();

  return (
    <div className="space-y-6">
      <div className="text-sm opacity-70">
        <Link href="/contacts" className="hover:underline">
          Contactos
        </Link>{" "}
        / {contact.firstName} {contact.lastName}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-semibold">
          {contact.firstName} {contact.lastName}
          <StageBadge stage={contact.stage} />
        </h1>
        <div className="flex gap-3">
          <Link
            href={`/contacts/${contact.id}/edit`}
            className="rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/20"
          >
            Editar
          </Link>
          <DeleteContactButton id={contact.id} />
        </div>
      </div>

      {contact.aiAnalyzedAt && (
        <div className="space-y-2 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="font-medium">Sectorización IA</span>
            <InterestBar score={contact.interestScore} />
          </div>
          <p><span className="opacity-60">Quiere: </span>{contact.aiDesired || "—"}</p>
          <p><span className="opacity-60">Resumen: </span>{contact.aiSummary || "—"}</p>
          <p><span className="opacity-60">Siguiente paso: </span>{contact.aiNextStep || "—"}</p>
        </div>
      )}

      <dl>
        <Row label="Email" value={contact.email} />
        <Row label="Teléfono" value={contact.phone} />
        <Row label="Empresa" value={contact.company} />
        <Row label="WhatsApp" value={contact.whatsappId} />
        <Row label="Instagram" value={contact.instagramId} />
        <Row label="Notas" value={contact.notes} />
        <Row label="Creado" value={contact.createdAt.toLocaleString("es-ES")} />
      </dl>

      {contact.conversations.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Conversaciones</h2>
          <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
            {contact.conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/inbox/${c.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="truncate text-sm">{c.lastMessagePreview ?? "—"}</span>
                  <span className="shrink-0 text-xs opacity-50">
                    {CHANNEL_LABEL[c.channel]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
