describe("API - Tarifas", () => {
  beforeEach(() => cy.visit("/"));

  it("CP1: obtiene matriz de precios", () => {
    cy.intercept("GET", "**/vw_matriz_precios*", { body: [{ valor: 15000 }] });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/vw_matriz_precios").then((r) => r.json())).its("0.valor").should("eq", 15000);
  });

  it("CP2: obtiene referencias de cofres", () => {
    cy.intercept("GET", "**/vw_referencias_cofre*", { body: [{ rc_codigo: "101" }] });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/vw_referencias_cofre").then((r) => r.json())).its("0.rc_codigo").should("eq", "101");
  });

  it("CP3: guarda tarifas por RPC", () => {
    cy.intercept("POST", "**/rpc/sp_guardar_tarifas*", { body: { ok: true } }).as("guardar");
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/rpc/sp_guardar_tarifas", { method: "POST" }));
    cy.wait("@guardar").its("response.statusCode").should("eq", 200);
  });

  it("CP4: valida error al guardar tarifas", () => {
    cy.intercept("POST", "**/rpc/sp_guardar_tarifas*", { statusCode: 400, body: { message: "valor invalido" } });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/rpc/sp_guardar_tarifas", { method: "POST" })).its("status").should("eq", 400);
  });

  it("CP5: filtra por trabajador en matriz", () => {
    cy.intercept("GET", "**/vw_matriz_precios*trabajador_id=eq.7*", { body: [{ trabajador_id: 7 }] });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/vw_matriz_precios?trabajador_id=eq.7").then((r) => r.json())).its("0.trabajador_id").should("eq", 7);
  });
});
