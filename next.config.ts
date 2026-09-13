import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Reutiliza en el cliente los paneles visitados hace poco (p. ej. volver
    // a Contactos tras pasar por Pipeline) sin volver a pedirlos al servidor.
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
