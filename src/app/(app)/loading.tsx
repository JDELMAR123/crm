import { SkeletonPanel } from "@/components/Skeleton";

/**
 * Se muestra al instante en cada cambio de panel mientras los datos llegan
 * del servidor, en vez de dejar la pantalla congelada.
 */
export default function Loading() {
  return <SkeletonPanel />;
}
