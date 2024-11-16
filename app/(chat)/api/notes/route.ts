import { auth } from "@/app/(auth)/auth";
import { createNote } from "@/db/queries";

export async function POST(request: Request) {
  const body = await request.json();

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  try {
    const note = await createNote({
      ...body,
      userId: session.user.id,
    });

    if (!note.id) {
      return new Response("Failed to create note!", { status: 400 });
    }

    return Response.json(note);
  } catch (error) {
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}