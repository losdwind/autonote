import { generateObject } from "ai";
import { z } from "zod";

import { generateUUID } from "@/lib/utils";

import { geminiFlashModel } from ".";

export async function generateSampleFlightStatus({
  flightNumber,
  date,
}: {
  flightNumber: string;
  date: string;
}) {
  const { object: flightStatus } = await generateObject({
    model: geminiFlashModel,
    prompt: `Flight status for flight number ${flightNumber} on ${date}`,
    schema: z.object({
      flightNumber: z.string().describe("Flight number, e.g., BA123, AA31"),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        airportCode: z.string().describe("IATA code of the departure airport"),
        airportName: z.string().describe("Full name of the departure airport"),
        timestamp: z.string().describe("ISO 8601 departure date and time"),
        terminal: z.string().describe("Departure terminal"),
        gate: z.string().describe("Departure gate"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        airportCode: z.string().describe("IATA code of the arrival airport"),
        airportName: z.string().describe("Full name of the arrival airport"),
        timestamp: z.string().describe("ISO 8601 arrival date and time"),
        terminal: z.string().describe("Arrival terminal"),
        gate: z.string().describe("Arrival gate"),
      }),
      totalDistanceInMiles: z
        .number()
        .describe("Total flight distance in miles"),
    }),
  });

  return flightStatus;
}

export async function generateSampleFlightSearchResults({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const { object: flightSearchResults } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate search results for flights from ${origin} to ${destination}, limit to 4 results`,
    output: "array",
    schema: z.object({
      id: z
        .string()
        .describe("Unique identifier for the flight, like BA123, AA31, etc."),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        airportCode: z.string().describe("IATA code of the departure airport"),
        timestamp: z.string().describe("ISO 8601 departure date and time"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        airportCode: z.string().describe("IATA code of the arrival airport"),
        timestamp: z.string().describe("ISO 8601 arrival date and time"),
      }),
      airlines: z.array(
        z.string().describe("Airline names, e.g., American Airlines, Emirates")
      ),
      priceInUSD: z.number().describe("Flight price in US dollars"),
      numberOfStops: z.number().describe("Number of stops during the flight"),
    }),
  });

  return { flights: flightSearchResults };
}

export async function generateSampleSeatSelection({
  flightNumber,
}: {
  flightNumber: string;
}) {
  const { object: rows } = await generateObject({
    model: geminiFlashModel,
    prompt: `Simulate available seats for flight number ${flightNumber}, 6 seats on each row and 5 rows in total, adjust pricing based on location of seat`,
    output: "array",
    schema: z.array(
      z.object({
        seatNumber: z.string().describe("Seat identifier, e.g., 12A, 15C"),
        priceInUSD: z
          .number()
          .describe("Seat price in US dollars, less than $99"),
        isAvailable: z
          .boolean()
          .describe("Whether the seat is available for booking"),
      })
    ),
  });

  return { seats: rows };
}

export async function generateReservationPrice(props: {
  seats: string[];
  flightNumber: string;
  departure: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  arrival: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  passengerName: string;
}) {
  const { object: reservation } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate price for the following reservation \n\n ${JSON.stringify(
      props,
      null,
      2
    )}`,
    schema: z.object({
      totalPriceInUSD: z
        .number()
        .describe("Total reservation price in US dollars"),
    }),
  });

  return reservation;
}

export async function generateNote(props: { content: string }) {
  const { object: note } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate a structured note from the following content, analyze user's context and intent, if it is a general note or bookmarks, put the content into note content field and finish, if it is more complicated, then ignore the content field and try to fit it into persons, moments, and todos, if applicable: \n\n ${props.content}`,
    schema: z.object({
      title: z
        .string()
        .describe("A concise title summarizing the note content"),
      content: z.string().describe("The main note content"),
      persons: z
        .array(
          z.object({
            name: z.string().describe("Name of the person mentioned"),
            birthDate: z
              .string()
              .optional()
              .describe("ISO 8601 birth date if mentioned"),
            relationship: z
              .string()
              .optional()
              .describe("Relationship to the person"),
            contactInfo: z
              .object({
                email: z
                  .string()
                  .optional()
                  .describe("Person's email if mentioned"),
                phone: z
                  .string()
                  .optional()
                  .describe("Person's phone if mentioned"),
                address: z
                  .string()
                  .optional()
                  .describe("Person's address if mentioned"),
              })
              .optional(),
          })
        )
        .optional(),
      moments: z
        .array(
          z.object({
            date: z.string().describe("ISO 8601 date of the moment"),
            location: z
              .string()
              .optional()
              .describe("Location where the moment occurred"),
            mood: z
              .string()
              .optional()
              .describe("Mood or emotion associated with the moment"),
            content: z
              .string()
              .optional()
              .describe("Description of the moment"),
          })
        )
        .optional(),
      todos: z
        .array(
          z.object({
            title: z.string().describe("Todo item description"),
            dueDate: z
              .string()
              .optional()
              .describe("ISO 8601 due date for the todo"),
            priority: z.enum(["low", "medium", "high"]).optional(),
            status: z.enum(["pending", "completed"]).default("pending"),
          })
        )
        .optional(),
      gadgets: z
        .array(
          z.object({
            name: z.string().describe("Name of the gadget"),
            brand: z.string().optional().describe("Brand of the gadget"),
            model: z.string().optional().describe("Model of the gadget"),
            purchaseDate: z
              .string()
              .optional()
              .describe("ISO 8601 purchase date"),
            warranty: z.object({
              expiryDate: z.string().optional().describe("ISO 8601 warranty expiry date"),
              provider: z.string().optional().describe("Warranty provider"),
              details: z.string().optional().describe("Warranty details")
            })
              .optional()
              .describe("Warranty information"),
            specifications: z.object({
              dimensions: z.string().optional().describe("Physical dimensions"),
              weight: z.string().optional().describe("Weight of the gadget"),
              features: z.array(z.string()).optional().describe("List of features")
            })
              .optional()
              .describe("Technical specifications"),
          })
        )
        .optional(),
    }),
  });

  return note;
}
