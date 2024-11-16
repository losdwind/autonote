import { z } from "zod";

import { generateNote } from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import { createNote, getLatestNote } from "@/db/queries";

export const chatTools: any = {
  generateNote: {
    description: "Generate a note from the user's message to show to the user",
    parameters: z.object({
      content: z.string().describe("Content to generate a note from"),
    }),
    execute: async ({
      content,
    }: z.infer<typeof chatTools.generateNote.parameters>) => {
      const note = await generateNote({ content });
      return { success: true, note };
    },
  },

  // createNote: {
  //   description: "Save a generated note to the database",
  //   parameters: z.object({
  //     noteData: z
  //       .object({
  //         title: z.string(),
  //         content: z.string(),
  //         persons: z
  //           .array(
  //             z.object({
  //               name: z.string(),
  //               birthDate: z.string().optional(),
  //               relationship: z.string().optional(),
  //               contactInfo: z
  //                 .object({
  //                   email: z.string().optional(),
  //                   phone: z.string().optional(),
  //                   address: z.string().optional(),
  //                 })
  //                 .optional(),
  //             })
  //           )
  //           .optional(),
  //         moments: z
  //           .array(
  //             z.object({
  //               date: z.string(),
  //               location: z.string().optional(),
  //               mood: z.string().optional(),
  //               content: z.string().optional(),
  //             })
  //           )
  //           .optional(),
  //         todos: z
  //           .array(
  //             z.object({
  //               title: z.string(),
  //               dueDate: z.string().optional(),
  //               priority: z.enum(["low", "medium", "high"]).optional(),
  //               status: z.enum(["pending", "completed"]),
  //             })
  //           )
  //           .optional(),
  //         gadgets: z
  //           .array(
  //             z.object({
  //               name: z.string(),
  //               brand: z.string().optional(),
  //               model: z.string().optional(),
  //               purchaseDate: z.string().optional(),
  //               warranty: z
  //                 .object({
  //                   expiryDate: z.string().optional(),
  //                   provider: z.string().optional(),
  //                   terms: z.string().optional(),
  //                 })
  //                 .optional(),
  //               specifications: z
  //                 .object({
  //                   dimensions: z.string().optional(),
  //                   weight: z.string().optional(),
  //                   features: z.array(z.string()).optional(),
  //                 })
  //                 .optional(),
  //             })
  //           )
  //           .optional(),
  //       })
  //       .describe("Structured note data from generateNote"),
  //   }),
  //   execute: async ({
  //     noteData,
  //   }: z.infer<typeof chatTools.createNote.parameters>) => {
  //     try {
  //       const session = await auth();
  //       if (!session?.user?.id)
  //         return {
  //           success: false,
  //           error: "User must be signed in to create notes",
  //         };

  //       const createdNote = await createNote({
  //         ...noteData,
  //         userId: session.user.id,
  //       });
  //       return { success: true, note: createdNote };
  //     } catch (error) {
  //       return {
  //         success: false,
  //         error: "Failed to create note",
  //         details: error instanceof Error ? error.message : "Unknown error",
  //       };
  //     }
  //   },
  // },

  showLatestNote: {
    description: "Show the user's latest created note",
    parameters: z.object({
      dummy: z.string().optional().describe("No parameters needed"),
    }),
    execute: async () => {
      try {
        const session = await auth()
        if (!session?.user?.id)
          return { 
            success: false, 
            error: "You must be signed in to view notes" 
          }

        const note = await getLatestNote({ userId: session.user.id })
        if (!note) 
          return { 
            success: false, 
            error: "You don't have any notes yet. Try creating one!" 
          }

        return { success: true, note }
      } catch (error) {
        return {
          success: false,
          error: "Failed to fetch latest note",
          details: error instanceof Error ? error.message : "Unknown error"
        }
      }
    },
  },
};
