import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Define allowed leave type values
const ALLOWED_LEAVE_TYPES = ["fr_conges_payes", "fr_rtt"] as const;
const ALLOWED_COUNTRIES = ["FR"] as const;

// Service that connects to the PayFit API for leave balance simulation
class LeaveBalanceSimulationService {
  private baseUrl = "https://api.dev.payfit.tech/time-absences-api/api/v2";

  async getLeaveBalanceSimulation(
    contractId: string,
    leaveTypeName: (typeof ALLOWED_LEAVE_TYPES)[number],
    months: string[]
  ) {
    try {
      // Prepare request headers with authentication tokens
      const headers = {
        "Content-Type": "application/json",
        Authorization: process.env.AUTHORIZATION_TOKEN || "",
        Cookie: process.env.AUTH_EDGE_TOKEN || "",
      };

      // Prepare request body
      const body = {
        contractId,
        leaveType: {
          name: leaveTypeName,
          country: "FR",
        },
        months,
      };

      // Make POST request to the API
      const response = await fetch(
        `${this.baseUrl}/absences/leave-type-balance-simulation`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching leave balance simulation:", error);
      throw error;
    }
  }
}

// Create a singleton instance of the service
const leaveBalanceSimulationService = new LeaveBalanceSimulationService();

export const getLeaveBalanceSimulationTool = createTool({
  id: "get-leave-balance-simulation",
  description: `
A specialized tool that fetches future balance simulations for specific types of employee leaves.
It provides monthly projections of leave balances for planning purposes.

Use this tool when:
- You need to forecast an employee's future leave balances
- You need to plan leave allocation for future months
- You need to check when an employee might lose leave days

Input:
- jlContractId: String - The unique identifier for an employee's contract
- leaveTypeName: String - The type of leave to simulate (only "fr_conges_payes" or "fr_rtt" allowed)
- months: Array of strings - The months to simulate in YYYY-MM format

Output:
- An object containing monthly simulations with:
  - The month in YYYY-MM format
  - The projected leave balance at the end of that month
  - Any balance that would be lost in that month
  `,
  inputSchema: z.object({
    jlContractId: z.string().describe("The contract ID of the employee"),
    leaveTypeName: z
      .enum(ALLOWED_LEAVE_TYPES)
      .describe("The type of leave to simulate (fr_conges_payes or fr_rtt)"),
    months: z
      .array(z.string().regex(/^\d{4}-\d{2}$/, "Must be in YYYY-MM format"))
      .min(1)
      .describe("Array of months to simulate in YYYY-MM format"),
  }),
  outputSchema: z.object({
    monthlySimulations: z
      .array(
        z.object({
          month: z.string().describe("Month in YYYY-MM format"),
          balanceEstimation: z
            .number()
            .describe("Projected balance at the end of the month (in days)"),
          balanceLostEstimation: z
            .number()
            .describe(
              "Projected balance lost when switching to this month (in days)"
            ),
        })
      )
      .describe("Monthly balance simulations"),
  }),
  execute: async ({ context }) => {
    return await leaveBalanceSimulationService.getLeaveBalanceSimulation(
      context.jlContractId,
      context.leaveTypeName,
      context.months
    );
  },
});
