import { Mastra } from "@mastra/core";
import { hrisTimeAssistant } from "./agents/hrisTimeAssistant";

export const mastra = new Mastra({
  agents: {
    hrisTimeAssistant,
  },
  server: {
    cors: {
      origin: "*",
    },
  },
});
