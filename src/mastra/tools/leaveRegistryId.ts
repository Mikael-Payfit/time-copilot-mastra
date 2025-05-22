import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Service that connects to the PayFit API
class LeaveRegistryIdService {
  private baseUrl = "http://localhost:3000";

  async getLeaveRegistryIdByJLContractId(jlContractId: string) {
    try {
      // Fetch leave data from the API
      const response = await fetch(
        `${this.baseUrl}/api/leave-registry/id/${jlContractId}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching leave registry id:", error);
      throw error;
    }
  }
}

// Create a singleton instance of the service
const leaveRegistryIdService = new LeaveRegistryIdService();

export const getLeaveRegistryIdTool = createTool({
  id: "get-leaves-registry",
  description: `
A specialized tool that fetches employee leaveRegistryId, use-full to act and call other API like leaves commands (to add a leave for example)
  `,
  inputSchema: z.object({
    jlContractId: z.string().describe("The contract Id of the Employee"),
  }),
  outputSchema: z
    .object({
      leaveRegistryId: z.string().describe("The leaveRegistryId of the Employee"),
    }),
  execute: async ({ context }) => {
    return await leaveRegistryIdService.getLeaveRegistryIdByJLContractId(
      context.jlContractId
    );
  },
});
