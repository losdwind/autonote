import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, HeartIcon } from "lucide-react";

interface MomentProps {
  moment: {
    date: string;
    location?: string;
    mood?: string;
    content?: string;
  };
}

export function Moment({ moment }: MomentProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
      <div className="flex flex-row items-center gap-2 text-sm">
        <CalendarIcon size={14} className="text-primary" />
        <span>{format(new Date(moment.date), "PPP")}</span>
      </div>

      {moment.location && (
        <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
          <MapPinIcon size={14} />
          <span>{moment.location}</span>
        </div>
      )}

      {moment.mood && (
        <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
          <HeartIcon size={14} />
          <span>{moment.mood}</span>
        </div>
      )}

      {moment.content && (
        <div className="text-sm text-muted-foreground">{moment.content}</div>
      )}
    </div>
  );
}