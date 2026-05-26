describe("SEGURIDAD - Datos sensibles", () => {
  it("CP1: el DOM no muestra contrasena escrita", () => {
    cy.visit("/");
    cy.get(".input-login").last().type("ClaveSecreta123");
    cy.get("body").should("not.contain", "ClaveSecreta123");
  });

  it("CP2: sesion mock no contiene token real", () => {
    cy.intercept("GET", "**/vw_fase_actual*", { body: [] });
    cy.intercept("GET", "**/vw_procesos_activos*", { body: [] });
    cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [] });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("tallercontrol-auth")).not.to.include("eyJ");
    });
  });

  it("CP3: no se guardan credenciales al fallar validacion", () => {
    cy.visit("/");
    cy.get('button[type="submit"]').click();
    cy.window().then((win) => {
      expect(win.localStorage.getItem("tallercontrol-auth")).to.be.null;
    });
  });

  it("CP4: inputs no usan autocomplete inseguro explicito", () => {
    cy.visit("/");
    cy.get(".input-login").each(($input) => {
      expect($input.attr("autocomplete")).not.to.eq("on");
    });
  });

  it("CP5: respuesta 401 no deja entrar a ruta protegida", () => {
    cy.clearLocalStorage();
    cy.visit("/trabajador/historial", { failOnStatusCode: false });
    cy.url().should("not.include", "/trabajador/historial");
  });
});
