describe("REGRESION - Seguridad y roles", () => {
  describe("Rol trabajador", () => {
    it("CP1: trabajador es redirigido si intenta entrar a /gerente", () => {
      cy.visitAuthenticated("/gerente", "trabajador");
      cy.url().should("not.include", "/gerente");
    });

    it("CP2: trabajador no puede entrar a /gerente/empleados", () => {
      cy.visitAuthenticated("/gerente/empleados", "trabajador");
      cy.url().should("not.include", "/gerente/empleados");
    });

    it("CP3: trabajador no puede entrar a /gerente/tarifas", () => {
      cy.visitAuthenticated("/gerente/tarifas", "trabajador");
      cy.url().should("not.include", "/gerente/tarifas");
    });

    it("CP4: trabajador si puede entrar a /trabajador/inicio", () => {
      cy.intercept("GET", "**/vw_fase_actual*", { body: [] });
      cy.intercept("GET", "**/vw_procesos_activos*", { body: [] });
      cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [] });
      cy.visitAuthenticated("/trabajador/inicio", "trabajador");
      cy.url().should("include", "/trabajador/inicio");
    });
  });

  describe("Sin sesion", () => {
    it("CP5: redirige al login si no hay sesion activa", () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit("/trabajador/inicio");
      cy.url().should("not.include", "/trabajador");
    });
  });
});
