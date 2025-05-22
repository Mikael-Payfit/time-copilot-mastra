import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Define moment of day enum
enum MomentOfDay {
  BEGINNING = "beginning-of-day",
  MIDDLE = "middle-of-day",
  END = "end-of-day",
}

// Service that connects to the PayFit API for leave submission
class SubmitPaidHolidaysService {
  private baseUrl = "https://api.dev.payfit.tech/time-absences-api/api/v2";

  async submitPaidHolidays(
    leaveRegistryId: string,
    beginDate: string,
    beginMoment: MomentOfDay,
    endDate: string,
    endMoment: MomentOfDay
  ) {
    try {
      // Prepare request headers with authentication tokens
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AUTHORIZATION_TOKEN || ""}`,
        Cookie: `authatedge_dev_token=${process.env.AUTH_EDGE_TOKEN || ""}`,
      };

      // Prepare request body
      const body = {
        leaveRegistryId,
        leaveRecord: {
          country: "FR",
          type: "fr_conges_payes",
          beginDate,
          beginMoment,
          endDate,
          endMoment,
        },
      };

      // Make POST request to the API
      const response = await fetch(
        `${this.baseUrl}/absences/preapprove-creation`,
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
      console.error("Error submitting paid holidays:", error);
      throw error;
    }
  }
}

// Create a singleton instance of the service
const submitPaidHolidaysService = new SubmitPaidHolidaysService();

export const submitPaidHolidaysTool = createTool({
  id: "submit-paid-holidays",
  description: `
A specialized tool that submits a paid holiday (fr_conges_payes) for an employee.

Use this tool when:
- A user wants to add a paid leave
- You want to submit a vacation / holiday

Input:
- leaveRegistryId: String - The unique identifier for the employee's leave registry
- beginDate: String - The start date of the leave in ISO format (YYYY-MM-DD)
- beginMoment: String - When the leave starts during the day (beginning-of-day, middle-of-day, end-of-day)
- endDate: String - The end date of the leave in ISO format (YYYY-MM-DD)
- endMoment: String - When the leave ends during the day (beginning-of-day, middle-of-day, end-of-day)

WARNING: the moment of day gives the information of when the leave starts or ends during the day, not directly the half-day information.
If the user does not specify anything about half-days, a leave will start at beginning of day and end at end of day.  

Output:
- An object containing:
  - leaveRegistryId: The ID of the employee's leave registry
  - leaveRecordId: The ID of the newly created leave record
  `,
  inputSchema: z.object({
    leaveRegistryId: z
      .string()
      .uuid()
      .describe("The leave registry ID of the employee"),
    beginDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
      .describe("Start date of the leave in ISO format"),
    beginMoment: z
      .enum([MomentOfDay.BEGINNING, MomentOfDay.MIDDLE])
      .describe("When the leave starts during the day"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
      .describe("End date of the leave in ISO format"),
    endMoment: z
      .enum([MomentOfDay.MIDDLE, MomentOfDay.END])
      .describe("When the leave ends during the day"),
  }),
  outputSchema: z.object({
    leaveRegistryId: z
      .string()
      .uuid()
      .describe("The ID of the employee's leave registry"),
    leaveRecordId: z
      .string()
      .uuid()
      .describe("The ID of the newly created leave record"),
  }),
  execute: async ({ context }) => {
    return await submitPaidHolidaysService.submitPaidHolidays(
      context.leaveRegistryId,
      context.beginDate,
      context.beginMoment as MomentOfDay,
      context.endDate,
      context.endMoment as MomentOfDay
    );
  },
});
