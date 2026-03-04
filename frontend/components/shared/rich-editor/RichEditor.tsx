"use client";

import * as React from "react";
import { useEditor, EditorContent, type Content } from "@tiptap/react";
import { defaultExtensions } from "./extensions";
import { Toolbar } from "./Toolbar";
import { cn } from "@/lib/utils";

export interface RichEditorProps {
  content?: Content;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  minHeight?: string;
}

export function RichEditor({
  content = "",
  onChange,
  placeholder: _placeholder = "Write something…",
  editable = true,
  className,
  minHeight = "120px",
}: RichEditorProps) {
  const editor = useEditor({
    extensions: defaultExtensions,
    content,
    editable,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-3 py-2",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  return (
    <div className={cn("rounded-lg border border-input bg-background", className)}>
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="[&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}
