describe("SEGURIDAD - Rutas privadas", () => {
  it("CP1: nomina requiere rol gerente", () => {
    cy.visitAuthenticated("/gerente/nomina/fecha", "trabajador");
    cy.url().should("not.include", "/gerente/nomina/fecha");
  });

  it("CP2: historial gerente requiere rol gerente", () => {
    cy.visitAuthenticated("/gerente/historial", "trabajador");
    cy.url().should("not.include", "/gerente/historial");
  });

  it("CP3: no autorizado requiere sesion privada", () => {
    cy.clearLocalStorage();
    cy.visit("/no-autorizado");
    cy.url().should("not.include", "/no-autorizado");
  });

  it("CP4: ruta publica no crea sesion automaticamente", () => {
    cy.visit("/");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("tallercontrol-auth")).to.be.null;
    });
  });

  it("CP5: ruta inexistente no permite saltar autenticacion", () => {
    cy.clearLocalStorage();
    cy.visit("/gerente/desconocida", { failOnStatusCode: false });
    cy.get("body").should("not.contain", "Dashboard");
    cy.get("body").should("not.contain", "Empleados");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("tallercontrol-auth")).to.be.null;
    });
  });
});
