import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Service that connects to the PayFit API
class LeaveRegistryService {
  private baseUrl = "http://localhost:3000";

  async getLeaveRegistriesByJLContractId(jlContractId: string) {
    try {
      // Fetch leave data from the API
      const response = await fetch(
        `${this.baseUrl}/api/leave-registry/${jlContractId}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching leave registry:", error);
      throw error;
    }
  }
}

// Create a singleton instance of the service
const leaveRegistryService = new LeaveRegistryService();

export const getLeaveRegistryTool = createTool({
  id: "get-leaves-registry",
  description: `
    Tool Description
A specialized tool that fetches employee absence-related events using a contract ID and generates a comprehensive event aggregate datamodel. 
The tool processes various event types from the leave management system and constructs a complete historical view of an employee's absences.

Use this tool when:
- You need to check an employee's leave history
- You need to retrieve all leave events for an employee
- You need to understand the current state of an employee's leaves

Input
jlContractId: String - The unique identifier for an employee's contract

Output
An aggregate datamodel object containing:
- All leaves of the employee
- Chronological history of all leave-related events (getHistory)
- Current state of all leaves reconstructed from the event stream
  `,
  inputSchema: z.object({
    jlContractId: z.string().describe("The contract Id of the Employee"),
  }),
  outputSchema: z
    .object({
      leaveRegistry: z
        .object({
          getDataStore: z
            .any()
            .describe("The data store of the leave registry"),
          getHistory: z.array(
            z.object({
              eventTime: z.number(),
              eventType: z.string(),
              subjectId: z.string(),
              payload: z.any(),
            })
          ),
        })
        .describe("The leave registry aggregate"),
    })
    .describe(
      "The aggregated datamodel interpreted as a context for the query"
    ),
  execute: async ({ context }) => {
    return await leaveRegistryService.getLeaveRegistriesByJLContractId(
      context.jlContractId
    );
  },
});
