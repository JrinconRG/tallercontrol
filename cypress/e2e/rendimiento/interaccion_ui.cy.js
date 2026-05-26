describe("RENDIMIENTO - Interaccion UI", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/vw_fase_actual*", { body: [] });
    cy.intercept("GET", "**/vw_procesos_activos*", { body: [] });
    cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [] });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
  });

  it("CP1: boton crear proceso responde al click", () => {
    cy.get('[data-cy="btn-crear-proceso"]').click();
    cy.contains("Crear proceso").should("be.visible");
  });

  it("CP2: modal cierra sin demora perceptible", () => {
    cy.get('[data-cy="btn-crear-proceso"]').click();
    cy.contains("button", /Cancelar/i).click();
    cy.get(".modal-overlay").should("not.exist");
  });

  it("CP3: navegacion a historial responde", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", { body: [] });
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.url().should("include", "/trabajador/historial");
  });

  it("CP4: recarga no deja pantalla en blanco", () => {
    cy.reload();
    cy.get("body").should("not.be.empty");
  });

  it("CP5: contenido principal queda visible despues de cargar", () => {
    cy.contains(/procesos/i).should("be.visible");
  });
});
