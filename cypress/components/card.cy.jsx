import Card from "../../src/components/card/Card";

describe("COMPONENTE - Card", () => {
  it("CP1: muestra titulo", () => {
    cy.mount(<Card title="Resumen" />);
    cy.contains("Resumen").should("be.visible");
  });

  it("CP2: muestra descripcion si existe", () => {
    cy.mount(<Card title="Resumen" description="Datos del proceso" />);
    cy.contains("Datos del proceso").should("be.visible");
  });

  it("CP3: renderiza contenido hijo", () => {
    cy.mount(<Card title="Resumen"><button>Accion</button></Card>);
    cy.contains("button", "Accion").should("be.visible");
  });

  it("CP4: aplica clase personalizada", () => {
    cy.mount(<Card title="Resumen" className="qa-card" />);
    cy.get(".card").should("have.class", "qa-card");
  });

  it("CP5: aplica borde personalizado", () => {
    cy.mount(<Card title="Resumen" borderColor="rgb(255, 0, 0)" />);
    cy.get(".card").should("have.css", "border-top-color", "rgb(255, 0, 0)");
  });
});
