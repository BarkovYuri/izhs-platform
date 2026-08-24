import { Flame } from "lucide-react";

export default function PromoBadge({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`badge badge-promo !text-[11px] !py-0.5 !px-2 ${className}`}>
      <Flame size={12} />
      {label}
    </span>
  );
}
