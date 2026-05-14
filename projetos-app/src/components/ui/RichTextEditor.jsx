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
    <div className="flex flex-col border border-border/50 rounded-lg overflow-hidden bg-secondary/5 transition-colors focus-within:border-border hover:border-border/80">
      {/* Menu Bar (Tiptap Bubble Menu style but static for simplicity now) */}
      <div className="flex items-center gap-1 p-1 border-b border-border/50 bg-secondary/30 text-muted-foreground">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-secondary transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-secondary text-foreground' : ''}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-border mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-secondary transition-colors ${editor.isActive('bold') ? 'bg-secondary text-foreground' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-secondary transition-colors ${editor.isActive('italic') ? 'bg-secondary text-foreground' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-border mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-secondary transition-colors ${editor.isActive('bulletList') ? 'bg-secondary text-foreground' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-secondary transition-colors ${editor.isActive('orderedList') ? 'bg-secondary text-foreground' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-border mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-secondary transition-colors ${editor.isActive('blockquote') ? 'bg-secondary text-foreground' : ''}`}
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
