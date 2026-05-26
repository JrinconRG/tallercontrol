Cypress.Commands.add("login", (usuario, password) => {
  cy.session([usuario, password], () => {
    cy.visit("/");

    cy.get(".input-login").first().type(usuario);
    cy.get(".input-login").last().type(password);

    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/trabajador/inicio");
  });
});

const buildAuthState = (role = "trabajador") => ({
  state: {
    user: {
      id: role === "gerente" ? 1 : 2,
      nombre: role === "gerente" ? "Gerente QA" : "Trabajador QA",
      usuario: role,
      authUserId: `auth-${role}`,
    },
    role,
    empresaId: 1,
    empresaNombre: "Taller Control",
    isAuthenticated: true,
    isLoading: false,
  },
  version: 0,
});

Cypress.Commands.add("visitAuthenticated", (path, role = "trabajador") => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(
        "tallercontrol-auth",
        JSON.stringify(buildAuthState(role)),
      );
    },
  });
});

Cypress.Commands.add("arrange", (label, setup) => {
  cy.log(`ARRANGE - ${label}`);
  if (typeof setup === "function") setup();
});

Cypress.Commands.add("act", (label, action) => {
  cy.log(`ACT - ${label}`);
  if (typeof action === "function") action();
});

Cypress.Commands.add("verifyStep", (label, assertion) => {
  cy.log(`ASSERT - ${label}`);
  if (typeof assertion === "function") assertion();
});
