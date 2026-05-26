// FIRST aplicado a Cypress:
// Fast: mocks e intercepts evitan depender de APIs reales.
// Independent: cada caso prepara su propio estado.
// Repeatable: los datos mock son deterministas.
// Self-validating: cada caso termina con assertions claras.
// Timely: las pruebas cubren rutas, componentes y contratos cercanos al codigo.

export const first = Object.freeze({
  fast: "Usar mocks/intercepts y evitar dependencias externas.",
  independent: "Preparar estado por test con Arrange.",
  repeatable: "Usar datos deterministas.",
  selfValidating: "Terminar con assertions explicitas.",
  timely: "Probar cerca del flujo o componente afectado.",
});
