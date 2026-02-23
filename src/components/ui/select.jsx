// Select.jsx
import "./select.css";
import { Icon } from "../ui/Icon";

export default function Select({ value, onChange, options, placeholder = "Seleccionar..." }) {
    return (
        <div className="select-wrapper">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="select-filter"
            >
                <option value="">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <Icon name="ChevronDown" size={16} className="select-icon" />
        </div>
    );
}