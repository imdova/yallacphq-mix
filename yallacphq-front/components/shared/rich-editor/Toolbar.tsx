"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  editor: Editor | null;
  className?: string;
}

export function Toolbar({ editor, className }: ToolbarProps) {
  if (!editor) return null;

  const items = [
    {
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      icon: Bold,
      label: "Bold",
    },
    {
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      icon: Italic,
      label: "Italic",
    },
    {
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
      icon: Heading2,
      label: "Heading",
    },
    {
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
      icon: List,
      label: "Bullet list",
    },
    {
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
      icon: ListOrdered,
      label: "Ordered list",
    },
    {
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
      icon: Quote,
      label: "Quote",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-input bg-muted/50 p-1",
        className
      )}
      role="toolbar"
      aria-label="Text formatting"
    >
      {items.map(({ onClick, active, icon: Icon, label }) => (
        <Button
          key={label}
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          aria-pressed={active}
          aria-label={label}
          className={cn(active && "bg-accent text-accent-foreground")}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
      <span className="mx-1 h-4 w-px bg-border" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
