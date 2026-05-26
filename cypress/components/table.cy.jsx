import Table from "../../src/components/Table/Table";

describe("COMPONENTE - Table", () => {
  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "estado", label: "Estado" },
  ];
  const data = [
    { id: 1, nombre: "Cofre 1", estado: "Activo" },
    { id: 2, nombre: "Cofre 2", estado: "Finalizado" },
  ];

  it("CP1: renderiza encabezados", () => {
    cy.arrange("columnas y datos deterministas");
    cy.act("montar componente Table", () => {
      cy.mount(<Table columns={columns} data={data} />);
    });
    cy.verifyStep("encabezados visibles", () => {
      cy.contains("th", "Nombre").should("be.visible");
      cy.contains("th", "Estado").should("be.visible");
    });
  });

  it("CP2: renderiza filas", () => {
    cy.arrange("dos filas de datos");
    cy.act("montar tabla", () => {
      cy.mount(<Table columns={columns} data={data} />);
    });
    cy.verifyStep("renderiza ambas filas", () => {
      cy.get("tbody tr").should("have.length", 2);
    });
  });

  it("CP3: renderiza celdas de datos", () => {
    cy.arrange("datos con nombre de cofre");
    cy.act("montar tabla", () => {
      cy.mount(<Table columns={columns} data={data} />);
    });
    cy.verifyStep("muestra celda esperada", () => {
      cy.contains("td", "Cofre 1").should("be.visible");
    });
  });

  it("CP4: ejecuta onRowClick", () => {
    cy.arrange("tabla con callback de fila");
    cy.act("montar y hacer click en fila", () => {
      cy.mount(
        <Table columns={columns} data={data} onRowClick={cy.stub().as("rowClick")} />,
      );
      cy.contains("td", "Cofre 2").click();
    });
    cy.verifyStep("callback fue llamado", () => {
      cy.get("@rowClick").should("have.been.called");
    });
  });

  it("CP5: soporta render personalizado", () => {
    cy.arrange("columna con render custom");
    cy.act("montar tabla con render personalizado", () => {
      cy.mount(
        <Table
          columns={[
            {
              key: "estado",
              label: "Estado",
              render: (row) => `Estado: ${row.estado}`,
            },
          ]}
          data={data}
        />,
      );
    });
    cy.verifyStep("usa el render custom", () => {
      cy.contains("Estado: Activo").should("be.visible");
    });
  });
});
