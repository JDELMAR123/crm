import { SkeletonConversation } from "@/components/Skeleton";

/** Se muestra al instante al cambiar de conversación, mientras carga el hilo. */
export default function Loading() {
  return <SkeletonConversation />;
}
