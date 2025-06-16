'use client';

import { Plugin } from 'prosemirror-state';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useImperativeHandle, useState, forwardRef } from 'react';

const Editor = forwardRef(function Editor({ onChange, placeholder = `Enter Message Here` }: any, ref) {
    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        setShowEditor(true);
    }, [])

    const editor = useEditor({
        content: ``,
        immediatelyRender: false,
        onUpdate: (changeEvent) => {
            // console.log(`changeEvent`, changeEvent);
            onChange(changeEvent?.editor?.getHTML());
        },
        editorProps: {
            attributes: {
                class: `editorComponent customRichTextEditor tiptap-editor renderHTML`,
            },
        },
        extensions: [
            StarterKit, 
            Image,
            Placeholder.configure({
                placeholder,
                showOnlyCurrent: true,
                showOnlyWhenEditable: true,
            }),
        ],
        onCreate({ editor }) {
            editor.registerPlugin(
                new Plugin({
                    props: {
                        handleKeyDown(view, event) {
                            // console.log(`Key pressed:`, event.key, event.shiftKey);
                            if (event.key === `Enter` && !event.shiftKey) {
                                event.preventDefault();
                                const form = view.dom.closest(`form`) as HTMLFormElement;
                                const submitButton = form?.querySelector(`button[type="submit"]`) as HTMLButtonElement;
                                // console.log(`On Enter Click`, { form, submitButton });
                                submitButton?.click();
                                return true;
                            }
                            return false;
                        },
                    },
                })
            );
        },
    })

    useImperativeHandle(ref, () => ({
        clear: () => {
            editor?.commands.setContent(``);
        },
    }))

    if (!showEditor || !editor) return null;

    return (
        // <div className={`editorWrapper`}>
        //     <div className={`toolbar`}>
        //         <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive(`bold`) ? `active` : ``}>
        //             Bold
        //         </button>
        //         <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive(`italic`) ? `active` : ``}>
        //             Italic
        //         </button>
        //         <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive(`strike`) ? `active` : ``}>
        //             Strike
        //         </button>
        //         <button onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive(`paragraph`) ? `active` : ``}>
        //             P
        //         </button>
        //         <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive(`heading`, { level: 1 }) ? `active` : ``}>
        //             H1
        //         </button>
        //         <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive(`bulletList`) ? `active` : ``}>
        //             • List
        //         </button>
        //         <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive(`orderedList`) ? `active` : ``}>
        //             1. List
        //         </button>
        //     </div>
            <EditorContent editor={editor} />
        // </div>
    )
})

export default Editor;