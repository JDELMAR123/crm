import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/ContactForm";
import { updateContact } from "@/lib/actions/contacts";

export const dynamic = "force-dynamic";

export default async function EditContactPage({
  params,
}: PageProps<"/contacts/[id]/edit">) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) notFound();

  const action = updateContact.bind(null, contact.id);

  return (
    <div className="space-y-6">
      <div className="text-sm opacity-70">
        <Link href="/contacts" className="hover:underline">
          Contactos
        </Link>{" "}
        /{" "}
        <Link href={`/contacts/${contact.id}`} className="hover:underline">
          {contact.firstName} {contact.lastName}
        </Link>{" "}
        / Editar
      </div>
      <h1 className="text-2xl font-semibold">Editar contacto</h1>
      <ContactForm
        action={action}
        defaultValues={contact}
        submitLabel="Guardar cambios"
        cancelHref={`/contacts/${contact.id}`}
      />
    </div>
  );
}
