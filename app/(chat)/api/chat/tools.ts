import { z } from "zod";

import {
  generateNote,
  generateReservationPrice,
  generateSampleFlightSearchResults,
  generateSampleFlightStatus,
  generateSampleSeatSelection,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  createNote,
  createReservation,
  getReservationById,
  getLatestNote,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export const chatTools: any = {
  getWeather: {
    description: "Get the current weather at a location",
    parameters: z.object({
      latitude: z.number().describe("Latitude coordinate"),
      longitude: z.number().describe("Longitude coordinate"),
    }),
    execute: async ({
      latitude,
      longitude,
    }: z.infer<typeof chatTools.getWeather.parameters>) => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
      );

      const weatherData = await response.json();
      return weatherData;
    },
  },
  displayFlightStatus: {
    description: "Display the status of a flight",
    parameters: z.object({
      flightNumber: z.string().describe("Flight number"),
      date: z.string().describe("Date of the flight"),
    }),
    execute: async ({
      flightNumber,
      date,
    }: z.infer<typeof chatTools.displayFlightStatus.parameters>) => {
      const flightStatus = await generateSampleFlightStatus({
        flightNumber,
        date,
      });

      return flightStatus;
    },
  },
  searchFlights: {
    description: "Search for flights based on the given parameters",
    parameters: z.object({
      origin: z.string().describe("Origin airport or city"),
      destination: z.string().describe("Destination airport or city"),
    }),
    execute: async ({
      origin,
      destination,
    }: z.infer<typeof chatTools.searchFlights.parameters>) => {
      const results = await generateSampleFlightSearchResults({
        origin,
        destination,
      });

      return results;
    },
  },
  selectSeats: {
    description: "Select seats for a flight",
    parameters: z.object({
      flightNumber: z.string().describe("Flight number"),
    }),
    execute: async ({
      flightNumber,
    }: z.infer<typeof chatTools.selectSeats.parameters>) => {
      const seats = await generateSampleSeatSelection({ flightNumber });
      return seats;
    },
  },
  createReservation: {
    description: "Display pending reservation details",
    parameters: z.object({
      seats: z.string().array().describe("Array of selected seat numbers"),
      flightNumber: z.string().describe("Flight number"),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        airportCode: z.string().describe("Code of the departure airport"),
        timestamp: z.string().describe("ISO 8601 date of departure"),
        gate: z.string().describe("Departure gate"),
        terminal: z.string().describe("Departure terminal"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        airportCode: z.string().describe("Code of the arrival airport"),
        timestamp: z.string().describe("ISO 8601 date of arrival"),
        gate: z.string().describe("Arrival gate"),
        terminal: z.string().describe("Arrival terminal"),
      }),
      passengerName: z.string().describe("Name of the passenger"),
    }),
    execute: async (
      props: z.infer<typeof chatTools.createReservation.parameters>
    ) => {
      const { totalPriceInUSD } = await generateReservationPrice(props);
      const session = await auth();

      const id = generateUUID();

      if (session && session.user && session.user.id) {
        await createReservation({
          id,
          userId: session.user.id,
          details: { ...props, totalPriceInUSD },
        });

        return { id, ...props, totalPriceInUSD };
      } else {
        return {
          error: "User is not signed in to perform this action!",
        };
      }
    },
  },
  authorizePayment: {
    description:
      "User will enter credentials to authorize payment, wait for user to repond when they are done",
    parameters: z.object({
      reservationId: z
        .string()
        .describe("Unique identifier for the reservation"),
    }),
    execute: async ({
      reservationId,
    }: z.infer<typeof chatTools.authorizePayment.parameters>) => {
      return { reservationId };
    },
  },
  verifyPayment: {
    description: "Verify payment status",
    parameters: z.object({
      reservationId: z
        .string()
        .describe("Unique identifier for the reservation"),
    }),
    execute: async ({
      reservationId,
    }: z.infer<typeof chatTools.verifyPayment.parameters>) => {
      const reservation = await getReservationById({ id: reservationId });

      if (reservation.hasCompletedPayment) {
        return { hasCompletedPayment: true };
      } else {
        return { hasCompletedPayment: false };
      }
    },
  },
  displayBoardingPass: {
    description: "Display a boarding pass",
    parameters: z.object({
      reservationId: z
        .string()
        .describe("Unique identifier for the reservation"),
      passengerName: z
        .string()
        .describe("Name of the passenger, in title case"),
      flightNumber: z.string().describe("Flight number"),
      seat: z.string().describe("Seat number"),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        airportCode: z.string().describe("Code of the departure airport"),
        airportName: z.string().describe("Name of the departure airport"),
        timestamp: z.string().describe("ISO 8601 date of departure"),
        terminal: z.string().describe("Departure terminal"),
        gate: z.string().describe("Departure gate"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        airportCode: z.string().describe("Code of the arrival airport"),
        airportName: z.string().describe("Name of the arrival airport"),
        timestamp: z.string().describe("ISO 8601 date of arrival"),
        terminal: z.string().describe("Arrival terminal"),
        gate: z.string().describe("Arrival gate"),
      }),
    }),
    execute: async (
      boardingPass: z.infer<typeof chatTools.displayBoardingPass.parameters>
    ) => {
      return boardingPass;
    },
  },
  generateNote: {
    description: "Generate a note from the user's message to show to the user",
    parameters: z.object({
      content: z.string().describe("Content to generate a note from"),
    }),
    execute: async ({
      content,
    }: z.infer<typeof chatTools.generateNote.parameters>) => {
      const note = await generateNote({ content });
      return note;
    },
  },

  createNote: {
    description: "Save a generated note to the database",
    parameters: z.object({
      noteData: z
        .object({
          title: z.string(),
          content: z.string(),
          persons: z
            .array(
              z.object({
                name: z.string(),
                birthDate: z.string().optional(),
                relationship: z.string().optional(),
                contactInfo: z
                  .object({
                    email: z.string().optional(),
                    phone: z.string().optional(),
                    address: z.string().optional(),
                  })
                  .optional(),
              })
            )
            .optional(),
          moments: z
            .array(
              z.object({
                date: z.string(),
                location: z.string().optional(),
                mood: z.string().optional(),
                content: z.string().optional(),
              })
            )
            .optional(),
          todos: z
            .array(
              z.object({
                title: z.string(),
                dueDate: z.string().optional(),
                priority: z.enum(["low", "medium", "high"]).optional(),
                status: z.enum(["pending", "completed"]),
              })
            )
            .optional(),
          gadgets: z
            .array(
              z.object({
                name: z.string(),
                brand: z.string().optional(),
                model: z.string().optional(),
                purchaseDate: z.string().optional(),
                warranty: z
                  .object({
                    expiryDate: z.string().optional(),
                    provider: z.string().optional(),
                    terms: z.string().optional(),
                  })
                  .optional(),
                specifications: z
                  .object({
                    dimensions: z.string().optional(),
                    weight: z.string().optional(),
                    features: z.array(z.string()).optional(),
                  })
                  .optional(),
              })
            )
            .optional(),
        })
        .describe("Structured note data from generateNote"),
    }),
    execute: async ({
      noteData,
    }: z.infer<typeof chatTools.createNote.parameters>) => {
      try {
        const session = await auth();
        if (!session?.user?.id)
          return {
            success: false,
            error: "User must be signed in to create notes",
          };

        // Add IDs to the note and all nested objects
        const noteWithIds = {
          ...noteData,
          id: generateUUID(),
          userId: session.user.id,
          persons: noteData.persons?.map(
            (person: z.infer<(typeof noteData.persons)[0]>) => ({
              ...person,
              id: generateUUID(),
            })
          ),
          moments: noteData.moments?.map(
            (moment: z.infer<(typeof noteData.moments)[0]>) => ({
              ...moment,
              id: generateUUID(),
            })
          ),
          todos: noteData.todos?.map(
            (todo: z.infer<(typeof noteData.todos)[0]>) => ({
              ...todo,
              id: generateUUID(),
            })
          ),
          gadgets: noteData.gadgets?.map(
            (gadget: z.infer<(typeof noteData.gadgets)[0]>) => ({
              ...gadget,
              id: generateUUID(),
              warranty: gadget.warranty
                ? JSON.stringify(gadget.warranty)
                : null,
              specifications: gadget.specifications
                ? JSON.stringify(gadget.specifications)
                : null,
            })
          ),
        };

        const createdNote = await createNote({ noteData: noteWithIds });
        return { success: true, note: createdNote };
      } catch (error) {
        return {
          success: false,
          error: "Failed to create note",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  },

  showLatestNote: {
    description: "Show the user's most recently created note",
    parameters: z.object({
      dummy: z.string().optional().describe("No parameters needed"),
    }),
    execute: async () => {
      const session = await auth();
      if (!session?.user?.id)
        return {
          success: false,
          error: "User must be signed in to view notes",
        };

      const note = await getLatestNote({ userId: session.user.id });
      if (!note) return { success: false, error: "No notes found" };

      return { success: true, note };
    },
  },
};
