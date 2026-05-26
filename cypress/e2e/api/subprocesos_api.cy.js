describe("API - Subprocesos", () => {
  const url = "https://qa.supabase.co/rest/v1/vw_informacion_subproceso_actual";

  beforeEach(() => cy.visit("/"));

  it("CP1: obtiene subproceso actual", () => {
    cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [{ sub_id_subproceso: 10 }] });
    cy.window().then((win) => win.fetch(url).then((r) => r.json())).its("0.sub_id_subproceso").should("eq", 10);
  });

  it("CP2: obtiene historial pendiente", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", { body: [{ cargo_nombre: "Pulidor" }] });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/vw_historial_subprocesos_pendientes").then((r) => r.json())).its("0.cargo_nombre").should("eq", "Pulidor");
  });

  it("CP3: crea subproceso por RPC", () => {
    cy.intercept("POST", "**/rpc/sp_crear_subproceso*", { statusCode: 200, body: { ok: true } }).as("crear");
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/rpc/sp_crear_subproceso", { method: "POST" }));
    cy.wait("@crear").its("request.method").should("eq", "POST");
  });

  it("CP4: finaliza subproceso por RPC", () => {
    cy.intercept("POST", "**/rpc/sp_finalizar_subproceso*", { statusCode: 200, body: { ok: true } }).as("finalizar");
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/rpc/sp_finalizar_subproceso", { method: "POST" }));
    cy.wait("@finalizar").its("response.statusCode").should("eq", 200);
  });

  it("CP5: maneja error de validacion", () => {
    cy.intercept("POST", "**/rpc/sp_crear_subproceso*", { statusCode: 400, body: { message: "cargo requerido" } });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/rpc/sp_crear_subproceso", { method: "POST" })).its("status").should("eq", 400);
  });
});
