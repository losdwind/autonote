import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  Moment,
  Note,
  user,
  chat,
  User,
  reservation,
  note,
  notePersons,
  noteMoments,
  noteTodos,
  noteGadgets,
  person,
  moment,
  todo,
  gadget,
  attachment,
  noteAttachments,
  Todo,
  Person,
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

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  return await db.insert(reservation).values({
    id,
    createdAt: new Date(),
    userId,
    hasCompletedPayment: false,
    details: JSON.stringify(details),
  });
}

export async function getReservationById({ id }: { id: string }) {
  const [selectedReservation] = await db
    .select()
    .from(reservation)
    .where(eq(reservation.id, id));

  return selectedReservation;
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  return await db
    .update(reservation)
    .set({
      hasCompletedPayment,
    })
    .where(eq(reservation.id, id));
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
  const [latestNote] = await db
    .select()
    .from(note)
    .where(eq(note.userId, userId))
    .orderBy(desc(note.createdAt))
    .limit(1);

  if (!latestNote) return null;
  return await getNoteWithRelations({ id: latestNote.id });
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
  noteData,
  momentsData,
  personsData,
  todosData,
}: {
  noteData: Note;
  momentsData?: Array<Moment>;
  personsData?: Array<Person>;
  todosData?: Array<Todo>;
}) {
  await db.insert(note).values({
    id: noteData.id,
    userId: noteData.userId,
    title: noteData.title,
    content: noteData.content,
  });

  if (personsData) {
    await Promise.all(
      personsData.map((personData) => {
        db.insert(person).values(personData);
        db.insert(notePersons).values({
          noteId: noteData.id,
          personId: personData.id,
        });
      })
    );
  }

  if (momentsData) {
    await Promise.all(
      momentsData.map((momentData) => {
        db.insert(moment).values(momentData);
        db.insert(noteMoments).values({
          noteId: noteData.id,
          momentId: momentData.id,
        });
      })
    );
  }

  if (todosData) {
    await Promise.all(
      todosData.map((todoData) => {
        db.insert(todo).values(todoData);
        db.insert(noteTodos).values({
          noteId: noteData.id,
          todoId: todoData.id,
        });
      })
    );
  }
}
