import { UserIcon, MailIcon, PhoneIcon, HomeIcon } from "lucide-react";

interface PersonProps {
  person?: {
    name: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };
}

export function Person({ person }: PersonProps) {
  if (!person) {
    return (
      <div className="bg-muted p-4 rounded-lg flex flex-col gap-2 animate-pulse">
        <div className="h-6 bg-muted-foreground/20 rounded w-1/3" />
        <div className="h-4 bg-muted-foreground/20 rounded w-1/4" />
      </div>
    );
  }

  return (
    <div className="bg-muted p-4 rounded-lg flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <UserIcon size={16} className="text-muted-foreground" />
        <span className="font-medium">{person.name}</span>
      </div>

      {person.contactInfo && (
        <div className="flex flex-col gap-1.5">
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
              <HomeIcon size={14} />
              <span>{person.contactInfo.address}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}