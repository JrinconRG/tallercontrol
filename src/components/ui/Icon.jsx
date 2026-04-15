import * as Icons from "lucide-react";
import PropTypes from "prop-types";

export function Icon({ name, size = 20, className, color = "currentColor" }) {
  const LucideIcon = Icons[name];
  return LucideIcon ? (
    <LucideIcon size={size} className={className} color={color} />
  ) : null;
}
Icon.propTypes = {
  name: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  color: PropTypes.string,
};
