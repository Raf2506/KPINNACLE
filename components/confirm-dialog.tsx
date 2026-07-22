"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  pending,
}: {
  trigger: React.ReactElement;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown>;
  pending?: boolean;
}) {
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // caller surfaces the error via toast; keep the dialog open so the user can retry
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            className="cursor-pointer"
            onClick={handleConfirm}
          >
            {pending ? "Deleting..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
