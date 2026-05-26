import SearchBar from "../../src/components/ui/seachBar";

describe("COMPONENTE - SearchBar", () => {
  it("CP1: muestra placeholder por defecto", () => {
    cy.mount(<SearchBar value="" onChange={() => {}} />);
    cy.get("input").should("have.attr", "placeholder", "Buscar...");
  });

  it("CP2: muestra placeholder personalizado", () => {
    cy.mount(<SearchBar value="" onChange={() => {}} placeholder="Buscar empleado" />);
    cy.get("input").should("have.attr", "placeholder", "Buscar empleado");
  });

  it("CP3: muestra valor controlado", () => {
    cy.mount(<SearchBar value="Ana" onChange={() => {}} />);
    cy.get("input").should("have.value", "Ana");
  });

  it("CP4: llama onChange al escribir", () => {
    cy.mount(<SearchBar value="" onChange={cy.stub().as("change")} />);
    cy.get("input").type("abc");
    cy.get("@change").should("have.been.called");
  });

  it("CP5: renderiza icono de busqueda", () => {
    cy.mount(<SearchBar value="" onChange={() => {}} />);
    cy.get(".search-icon").should("exist");
  });
});
