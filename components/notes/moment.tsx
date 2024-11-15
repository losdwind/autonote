import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, SmileIcon } from "lucide-react";

interface MomentProps {
  moment?: {
    date: Date;
    location?: string;
    mood?: string;
    content?: string;
  };
}

export function Moment({ moment }: MomentProps) {
  if (!moment) {
    return (
      <div className="bg-muted p-4 rounded-lg flex flex-col gap-2 animate-pulse">
        <div className="h-6 bg-muted-foreground/20 rounded w-1/3" />
        <div className="h-4 bg-muted-foreground/20 rounded w-1/4" />
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="bg-muted p-4 rounded-lg flex flex-col gap-2">
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon size={14} />
          <span>{format(new Date(moment.date), "PPP")}</span>
        </div>

        {moment.location && (
          <>
            <div className="text-muted-foreground">•</div>
            <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
              <MapPinIcon size={14} />
              <span>{moment.location}</span>
            </div>
          </>
        )}

        {moment.mood && (
          <>
            <div className="text-muted-foreground">•</div>
            <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
              <SmileIcon size={14} />
              <span>{moment.mood}</span>
            </div>
          </>
        )}
      </div>

      {moment.content && (
        <p className="text-sm text-foreground">{moment.content}</p>
      )}
    </div>
  );
}