"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AiBadge } from "@/components/ai-badge";
import { extractInvoice } from "@/lib/api";
import { aiErrorMessage } from "@/lib/ai/error-messages";
import type { InvoiceExtractionResult } from "@/lib/ai/schemas";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,application/pdf";
const MAX_FILE_BYTES = 8 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Lets a manager upload an invoice image/PDF and have Gemini read the total
 * amount off it, instead of typing the number in from paperwork by hand.
 * The extracted value is only a suggestion — onExtracted hands it to the
 * caller, which still requires an explicit "Use value" click to apply it.
 */
export function InvoiceExtractButton({ onExtracted }: { onExtracted: (amount: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<InvoiceExtractionResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const data = await fileToBase64(file);
      return extractInvoice(data, file.type);
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.amount <= 0) {
        toast.error(data.summary || "Couldn't read a clear amount from that file.");
      }
    },
    onError: (error) => toast.error(aiErrorMessage(error)),
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File is too large. Please upload a file under 8MB.");
      return;
    }
    setResult(null);
    mutation.mutate(file);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload invoice to extract amount"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="cursor-pointer gap-1.5"
        disabled={mutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {mutation.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {mutation.isPending ? "Reading invoice..." : "Extract from invoice"}
      </Button>

      {result && result.amount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-2.5 text-xs">
          <AiBadge />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">
              {result.currency} {result.amount.toLocaleString()}
              {result.vendorOrClient ? ` · ${result.vendorOrClient}` : ""}
              {result.invoiceDate ? ` · ${result.invoiceDate}` : ""}
            </p>
            {result.summary && <p className="text-muted-foreground">{result.summary}</p>}
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0 cursor-pointer"
            onClick={() => {
              onExtracted(result.amount);
              setResult(null);
              toast.success("Current value updated from invoice");
            }}
          >
            Use value
          </Button>
        </div>
      )}
    </div>
  );
}
