import "./Card.css";
export default function Card({ title, description ,progress }) {
    return (
        <div className="card" >
            <div className="card-title">
                <h3 className="card-title-text">{title}</h3>
            </div>
            <div className="card-description">
                <p className="card-description-text">{description}</p>
            </div>
            <div className="card-progress">
                {progress}
            </div>
        </div>
    )
}