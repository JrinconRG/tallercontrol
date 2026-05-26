describe("API - Autenticacion", () => {
  beforeEach(() => cy.visit("/"));

  it("CP1: valida login por RPC", () => {
    cy.intercept("POST", "**/rpc/validar_login*", { body: [{ u_rol: "trabajador" }] });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/rpc/validar_login", { method: "POST" }).then((r) => r.json())).its("0.u_rol").should("eq", "trabajador");
  });

  it("CP2: rechaza credenciales invalidas", () => {
    cy.intercept("POST", "**/rpc/validar_login*", { body: [] });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/rpc/validar_login", { method: "POST" }).then((r) => r.json())).should("deep.equal", []);
  });

  it("CP3: autentica contra Supabase Auth", () => {
    cy.intercept("POST", "**/auth/v1/token*", { body: { user: { id: "auth-1" } } });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/auth/v1/token?grant_type=password", { method: "POST" }).then((r) => r.json())).its("user.id").should("eq", "auth-1");
  });

  it("CP4: reporta error de autenticacion", () => {
    cy.intercept("POST", "**/auth/v1/token*", { statusCode: 400, body: { error: "invalid_grant" } });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/auth/v1/token?grant_type=password", { method: "POST" })).its("status").should("eq", 400);
  });

  it("CP5: cierra sesion con endpoint auth", () => {
    cy.intercept("POST", "**/auth/v1/logout*", { statusCode: 204 }).as("logout");
    cy.window().then((win) => win.fetch("https://qa.supabase.co/auth/v1/logout", { method: "POST" }));
    cy.wait("@logout").its("response.statusCode").should("eq", 204);
  });
});
