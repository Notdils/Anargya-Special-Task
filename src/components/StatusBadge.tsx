import { STATUS } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export default function StatusBadge({ s }: { s: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full border px-3 py-0.5 font-outfit text-xs md:text-sm ${STATUS[s].cls}`}>
      {STATUS[s].label}
    </span>
  );
}
