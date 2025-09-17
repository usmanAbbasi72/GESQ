'use server';
/**
 * @fileOverview An AI agent that verifies user details based on provided context and event information.
 *
 * - verifyUserDetailsWithAI - A function that verifies user details using AI.
 * - VerifyUserDetailsWithAIInput - The input type for the verifyUserDetailsWithAI function.
 * - VerifyUserDetailsWithAIOutput - The return type for the verifyUserDetailsWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyUserDetailsWithAIInputSchema = z.object({
  userName: z.string().describe('The user name to verify.'),
  fatherName: z.string().describe("The user's father's name to verify."),
  cnic: z.string().describe('The user CNIC number to verify.'),
  event: z.string().describe('The event name to verify user participation in.'),
  role: z.string().describe('The user role in the event to verify.'),
  eventDetails: z.string().describe('Details about the event for context.'),
});
export type VerifyUserDetailsWithAIInput = z.infer<typeof VerifyUserDetailsWithAIInputSchema>;

const VerifyUserDetailsWithAIOutputSchema = z.object({
  verificationResult: z.string().describe('The AI verification result of the user details.'),
});
export type VerifyUserDetailsWithAIOutput = z.infer<typeof VerifyUserDetailsWithAIOutputSchema>;

export async function verifyUserDetailsWithAI(input: VerifyUserDetailsWithAIInput): Promise<VerifyUserDetailsWithAIOutput> {
  return verifyUserDetailsWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyUserDetailsWithAIPrompt',
  input: {schema: VerifyUserDetailsWithAIInputSchema},
  output: {schema: VerifyUserDetailsWithAIOutputSchema},
  model: 'groq/llama3-8b-8192',
  prompt: `You are an AI assistant tasked with verifying user details for event participation.

  Based on the information provided, confirm the user's participation and role in the specified event. Provide a detailed verification result.

  User Name: {{{userName}}}
  Father's Name: {{{fatherName}}}
  CNIC: {{{cnic}}}
  Event: {{{event}}}
  Role: {{{role}}}
  Event Details: {{{eventDetails}}}

  Verification Result:`,
});

const verifyUserDetailsWithAIFlow = ai.defineFlow(
  {
    name: 'verifyUserDetailsWithAIFlow',
    inputSchema: VerifyUserDetailsWithAIInputSchema,
    outputSchema: VerifyUserDetailsWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
