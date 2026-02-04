import "./Card.css";
export default function Card({ title, description ,children }) {
    return (
        <div className="card" >
            <div className="card-title">
                <h3 className="card-title-text">{title}</h3>
            </div>
            {description && (
            <div className="card-description">
                <p className="card-description-text">{description}</p>
            </div>
            )}
            <div className="card-body">
                {children}
            </div>
        </div>
    )
}