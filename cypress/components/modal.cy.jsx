import Modal from "../../src/components/modal/Modal";

describe("COMPONENTE - Modal", () => {
  it("CP1: no renderiza cuando esta cerrado", () => {
    cy.mount(<Modal isOpen={false} title="Confirmar">Contenido</Modal>);
    cy.contains("Confirmar").should("not.exist");
  });

  it("CP2: renderiza titulo y contenido", () => {
    cy.mount(<Modal isOpen title="Confirmar">Contenido</Modal>);
    cy.contains("Confirmar").should("be.visible");
    cy.contains("Contenido").should("be.visible");
  });

  it("CP3: llama onClose desde cancelar", () => {
    cy.mount(<Modal isOpen title="Confirmar" onClose={cy.stub().as("close")}>Contenido</Modal>);
    cy.contains("button", "Cancelar").click();
    cy.get("@close").should("have.been.calledOnce");
  });

  it("CP4: llama onConfirm desde boton confirmar", () => {
    cy.mount(<Modal isOpen title="Confirmar" onConfirm={cy.stub().as("confirm")} confirmText="Guardar">Contenido</Modal>);
    cy.contains("button", "Guardar").click();
    cy.get("@confirm").should("have.been.calledOnce");
  });

  it("CP5: muestra estado de carga", () => {
    cy.mount(<Modal isOpen title="Confirmar" loading onConfirm={() => {}} confirmText="Guardar">Contenido</Modal>);
    cy.contains("Procesando...").should("be.visible");
  });
});
