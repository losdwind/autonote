import { format } from "date-fns";
import { CalendarIcon, UsersIcon, ListTodoIcon, ClockIcon } from "lucide-react";

import { Moment } from "./moment";
import { Person } from "./person";
import { Todo } from "./todo";

interface NoteCardProps {
  note?: {
    id: string;
    title: string;
    createdAt: Date;
    moments?: Array<{
      date: Date;
      location?: string;
      mood?: string;
      content?: string;
    }>;
    persons?: Array<{
      name: string;
      contactInfo?: {
        email?: string;
        phone?: string;
        address?: string;
      };
    }>;
    todos?: Array<{
      title: string;
      dueDate?: Date;
      priority?: string;
      status: "pending" | "completed";
    }>;
  };
}

export function NoteCard({ note }: NoteCardProps) {
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
    <div className="bg-card border rounded-xl p-6 flex flex-col gap-6 transition-all hover:shadow-lg">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-foreground">{note.title}</h3>
        <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
          <ClockIcon size={14} />
          <span>Created {format(new Date(note.createdAt), "PPP")}</span>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex flex-col gap-6">
        {/* Moments Section */}
        {note.moments && note.moments.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-row items-center gap-2 text-sm font-medium">
              <CalendarIcon size={16} className="text-primary" />
              <span>Moments</span>
              <span className="text-muted-foreground">({note.moments.length})</span>
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
              <span className="text-muted-foreground">({note.persons.length})</span>
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
              <span className="text-muted-foreground">({note.todos.length})</span>
            </div>
            <div className="grid gap-3">
              {note.todos.map((todo, index) => (
                <Todo key={index} todo={todo} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}