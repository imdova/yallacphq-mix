"use client";

import * as React from "react";
import Link from "next/link";
import { OFFERS_DROPDOWN_ITEMS } from "@/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowRight, Pencil } from "lucide-react";

type Offer = { href: string; label: string };

export default function OffersAdminPage() {
  const [offers, setOffers] = React.useState<Offer[]>(() => [...OFFERS_DROPDOWN_ITEMS]);
  const [editing, setEditing] = React.useState<Offer | null>(null);
  const [label, setLabel] = React.useState("");

  const openEdit = (o: Offer) => {
    setEditing(o);
    setLabel(o.label);
  };

  const save = () => {
    if (!editing) return;
    setOffers((prev) => prev.map((o) => (o.href === editing.href ? { ...o, label: label.trim() || o.label } : o)));
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Offers</CardTitle>
          <CardDescription>Manage promotions and landing pages (UI preview)</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3">
            {offers.map((o) => (
              <div key={o.href} className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-zinc-900">{o.label}</div>
                  <div className="truncate text-sm text-zinc-500">{o.href}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" className="rounded-xl border-zinc-200">
                    <Link href={o.href}>
                      Preview
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl border-zinc-200" onClick={() => openEdit(o)}>
                    <Pencil className="h-4 w-4" />
                    Edit label
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Note: changing labels here updates only this admin preview. To change navigation labels globally, update `constants/index.ts`.
          </p>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => (!o ? setEditing(null) : null)}>
        <DialogContent showClose>
          <DialogHeader>
            <DialogTitle>Edit offer label</DialogTitle>
            <DialogDescription>Update the text shown in navigation and cards.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Label</div>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-xl border-zinc-200" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button className="bg-gold text-gold-foreground hover:bg-gold/90" onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

