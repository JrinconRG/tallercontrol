describe("SEGURIDAD - Acceso por roles", () => {
  it("CP1: trabajador no entra al dashboard de gerente", () => {
    cy.visitAuthenticated("/gerente", "trabajador");
    cy.url().should("not.include", "/gerente");
  });

  it("CP2: trabajador no entra a empleados", () => {
    cy.visitAuthenticated("/gerente/empleados", "trabajador");
    cy.url().should("not.include", "/gerente/empleados");
  });

  it("CP3: trabajador no entra a tarifas", () => {
    cy.visitAuthenticated("/gerente/tarifas", "trabajador");
    cy.url().should("not.include", "/gerente/tarifas");
  });

  it("CP4: gerente no entra a inicio trabajador", () => {
    cy.visitAuthenticated("/trabajador/inicio", "gerente");
    cy.url().should("not.include", "/trabajador/inicio");
  });

  it("CP5: gerente no entra a historial trabajador", () => {
    cy.visitAuthenticated("/trabajador/historial", "gerente");
    cy.url().should("not.include", "/trabajador/historial");
  });
});
