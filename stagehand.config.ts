import { ConstructorParams } from "@browserbasehq/stagehand";

const stagehandConfig: ConstructorParams = {
  env: "LOCAL", 
  headless: false, 
  logger: (message) => console.log(`[Stagehand]: ${message}`),
  
  llmProvider: "openai", 
  modelName: "gemini-2.5-flash", 
  clientOptions: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" 
  }
};

export default stagehandConfig;