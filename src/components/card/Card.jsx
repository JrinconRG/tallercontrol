import "./Card.css";
export default function Card({ title, description, children, className = "",
    style = {},
    borderColor }) {
    return (
        <div className={`card ${className}`}
            style={{
                border: borderColor ? `2px solid ${borderColor}` : `2px solid var(--neutral-400)`,
                ...style
            }}
        >
            <div className="card-title">
                <h3 className="card-title-text">{title}</h3>
            </div>
            {
                description && (
                    <div className="card-description">
                        <p className="card-description-text">{description}</p>
                    </div>
                )
            }
            <div className="card-body">
                {children}
            </div>
        </div >
    )
}