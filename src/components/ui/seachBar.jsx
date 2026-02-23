// SearchBar.jsx
import { Icon } from "../ui/Icon";
import "./seachBar.css";


export default function SearchBar({ value, onChange, placeholder = "Buscar..." }) {
    return (
        <div className="search-group">
            <Icon name="Search" size={18} className="search-icon" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="search-input"
            />
        </div>
    );
}
