interface GadgetProps {
  gadget: {
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
  };
}

export function Gadget({ gadget }: GadgetProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
      <div className="font-medium">{gadget.name}</div>
      {(gadget.brand || gadget.model) && (
        <div className="text-sm text-muted-foreground">
          {[gadget.brand, gadget.model].filter(Boolean).join(' - ')}
        </div>
      )}
      {/* Add more gadget details as needed */}
    </div>
  );
} 