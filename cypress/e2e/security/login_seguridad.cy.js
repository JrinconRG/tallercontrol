describe("SEGURIDAD - Login", () => {
  beforeEach(() => cy.visit("/"));

  it("CP1: campo de contrasena usa tipo password", () => {
    cy.arrange("login cargado");
    cy.act("consultar campo de contrasena");
    cy.verifyStep("el input oculta el texto", () => {
      cy.get(".input-login").last().should("have.attr", "type", "password");
    });
  });

  it("CP2: no envia formulario con usuario vacio", () => {
    cy.arrange("solo contrasena escrita", () => {
      cy.get(".input-login").last().type("secreto");
    });
    cy.act("enviar formulario", () => {
      cy.get('button[type="submit"]').click();
    });
    cy.verifyStep("no crea sesion", () => {
      cy.location("pathname").should("eq", "/");
      cy.window().then((win) => {
        expect(win.localStorage.getItem("tallercontrol-auth")).to.be.null;
      });
    });
  });

  it("CP3: no envia formulario con contrasena vacia", () => {
    cy.arrange("solo usuario escrito", () => {
      cy.get(".input-login").first().type("trabajador");
    });
    cy.act("enviar formulario", () => {
      cy.get('button[type="submit"]').click();
    });
    cy.verifyStep("no crea sesion", () => {
      cy.location("pathname").should("eq", "/");
      cy.window().then((win) => {
        expect(win.localStorage.getItem("tallercontrol-auth")).to.be.null;
      });
    });
  });

  it("CP4: no renderiza script escrito en usuario", () => {
    cy.arrange("payload tipo script");
    cy.act("escribir payload en usuario", () => {
      cy.get(".input-login").first().type("<script>alert(1)</script>");
    });
    cy.verifyStep("el payload no se ejecuta como script", () => {
      cy.get("script").should("not.contain", "alert(1)");
      cy.get(".input-login").first().should("have.value", "<script>alert(1)</script>");
    });
  });

  it("CP5: no expone token en la pantalla de login", () => {
    cy.arrange("login publico sin sesion");
    cy.act("inspeccionar contenido visible");
    cy.verifyStep("no hay tokens visibles", () => {
      cy.get("body").should("not.contain", "Bearer");
      cy.get("body").should("not.contain", "access_token");
    });
  });
});
