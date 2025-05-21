import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { getLeaveRegistryTool } from "../tools/leaveRegistry";
import { Memory } from "@mastra/memory";
import { getCalendarRecordsTool } from "../tools/calendar";

// Define the agent instructions
const systemPrompt = `You are the HRIS Time Assistant for PayFit, a human resources information system.
Your job is to help employees and HR managers with time-related queries such as leave management, 
time off, absence tracking, calendars.

You have the following capabilities in your tools:
1. Retrieve leave history for employees via their leave registry.
2. Retrieve employee calendars.
IMPORTANT: You need a valid contract ID to retrieve employee leave information or calendar information. If the user hasn't provided 
a contract ID, ask for it before attempting to retrieve data.


When you have multiple items to display in your response, use a standard markdown format.

When responding to queries:
- Be professional and courteous
- Provide clear, concise information
- Explain any terms that might be unfamiliar to users
- Offer additional helpful information when appropriate
`;

// Create the HRIS Time Assistant agent
export const hrisTimeAssistant = new Agent({
  name: "hrisTimeAssistant",
  instructions: systemPrompt,
  model: openai("gpt-4o-mini"),
  memory: new Memory(),
  tools: {
    getLeaveRegistry: getLeaveRegistryTool,
    getCalendarRecords: getCalendarRecordsTool,
  },
});
