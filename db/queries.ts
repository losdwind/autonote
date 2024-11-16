"server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  attachment,
  chat,
  gadget,
  moment,
  note,
  noteAttachments,
  noteGadgets,
  noteMoments,
  notePersons,
  noteTodos,
  person,
  todo,
  User,
  user,
} from "./schema";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

// Add this new query function
export async function getNoteWithRelations({ id }: { id: string }) {
  try {
    // Get the main note
    const [noteData] = await db.select().from(note).where(eq(note.id, id));

    if (!noteData) return null;

    // Get all related persons
    const persons = await db
      .select({
        person: person,
      })
      .from(notePersons)
      .where(eq(notePersons.noteId, id))
      .leftJoin(person, eq(notePersons.personId, person.id));

    // Get all related moments
    const moments = await db
      .select({
        moment: moment,
      })
      .from(noteMoments)
      .where(eq(noteMoments.noteId, id))
      .leftJoin(moment, eq(noteMoments.momentId, moment.id));

    // Get all related todos
    const todos = await db
      .select({
        todo: todo,
      })
      .from(noteTodos)
      .where(eq(noteTodos.noteId, id))
      .leftJoin(todo, eq(noteTodos.todoId, todo.id));

    // Get all related gadgets
    const gadgets = await db
      .select({
        gadget: gadget,
      })
      .from(noteGadgets)
      .where(eq(noteGadgets.noteId, id))
      .leftJoin(gadget, eq(noteGadgets.gadgetId, gadget.id));

    // Get all attachments
    const attachments = await db
      .select()
      .from(noteAttachments)
      .where(eq(noteAttachments.noteId, id))
      .leftJoin(attachment, eq(noteAttachments.attachmentId, attachment.id));

    // Combine all data
    return {
      ...noteData,
      persons: persons.map((p) => p.person),
      moments: moments.map((m) => m.moment),
      todos: todos.map((t) => t.todo),
      gadgets: gadgets.map((g) => g.gadget),
      attachments,
    };
  } catch (error) {
    console.error("Failed to get note with relations from database", error);
    throw error;
  }
}

export async function getLatestNote({ userId }: { userId: string }) {
  try {
    const [latestNote] = await db
      .select()
      .from(note)
      .where(eq(note.userId, userId))
      .orderBy(desc(note.createdAt))
      .limit(1);

    // Return null if no note is found (don't throw an error)
    if (!latestNote) return null;
    return latestNote;
  } catch (error) {
    console.error("Failed to get latest note from database", error);
    throw error;
  }
}

export async function getRecentNotes({ userId }: { userId: string }) {
  const notes = await db
    .select()
    .from(note)
    .where(eq(note.userId, userId))
    .orderBy(desc(note.createdAt))
    .limit(5);

  return notes.map((note) => getNoteWithRelations({ id: note.id }));
}

// Add this new query function
export async function getRecentPersons({ userId }: { userId: string }) {
  const persons = await db
    .select()
    .from(person)
    .where(eq(person.userId, userId))
    .orderBy(desc(person.createdAt))
    .limit(5);
  return persons;
}

export async function getRecentMoments({ userId }: { userId: string }) {
  const moments = await db
    .select()
    .from(moment)
    .where(eq(moment.userId, userId))
    .orderBy(desc(moment.date))
    .limit(5);
  return moments;
}

export async function getRecentTodos({ userId }: { userId: string }) {
  const todos = await db
    .select()
    .from(todo)
    .where(eq(todo.userId, userId))
    .orderBy(desc(todo.createdAt))
    .limit(5);
  return todos;
}

export async function getRecentGadgets({ userId }: { userId: string }) {
  const gadgets = await db
    .select()
    .from(gadget)
    .where(eq(gadget.userId, userId))
    .orderBy(desc(gadget.createdAt))
    .limit(5);
  return gadgets;
}

export async function getRecentAttachments({ userId }: { userId: string }) {
  const attachments = await db
    .select()
    .from(attachment)
    .where(eq(attachment.userId, userId))
    .orderBy(desc(attachment.createdAt))
    .limit(5);
  return attachments;
}

export async function createNote({
  userId,
  title,
  content,
  moments,
  persons,
  todos,
  gadgets,
}: {
  userId: string;
  title: string;
  content?: string;
  persons?: Array<{
    name: string;
    birthDate?: string;
    relationship?: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  }>;
  moments?: Array<{
    date: string;
    location?: string;
    mood?: string;
    content?: string;
  }>;
  todos?: Array<{
    title: string;
    dueDate?: string;
    priority?: "low" | "medium" | "high";
    status: "pending" | "completed";
  }>;
  gadgets?: Array<{
    name: string;
    brand?: string;
    model?: string;
    purchaseDate?: string;
    warranty?: {
      expiryDate?: string;
      provider?: string;
      details?: string;
    };
    specifications?: {
      dimensions?: string;
      weight?: string;
      features?: string[];
    };
  }>;
}) {
  const [newNote] = await db
    .insert(note)
    .values({
      userId,
      title,
      content: content ?? "",
    })
    .returning({ id: note.id });

  if (persons) {
    await Promise.all(
      persons.map(async (personData) => {
        // First insert the person and get the ID back
        const [newPerson] = await db
          .insert(person)
          .values({
            ...personData,
            userId,
            birthDate: personData.birthDate
              ? new Date(personData.birthDate)
              : null,
          })
          .returning({ id: person.id });

        // Then create the relationship with the returned ID
        await db.insert(notePersons).values({
          noteId: newNote.id,
          personId: newPerson.id,
        });
      })
    );
  }

  if (moments) {
    await Promise.all(
      moments.map(async (momentData) => {
        const [newMoment] = await db
          .insert(moment)
          .values({
            ...momentData,
            userId,
            date: momentData.date ? new Date(momentData.date) : new Date(),
          })
          .returning({ id: moment.id });

        await db.insert(noteMoments).values({
          noteId: newNote.id,
          momentId: newMoment.id,
        });
      })
    );
  }

  if (todos) {
    await Promise.all(
      todos.map(async (todoData) => {
        const [newTodo] = await db
          .insert(todo)
          .values({
            ...todoData,
            userId,
            dueDate: todoData.dueDate ? new Date(todoData.dueDate) : null,
          })
          .returning({ id: todo.id });
        await db.insert(noteTodos).values({
          noteId: newNote.id,
          todoId: newTodo.id,
        });
      })
    );
  }

  if (gadgets) {
    await Promise.all(
      gadgets.map(async (gadgetData) => {
        const [newGadget] = await db
          .insert(gadget)
          .values({
            ...gadgetData,
            userId,
            purchaseDate: gadgetData.purchaseDate
              ? new Date(gadgetData.purchaseDate)
              : null,
          })
          .returning({ id: gadget.id });

        await db.insert(noteGadgets).values({
          noteId: newNote.id,
          gadgetId: newGadget.id,
        });
      })
    );
  }
  return newNote;
}
