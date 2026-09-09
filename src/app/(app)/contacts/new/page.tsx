import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { createContact } from "@/lib/actions/contacts";

export default function NewContactPage() {
  return (
    <div className="space-y-6">
      <div className="text-sm opacity-70">
        <Link href="/contacts" className="hover:underline">
          Contactos
        </Link>{" "}
        / Nuevo
      </div>
      <h1 className="text-2xl font-semibold">Nuevo contacto</h1>
      <ContactForm
        action={createContact}
        submitLabel="Crear contacto"
        cancelHref="/contacts"
      />
    </div>
  );
}
