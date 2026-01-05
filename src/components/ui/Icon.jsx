import * as Icons from "lucide-react";

export function Icon({ name, size = 20, className }) {
  const LucideIcon = Icons[name];
  return LucideIcon ? <LucideIcon size={size} className={className} /> : null;
}
