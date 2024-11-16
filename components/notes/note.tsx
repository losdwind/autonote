"use client";

import { useChat } from "ai/react";
import {
  CalendarIcon,
  UsersIcon,
  ListTodoIcon,
  DivideCircleIcon,
} from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

import { Gadget } from "./gadget";
import { Moment } from "./moment";
import { Person } from "./person";
import { Todo } from "./todo";
import { Button } from "../ui/button";

export interface NoteCardProps {
  chatId: string;
  note?: {
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
  };
  onSaved?: () => void;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export function NoteCard({ chatId, note, onSaved }: NoteCardProps) {
  console.log("Note:", note);
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });

  const handleSave = useCallback(async () => {
    if (!note) return;

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) throw new Error(data.message || "Failed to save note");

      toast.success(data.message || "Note saved successfully");
      onSaved?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save note";
      toast.error(message);
      console.error(error);
    }
  }, [note, onSaved]);

  if (!note) {
    return (
      <div className="bg-card border rounded-xl p-6 flex flex-col gap-4 animate-pulse">
        <div className="h-7 bg-muted-foreground/20 rounded w-1/3" />
        <div className="h-5 bg-muted-foreground/20 rounded w-1/4" />
        <div className="h-32 bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border rounded-xl p-6 flex flex-col gap-6 transition-all hover:shadow-lg">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-foreground">
            {note.title}
          </h3>
        </div>

        {/* note's content */}
        {note.content && note.content.length > 0 && (
          <div className="text-sm text-muted-foreground">{note.content}</div>
        )}

        {/* Content Sections */}
        <div className="flex flex-col gap-6">
          {/* Moments Section */}
          {note.moments && note.moments.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-center gap-2 text-sm font-medium">
                <CalendarIcon size={16} className="text-primary" />
                <span>Moments</span>
                <span className="text-muted-foreground">
                  ({note.moments.length})
                </span>
              </div>
              <div className="grid gap-3">
                {note.moments.map((moment, index) => (
                  <Moment key={index} moment={moment} />
                ))}
              </div>
            </div>
          )}

          {/* People Section */}
          {note.persons && note.persons.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-center gap-2 text-sm font-medium">
                <UsersIcon size={16} className="text-primary" />
                <span>People</span>
                <span className="text-muted-foreground">
                  ({note.persons.length})
                </span>
              </div>
              <div className="grid gap-3">
                {note.persons.map((person, index) => (
                  <Person key={index} person={person} />
                ))}
              </div>
            </div>
          )}

          {/* Todos Section */}
          {note.todos && note.todos.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-center gap-2 text-sm font-medium">
                <ListTodoIcon size={16} className="text-primary" />
                <span>Tasks</span>
                <span className="text-muted-foreground">
                  ({note.todos.length})
                </span>
              </div>
              <div className="grid gap-3">
                {note.todos.map((todo, index) => (
                  <Todo key={index} todo={todo} />
                ))}
              </div>
            </div>
          )}

          {/* Gadgets Section */}
          {note.gadgets && note.gadgets.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-center gap-2 text-sm font-medium">
                <DivideCircleIcon size={16} className="text-primary" />
                <span>Gadgets</span>
                <span className="text-muted-foreground">
                  ({note.gadgets.length})
                </span>
              </div>
              <div className="grid gap-3">
                {note.gadgets.map((gadget, index) => (
                  <Gadget key={index} gadget={gadget} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <Button onClick={handleSave}>Save</Button>
        <Button
          variant="outline"
          onClick={() => append({ role: "user", content: "Add details" })}
        >
          Add Details
        </Button>
      </div>
    </>
  );
}
