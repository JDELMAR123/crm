import { JetBrains_Mono } from "next/font/google";
import "./hacker-theme.css";
import HackerBodyEffect from "./_components/HackerBodyEffect";

const hackerMono = JetBrains_Mono({
  variable: "--font-hk-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

/**
 * El panel del creador tiene su propio look (terminal negro / verde neón)
 * que cubre TODA la página, incluido el menú de arriba — exclusivo de esta
 * sección, el resto del CRM que ve el cliente no cambia.
 */
export default function CreadorLayout({ children }: LayoutProps<"/creador">) {
  return (
    <>
      <HackerBodyEffect fontVariable={hackerMono.variable} />
      {children}
    </>
  );
}
