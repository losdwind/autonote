import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// User table
export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

// Chat table
export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

// Reservation table
export const reservation = pgTable("Reservation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  details: json("details").notNull(),
  hasCompletedPayment: boolean("hasCompletedPayment").notNull().default(false),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Reservation = InferSelectModel<typeof reservation>;

// Main note table
export const note = pgTable("Note", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: varchar("content", { length: 10000 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Note = InferSelectModel<typeof note>;

// Junction tables for many-to-many relationships
export const notePersons = pgTable("NotePersons", {
  noteId: uuid("noteId")
    .notNull()
    .references(() => note.id),
  personId: uuid("personId")
    .notNull()
    .references(() => person.id),
});

export const noteMoments = pgTable("NoteMoments", {
  noteId: uuid("noteId")
    .notNull()
    .references(() => note.id),
  momentId: uuid("momentId")
    .notNull()
    .references(() => moment.id),
});

export const noteTodos = pgTable("NoteTodos", {
  noteId: uuid("noteId")
    .notNull()
    .references(() => note.id),
  todoId: uuid("todoId")
    .notNull()
    .references(() => todo.id),
});

export const noteGadgets = pgTable("NoteGadgets", {
  noteId: uuid("noteId")
    .notNull()
    .references(() => note.id),
  gadgetId: uuid("gadgetId")
    .notNull()
    .references(() => gadget.id),
});

export const noteAttachments = pgTable("NoteAttachments", {
  noteId: uuid("noteId")
    .notNull()
    .references(() => note.id),
  attachmentId: uuid("attachmentId")
    .notNull()
    .references(() => attachment.id),
});

// Attachment table for all entities
export const attachment = pgTable("Attachment", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(), // image/pdf/code
  fileSize: integer("fileSize").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Attachment = InferSelectModel<typeof attachment>;

// Entities with specific attributes
export const person = pgTable("Person", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  birthDate: timestamp("birthDate"),
  relationship: varchar("relationship", { length: 100 }),
  contactInfo: json("contactInfo"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Person = Omit<InferSelectModel<typeof person>, "contactInfo"> & {
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
};

export const moment = pgTable("Moment", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  date: timestamp("date").notNull(),
  location: varchar("location", { length: 255 }),
  mood: varchar("mood", { length: 50 }),
  content: varchar("content", { length: 10000 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Moment = InferSelectModel<typeof moment>;

export const todo = pgTable("Todo", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  dueDate: timestamp("dueDate"),
  priority: varchar("priority", { length: 20 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Todo = InferSelectModel<typeof todo>;

export const gadget = pgTable("Gadget", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  purchaseDate: timestamp("purchaseDate"),
  warranty: json("warranty"),
  specifications: json("specifications"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Gadget = InferSelectModel<typeof gadget>;

export interface NoteWithRelations extends Note {
  persons: Person[];
  moments: Moment[];
  todos: Todo[];
  gadgets: Gadget[];
  attachments: Attachment[];
}
