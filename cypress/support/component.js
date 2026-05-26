import { mount } from "cypress/react";
import "../../src/styles/variables.css";
import "../../src/styles/layout.css";
import "./commands";
import "./first";

Cypress.Commands.add("mount", mount);
