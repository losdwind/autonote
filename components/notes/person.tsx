import { format } from "date-fns";
import {
  CalendarIcon,
  HeartIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";

interface PersonProps {
  person: {
    name: string;
    birthDate?: string;
    relationship?: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };
}

export function Person({ person }: PersonProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
      {/* Name */}
      <div className="flex flex-row items-center gap-2 text-sm">
        <UserIcon size={14} className="text-primary" />
        <span>{person.name}</span>
      </div>

      {/* Relationship */}
      {person.relationship && (
        <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
          <HeartIcon size={14} />
          <span>{person.relationship}</span>
        </div>
      )}

      {/* Birth Date */}
      {person.birthDate && (
        <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon size={14} />
          <span>{format(new Date(person.birthDate), "PPP")}</span>
        </div>
      )}

      {/* Contact Info */}
      {person.contactInfo && (
        <div className="flex flex-col gap-2">
          {person.contactInfo.email && (
            <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
              <MailIcon size={14} />
              <span>{person.contactInfo.email}</span>
            </div>
          )}

          {person.contactInfo.phone && (
            <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
              <PhoneIcon size={14} />
              <span>{person.contactInfo.phone}</span>
            </div>
          )}

          {person.contactInfo.address && (
            <div className="flex flex-row items-center gap-2 text-sm text-muted-foreground">
              <MapPinIcon size={14} />
              <span>{person.contactInfo.address}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
