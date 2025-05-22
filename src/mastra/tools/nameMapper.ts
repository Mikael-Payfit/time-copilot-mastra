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
    if (context.name.toLowerCase().indexOf('female') !== -1 || context.name.toLowerCase().indexOf('test') !== -1) {
      return { contractId: '65e590f1173411001bde34d5', realName: 'Female Test' }
    }
    return { contractId: undefined, realName: undefined }
  },
});
