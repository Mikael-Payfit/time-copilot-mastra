import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const getContractIdByNameTool = createTool({
  id: "get-contractid-by-name",
  description: `
    This tool retrieve the contractId from a name of an employee. The tool also give you the contractual name as registered in the contract. 
    This tool will return the contractID or undefined if the employee is not found.
  `,
  inputSchema: z.object({
    name: z.string().describe("The name of the employee. Example: Luc HACKDAYS")
  }),
  outputSchema: z.object({
    contractId: z.string().or(z.undefined()).describe("The contractId if found or undefined if not found"),
    realName: z.string().or(z.undefined()).describe("The real name of the employee as specified in the contract"),
  }),
  execute: async ({ context }) => {
    if (context.name.toLowerCase().indexOf('nigel') !== -1 || context.name.toLowerCase().indexOf('clockingtom') !== -1) {
      return { contractId: '682f2d71907d1647b52e4179', realName: 'Nigel Clockington' }
    }
    if (context.name.toLowerCase().indexOf('benedic') !== -1 || context.name.toLowerCase().indexOf('timebottom') !== -1) {
      return { contractId: '682f2e8590ecf695ae96f51e', realName: 'Benedic Timebottom' }
    }
    if (context.name.toLowerCase().indexOf('agatha') !== -1 || context.name.toLowerCase().indexOf('shiftberry') !== -1) {
      return { contractId: '682f2b9790ecf695ae96f4e7', realName: 'Agatha Shiftberry' }
    }
    return { contractId: undefined, realName: undefined }
  },
});