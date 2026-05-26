describe("REGRESION - Login", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("CP1: muestra el formulario de inicio de sesion", () => {
    cy.arrange("login publico cargado");

    cy.act("observar formulario inicial");

    cy.verifyStep("formulario visible y auto-validable", () => {
      cy.contains(/Iniciar Sesi/i).should("be.visible");
      cy.get(".input-login").should("have.length", 2);
      cy.get('button[type="submit"]').should("be.visible");
    });
  });

  it("CP2: permite escribir usuario y contrasena", () => {
    cy.arrange("formulario limpio");

    cy.act("escribir credenciales", () => {
      cy.get(".input-login").first().type("trabajador");
      cy.get(".input-login").last().type("Trabajador26");
    });

    cy.verifyStep("valores quedan en los inputs", () => {
      cy.get(".input-login").first().should("have.value", "trabajador");
      cy.get(".input-login").last().should("have.value", "Trabajador26");
    });
  });

  it("CP3: mantiene el boton de envio habilitado al cargar la pagina", () => {
    cy.arrange("formulario inicial");

    cy.act("consultar boton de envio");

    cy.verifyStep("boton habilitado", () => {
      cy.get('button[type="submit"]').should("not.be.disabled");
    });
  });

  it("CP4: valida campos requeridos antes de intentar iniciar sesion", () => {
    cy.arrange("formulario sin datos");

    cy.act("intentar enviar sin credenciales", () => {
      cy.get('button[type="submit"]').click();
    });

    cy.verifyStep("no crea sesion ni sale del login", () => {
      cy.location("pathname").should("eq", "/");
      cy.window().then((win) => {
        expect(win.localStorage.getItem("tallercontrol-auth")).to.be.null;
      });
      cy.get(".input-login").first().should("have.value", "");
      cy.get(".input-login").last().should("have.value", "");
    });
  });

  it("CP5: conserva al usuario en login cuando no hay sesion", () => {
    cy.arrange("sin sesion activa", () => {
      cy.clearCookies();
      cy.clearLocalStorage();
    });

    cy.act("visitar ruta privada", () => {
      cy.visit("/trabajador/inicio");
    });

    cy.verifyStep("se muestra login y no contenido privado", () => {
      cy.contains(/Iniciar Sesi/i).should("be.visible");
      cy.get('input[type="password"]').should("have.length", 1);
      cy.contains(/Por iniciar|En curso/i).should("not.exist");
    });
  });
});
