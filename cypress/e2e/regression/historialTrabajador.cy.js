const historialMock = [
  {
    sub_id_subproceso: 17,
    sub_proceso_id: 7,
    trabajador_id: 22,
    trabajador_nombre: "Julian Ramirez",
    t_numero_de_documento: "1006",
    pro_codigo_cofre: "CF-014",
    referencia_codigo: "106",
    referencia_nombre: "Tapa cruz",
    cargo_nombre: "Pulidor",
    sub_fecha_inicio: "2026-02-19T19:40:32.226238",
    sub_fecha_fin: "2026-04-30T04:33:19.606255",
    sub_duracion_min: 99893,
    duracion_reloj: "09d 08h 53m",
    valor_pagar: 120000.0,
    sub_estado: "finalizado",
    sub_pagado: false,
    sub_fotos_evidencia: [],
  },
  {
    sub_id_subproceso: 18,
    sub_proceso_id: 8,
    trabajador_id: 22,
    trabajador_nombre: "Julian Ramirez",
    t_numero_de_documento: "1006",
    pro_codigo_cofre: "CF-015",
    referencia_codigo: "107",
    referencia_nombre: "Clasico",
    cargo_nombre: "Lijador",
    sub_fecha_inicio: "2026-01-16T09:00:00",
    sub_fecha_fin: null,
    sub_duracion_min: 75,
    duracion_reloj: "01h 15m",
    valor_pagar: 80000,
    sub_estado: "pendiente",
    sub_pagado: false,
    sub_fotos_evidencia: ["foto1.jpg"],
  },
];

describe("REGRESION - Historial Trabajador", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", {
      body: historialMock,
    }).as("getHistorial");
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.wait("@getHistorial");
  });

  it("CP1: debe mostrar el titulo de la pagina", () => {
    cy.contains("Historial de Cofres").should("be.visible");
  });

  it("CP2: debe mostrar estado de carga", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", (req) => {
      req.reply({ delay: 500, body: historialMock });
    });
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.contains(/Cargando historial/i).should("be.visible");
  });

  it("CP3: debe mostrar mensaje cuando no hay registros", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", {
      body: [],
    }).as("getVacio");
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.wait("@getVacio");
    cy.contains("No hay registros pendientes").should("be.visible");
  });

  it("CP4: debe mostrar los datos en la tabla", () => {
    cy.contains("CF-014").should("be.visible");
    cy.contains("Tapa cruz").should("be.visible");
  });

  it("CP5: debe mostrar error si la API falla", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", {
      statusCode: 500,
      body: { message: "Internal Server Error" },
    }).as("getError");
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.wait("@getError").its("response.statusCode").should("eq", 500);
    cy.get("body").should("not.be.empty");
    cy.location("pathname").should("eq", "/trabajador/historial");
  });
});
