import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  CircleIcon,
  SignalHighIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface TodoProps {
  todo?: {
    title: string;
    dueDate?: Date;
    priority?: string;
    status: "pending" | "completed";
  };
}

export function Todo({ todo }: TodoProps) {
  if (!todo) {
    return (
      <div className="bg-muted p-4 rounded-lg flex flex-col gap-2 animate-pulse">
        <div className="h-6 bg-muted-foreground/20 rounded w-2/3" />
        <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
      </div>
    );
  }

  const priorityColors = {
    high: "text-red-500",
    medium: "text-amber-500",
    low: "text-emerald-500",
  };

  return (
    <div className="bg-muted p-4 rounded-lg flex flex-col gap-2">
      <div className="flex flex-row items-start gap-3">
        <div className="mt-1">
          {todo.status === "completed" ? (
            <CheckCircle2Icon size={16} className="text-emerald-500" />
          ) : (
            <CircleIcon size={16} className="text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <span
            className={cn(
              "font-medium",
              todo.status === "completed" &&
                "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </span>

          <div className="flex flex-row items-center gap-4">
            {todo.dueDate && (
              <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon size={14} />
                <span>{format(new Date(todo.dueDate), "PP")}</span>
              </div>
            )}

            {todo.priority && (
              <>
                <div className="text-muted-foreground">•</div>
                <div className="flex flex-row items-center gap-2 text-sm">
                  <SignalHighIcon
                    size={14}
                    className={cn(
                      priorityColors[
                        todo.priority.toLowerCase() as keyof typeof priorityColors
                      ] || "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "capitalize",
                      priorityColors[
                        todo.priority.toLowerCase() as keyof typeof priorityColors
                      ] || "text-muted-foreground"
                    )}
                  >
                    {todo.priority}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
