import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Heading2 } from 'lucide-react';

export function RichTextEditor({ content, onChange, placeholder = "Pressione '/' para comandos..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] leading-relaxed',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col border border-[var(--border-subtle)] rounded-2xl overflow-hidden bg-[var(--surface-1)] transition-all shadow-sm group">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--surface-2)] text-muted-foreground/60">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg hover:bg-[var(--surface-3)] hover:text-foreground transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-[var(--surface-overlay)] text-foreground shadow-sm' : ''}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg hover:bg-[var(--surface-3)] hover:text-foreground transition-all ${editor.isActive('bold') ? 'bg-[var(--surface-overlay)] text-foreground shadow-sm' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg hover:bg-[var(--surface-3)] hover:text-foreground transition-all ${editor.isActive('italic') ? 'bg-[var(--surface-overlay)] text-foreground shadow-sm' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg hover:bg-[var(--surface-3)] hover:text-foreground transition-all ${editor.isActive('bulletList') ? 'bg-[var(--surface-overlay)] text-foreground shadow-sm' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg hover:bg-[var(--surface-3)] hover:text-foreground transition-all ${editor.isActive('orderedList') ? 'bg-[var(--surface-overlay)] text-foreground shadow-sm' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg hover:bg-[var(--surface-3)] hover:text-foreground transition-all ${editor.isActive('blockquote') ? 'bg-[var(--surface-overlay)] text-foreground shadow-sm' : ''}`}
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>

      <div className="p-8 cursor-text min-h-[400px] bg-[var(--surface-1)]" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} className="tiptap-content" />
      </div>
    </div>
  );
}
