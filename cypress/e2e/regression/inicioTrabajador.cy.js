const procesoMock = {
  pro_id_proceso: "P-001",
  pro_codigo_cofre: "CF-99",
  pro_referencia_id: 11,
  rc_codigo: "134",
  rc_nombre: "Imperial",
  total_a_realizar: 5,
  total_finalizadas: 0,
};

const faseMock = {
  pro_id_proceso: "P-001",
  pro_codigo_cofre: "CF-99",
  fases_completadas: 0,
  total_fases: 5,
  siguiente_cargo_nombre: "Tapizador",
};

const subprocesoMock = {
  pro_id_proceso: "P-001",
};

function mockAPIs({
  procesos = [procesoMock],
  fases = [faseMock],
  subprocesos = [],
} = {}) {
  cy.intercept("GET", "**/vw_fase_actual*", { body: fases }).as("getFases");
  cy.intercept("GET", "**/vw_procesos_activos*", { body: procesos }).as(
    "getProcesos",
  );
  cy.intercept("GET", "**/vw_informacion_subproceso_actual*", {
    body: subprocesos,
  }).as("getSubs");
}

describe("REGRESION - InicioTrabajador", () => {
  beforeEach(() => {
    mockAPIs();
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.get(".modal-overlay").should("not.exist");
  });

  it("CP1: debe mostrar estado de carga mientras espera las APIs", () => {
    cy.intercept("GET", "**/vw_procesos_activos*", (req) => {
      req.reply({ delay: 500, body: [] });
    });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.contains(/Cargando procesos/i).should("be.visible");
  });

  it("CP2: debe mostrar procesos en seccion Por iniciar", () => {
    cy.wait(["@getProcesos", "@getFases", "@getSubs"]);
    cy.contains("Por iniciar").should("be.visible");
    cy.contains("CF-99").should("be.visible");
  });

  it("CP3: debe mostrar proceso en seccion En curso si tiene subproceso", () => {
    mockAPIs({ subprocesos: [subprocesoMock] });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.wait(["@getProcesos", "@getFases", "@getSubs"]);
    cy.contains("En curso").scrollIntoView().should("be.visible");
    cy.contains("CF-99").scrollIntoView().should("be.visible");
  });

  it("CP4: debe abrir el modal CrearProceso al hacer click", () => {
    cy.wait(["@getProcesos", "@getFases", "@getSubs"]);
    cy.get('[data-cy="btn-crear-proceso"]').click();
    cy.contains("Crear proceso").should("be.visible");
  });

  it("CP5: debe cerrar modal CrearProceso al cancelar", () => {
    cy.wait(["@getProcesos", "@getFases", "@getSubs"]);
    cy.get('[data-cy="btn-crear-proceso"]').click();
    cy.get(".modal-overlay").within(() => {
      cy.contains("button", /Cancelar/i).click();
    });
    cy.contains("Crear proceso").should("not.exist");
  });
});
