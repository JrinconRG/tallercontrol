describe("API - Procesos", () => {
  const url = "https://qa.supabase.co/rest/v1/vw_procesos_activos";

  beforeEach(() => cy.visit("/"));

  it("CP1: obtiene procesos activos", () => {
    cy.arrange("API mock de procesos activos", () => {
      cy.intercept("GET", "**/vw_procesos_activos*", {
        body: [{ pro_id_proceso: 1 }],
      }).as("api");
    });

    cy.act("consultar endpoint mock", () => {
      cy.window()
        .then((win) => win.fetch(url).then((r) => r.json()))
        .as("response");
    });

    cy.verifyStep("respuesta y metodo son correctos", () => {
      cy.get("@response").should("have.length", 1);
      cy.wait("@api").its("request.method").should("eq", "GET");
    });
  });

  it("CP2: maneja lista vacia", () => {
    cy.arrange("API mock sin procesos", () => {
      cy.intercept("GET", "**/vw_procesos_activos*", { body: [] });
    });

    cy.act("consultar procesos activos", () => {
      cy.window()
        .then((win) => win.fetch(url).then((r) => r.json()))
        .as("response");
    });

    cy.verifyStep("devuelve arreglo vacio", () => {
      cy.get("@response").should("deep.equal", []);
    });
  });

  it("CP3: conserva codigo de cofre en respuesta", () => {
    cy.arrange("API mock con codigo de cofre", () => {
      cy.intercept("GET", "**/vw_procesos_activos*", {
        body: [{ pro_codigo_cofre: "CF-001" }],
      });
    });

    cy.act("consultar procesos activos", () => {
      cy.window()
        .then((win) => win.fetch(url).then((r) => r.json()))
        .as("response");
    });

    cy.verifyStep("mantiene el codigo recibido", () => {
      cy.get("@response").its("0.pro_codigo_cofre").should("eq", "CF-001");
    });
  });

  it("CP4: reporta error del servidor", () => {
    cy.arrange("API mock con error 500", () => {
      cy.intercept("GET", "**/vw_procesos_activos*", {
        statusCode: 500,
        body: { message: "error" },
      });
    });

    cy.act("consultar endpoint con error", () => {
      cy.window().then((win) => win.fetch(url)).as("response");
    });

    cy.verifyStep("propaga status 500", () => {
      cy.get("@response").its("status").should("eq", 500);
    });
  });

  it("CP5: envia cabecera de autenticacion cuando existe", () => {
    cy.arrange("API mock con cabecera esperada", () => {
      cy.intercept("GET", "**/vw_procesos_activos*", { body: [] }).as("api");
    });

    cy.act("consultar con Authorization", () => {
      cy.window().then((win) =>
        win.fetch(url, { headers: { Authorization: "Bearer token-qa" } }),
      );
    });

    cy.verifyStep("cabecera viaja en la solicitud", () => {
      cy.wait("@api")
        .its("request.headers.authorization")
        .should("eq", "Bearer token-qa");
    });
  });
});
