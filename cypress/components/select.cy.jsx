import Select from "../../src/components/ui/select";

describe("COMPONENTE - Select", () => {
  const options = [
    { value: "uno", label: "Uno" },
    { value: "dos", label: "Dos" },
  ];

  it("CP1: muestra placeholder", () => {
    cy.mount(<Select value="" onChange={() => {}} options={options} placeholder="Seleccione" />);
    cy.get("select").find("option").first().should("contain", "Seleccione");
  });

  it("CP2: renderiza opciones", () => {
    cy.mount(<Select value="" onChange={() => {}} options={options} />);
    cy.get("option").should("have.length", 3);
  });

  it("CP3: muestra valor seleccionado", () => {
    cy.mount(<Select value="dos" onChange={() => {}} options={options} />);
    cy.get("select").should("have.value", "dos");
  });

  it("CP4: llama onChange al seleccionar", () => {
    cy.mount(<Select value="" onChange={cy.stub().as("change")} options={options} />);
    cy.get("select").select("uno");
    cy.get("@change").should("have.been.calledWith", "uno");
  });

  it("CP5: usa etiqueta Sin nombre si falta label", () => {
    cy.mount(<Select value="" onChange={() => {}} options={[{ value: "x" }]} />);
    cy.get("option").last().should("contain", "Sin nombre");
  });
});
