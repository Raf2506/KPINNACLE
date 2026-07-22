import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center"
    >
      <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
      <p className="mx-auto max-w-sm px-4 text-sm text-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="cursor-pointer">
        Retry
      </Button>
    </div>
  );
}
