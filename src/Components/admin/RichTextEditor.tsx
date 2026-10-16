"use client";

import { useEffect, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Code,
  Eraser,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";

type WysiwygFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function normalizeHtml(html: string) {
  const trimmed = html.trim();
  if (trimmed === "" || trimmed === "<p></p>" || trimmed === "<p><br></p>" || trimmed === "<br>") {
    return "";
  }
  return trimmed;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
};

function ToolbarButton({ onClick, active = false, disabled = false, label, children }: Readonly<ToolbarButtonProps>) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-primary/60 bg-primary/20 text-primary"
          : "border-transparent text-on-surface-variant hover:border-outline-variant/50 hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}

export default function WysiwygField({ label, value, onChange }: Readonly<WysiwygFieldProps>) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder: "Write rich details here..." }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "tiptap-content",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(normalizeHtml(current.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (normalizeHtml(editor.getHTML()) === normalizeHtml(value || "")) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("Enter link URL", previousUrl);
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  };

  return (
    <div className="space-y-2 text-sm md:col-span-2">
      <span className="text-on-surface">{label}</span>
      <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-low focus-within:border-primary">
        <div className="flex flex-wrap items-center gap-1 border-b border-outline-variant/30 bg-surface-container/60 p-1.5">
          <ToolbarButton
            label="Undo"
            disabled={!editor?.can().undo()}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            disabled={!editor?.can().redo()}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>

          <span className="mx-1 h-5 w-px bg-outline-variant/40" aria-hidden />

          <ToolbarButton label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Underline" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
            <Underline className="h-4 w-4" />
          </ToolbarButton>

          <span className="mx-1 h-5 w-px bg-outline-variant/40" aria-hidden />

          <ToolbarButton label="Heading 2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Heading 3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <span className="mx-1 h-5 w-px bg-outline-variant/40" aria-hidden />

          <ToolbarButton label="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Inline code" active={editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()}>
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <span className="mx-1 h-5 w-px bg-outline-variant/40" aria-hidden />

          <ToolbarButton label="Link" active={editor?.isActive("link")} onClick={setLink}>
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Unlink"
            disabled={!editor?.isActive("link")}
            onClick={() => editor?.chain().focus().extendMarkRange("link").unsetLink().run()}
          >
            <Link2Off className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Clear formatting"
            onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          >
            <Eraser className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <EditorContent
          editor={editor}
          className="tiptap-host px-3 py-2 text-on-surface"
        />
      </div>
    </div>
  );
}
