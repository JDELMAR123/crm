import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// En runtime usamos la conexión con pooler (mejor para serverless). La
// integración de Neon en Vercel también expone POSTGRES_PRISMA_URL / POSTGRES_URL.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

/** Errores transitorios del protocolo/pool que suelen resolverse al reintentar. */
function isTransient(err: unknown): boolean {
  const e = err as { message?: string; code?: string };
  const msg = e?.message ?? "";
  return (
    e?.code === "P2024" ||
    e?.code === "P2039" ||
    msg.includes("08P01") ||
    msg.includes("bind message") ||
    msg.includes("prepared statement") ||
    msg.includes("Connection terminated") ||
    msg.includes("Connection closed")
  );
}

function makeClient() {
  const adapter = new PrismaPg({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  return new PrismaClient({
    adapter,
    transactionOptions: { maxWait: 10_000, timeout: 20_000 },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastErr: unknown;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            lastErr = err;
            if (!isTransient(err) || attempt === 2) throw err;
            await new Promise((r) => setTimeout(r, 60 * (attempt + 1)));
          }
        }
        throw lastErr;
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof makeClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
