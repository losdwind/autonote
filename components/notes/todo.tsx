import { format } from "date-fns";
import { CalendarIcon, CheckCircleIcon, CircleIcon } from "lucide-react";

interface TodoProps {
  todo: {
    title: string;
    dueDate?: string;
    priority?: "low" | "medium" | "high";
    status: "pending" | "completed";
  };
}

export function Todo({ todo }: TodoProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
      {/* Title with Status */}
      <div className="flex flex-row items-center gap-2 text-sm">
        {todo.status === "completed" ? (
          <CheckCircleIcon size={14} className="text-primary" />
        ) : (
          <CircleIcon size={14} className="text-primary" />
        )}
        <span className={todo.status === "completed" ? "line-through" : ""}>
          {todo.title}
        </span>
      </div>

      {/* Due Date */}
      {todo.dueDate && (
        <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon size={14} />
          <span>Due {format(new Date(todo.dueDate), "PPP")}</span>
        </div>
      )}

      {/* Priority */}
      {todo.priority && (
        <div className="flex flex-row items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              todo.priority === "high"
                ? "bg-destructive/20 text-destructive"
                : todo.priority === "medium"
                ? "bg-warning/20 text-warning"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
          </span>
        </div>
      )}
    </div>
  );
}
