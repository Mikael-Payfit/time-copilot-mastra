import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Service that connects to the PayFit API
class CalendarRecordService {
  private baseUrl = "http://localhost:3000";

  async getCalendarByJLContractId(jlContractId: string, period: { begin: string, end: string }) {
    try {
      // Fetch leave data from the API using POST with body
      const response = await fetch(
        `${this.baseUrl}/api/calendar/${jlContractId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jlContractId, period }),
        }
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
const calendarRecordService = new CalendarRecordService();

export const getLeaveRegistryTool = createTool({
  id: "get-calendar-records",
  description: `
    This tool retrieves employee calendars by querying an API with a contract number and a date period. The tool automatically segments the provided period into weekly requests, making an API call for each Monday at midnight within the requested period.
Parameters
 - jlContractId (required): Contract number of the employee whose calendar you want to retrieve.
 - period (required): Start and End date of the period for which you want to retrieve the calendar (format YYYY-MM-DD).
How it works
 - The tool receives the contract number and the period (start and end dates).
 - It determines all Mondays at midnight (00:00:00) within this period.
 - For each identified Monday, the tool makes an API call passing the contract number and the Monday date.
 - The tool aggregates the results from all API calls and returns them in a consolidated format.
Usage Examples
Example 1

FetchEmployeeCalendar(
  jlContractId: "EMP12345",
  period: {start: "2023-06-05", end: "2023-06-25"}
)
This example retrieves the calendars for the employee with contract number EMP12345 for Mondays June 5th, 12th, and 19th, 2023.
Example 2

FetchEmployeeCalendar(
  jlContractId: "EMP67890",
  period: { begin: "2023-07-15", end: "2023-08-10" }
  
)
This example retrieves the calendars for the employee with contract number EMP67890 for Mondays July 17th, 24th, 31st, and August 7th, 2023.
Response Format
The tool returns a JSON object containing the employee's weekly calendars for the requested period, structured by week.
  `,
  inputSchema: z.object({
    jlContractId: z.string().describe("The contract Id of the Employee"),
    period: z.object({
      begin: z.string({
        description: 'Begining of the period on format ISO (YYYY-MM-DD)'
      }),
      end: z.string({
        description: 'End of the period on format ISO (YYYY-MM-DD)'
      })
    })
  }),
  outputSchema: z
    .object({
      calendars: z.array(
        z.object({
          getDataStore: z
            .any()
            .describe("The data store of the calendar record"),
          getHistory: z.array(
            z.object({
              eventTime: z.number(),
              eventType: z.string(),
              subjectId: z.string(),
              payload: z.any(),
            })
          ),
        }).describe("The calendar record aggregate"),
      )
    })
    .describe(
      "The aggregated datamodel interpreted as a context for the query"
    ),
  execute: async ({ context }) => {
    return await calendarRecordService.getCalendarByJLContractId(
      context.jlContractId,
      context.period
    );
  },
});
