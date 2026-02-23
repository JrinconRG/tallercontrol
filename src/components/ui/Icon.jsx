import * as Icons from "lucide-react";

export function Icon({ name, size = 20, className, color = "currentColor" }) {
  const LucideIcon = Icons[name];
  return LucideIcon ? <LucideIcon size={size} className={className} color={color} /> : null;
}
