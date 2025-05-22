import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Service that connects to the PayFit API
class CalendarRecordTeamService {
  private baseUrl = "http://localhost:3000";

  async getCalendarTeamByDate(date: string) {
    try {
      // Fetch leave data from the API using POST with body
      const response = await fetch(
        `${this.baseUrl}/api/workschedule/team/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching calendar team:", error);
      throw error;
    }
  }
}

// Create a singleton instance of the service
const calendarRecordTeamService = new CalendarRecordTeamService();

export const getCalendarTeamTool = createTool({
  id: "get-calendar-team",
  description: `
    This tool retrieves all employees calendars for a given date. 
    The date in input should be at the format "YYYY-MM-dd". 
    The result is an array of object, one per employee, with the contractId, the name of the employee and the calendar for the given day (in timeslots)
  `,
  inputSchema: z.object({
    date: z.string().describe("The date of the calendar of all employees you want to retrieve (format YYYY-MM-dd)"),
  }),
  outputSchema: z
    .object({
      contractId: z.string().describe('The contractId to be able to match it to an employee'),
      name: z.string().describe('The name of the given employee'),
      day: z.any().describe("The calendar of this specific day for this contract"),
      leaves: z.any().describe('All details of the leave')
    })
    .describe(
      "The list of calendar for the team for the given day, by employee"
    ),
  execute: async ({ context }) => {
    return await calendarRecordTeamService.getCalendarTeamByDate(
      context.date,
    );
  },
});
