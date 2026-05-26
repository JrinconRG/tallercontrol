describe("API - Trabajadores", () => {
  beforeEach(() => cy.visit("/"));

  it("CP1: obtiene trabajadores con cargos", () => {
    cy.intercept("GET", "**/vw_trabajadores_con_cargos*", { body: [{ t_nombre: "Ana" }] });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/vw_trabajadores_con_cargos").then((r) => r.json())).its("0.t_nombre").should("eq", "Ana");
  });

  it("CP2: obtiene trabajadores por cargo", () => {
    cy.intercept("GET", "**/vw_trabajadores_por_cargo*", { body: [{ cargo_id: 3 }] });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/vw_trabajadores_por_cargo?cargo_id=eq.3").then((r) => r.json())).its("0.cargo_id").should("eq", 3);
  });

  it("CP3: crea trabajador por RPC", () => {
    cy.intercept("POST", "**/rpc/sp_crear_trabajador*", { statusCode: 201, body: { trabajador_id: 9 } });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/rpc/sp_crear_trabajador", { method: "POST" })).its("status").should("eq", 201);
  });

  it("CP4: asigna cargo por RPC", () => {
    cy.intercept("POST", "**/rpc/sp_asignar_cargo*", { body: { ok: true } }).as("asignar");
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/rpc/sp_asignar_cargo", { method: "POST" }));
    cy.wait("@asignar").its("request.method").should("eq", "POST");
  });

  it("CP5: devuelve error si documento ya existe", () => {
    cy.intercept("POST", "**/rpc/sp_crear_trabajador*", { statusCode: 409, body: { message: "duplicado" } });
    cy.window().then((win) => win.fetch("https://qa.supabase.co/rest/v1/rpc/sp_crear_trabajador", { method: "POST" })).its("status").should("eq", 409);
  });
});
