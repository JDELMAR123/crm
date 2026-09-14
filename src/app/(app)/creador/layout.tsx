import { JetBrains_Mono } from "next/font/google";
import "./hacker-theme.css";

const hackerMono = JetBrains_Mono({
  variable: "--font-hk-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

/**
 * El panel del creador tiene su propio look (terminal negro / verde neón)
 * que cubre TODA la página, incluido el menú de arriba — exclusivo de esta
 * sección, el resto del CRM que ve el cliente no cambia. El interruptor
 * real (clase en <body>) vive en CreatorThemeSync, montado de forma
 * permanente en el layout de más arriba, para que no dependa de que esta
 * sección se "monte" de cero cada vez.
 */
export default function CreadorLayout({ children }: LayoutProps<"/creador">) {
  return (
    <div className={`hk-content ${hackerMono.variable}`}>
      <div className="hk-scan-overlay" aria-hidden="true" />
      {children}
    </div>
  );
}
