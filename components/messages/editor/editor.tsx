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
                            if (event.key === `Enter` && !event.shiftKey) {
                                event.preventDefault();
                                const form = view.dom.closest(`form`) as HTMLFormElement;
                                const submitButton = form?.querySelector(`button[type="submit"]`) as HTMLButtonElement;
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
        <div className={`editorWrapper`}>
            <div className={`toolbar`}>
                <button 
                    type={`button`}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`chatToolbarButton ${editor.isActive(`bold`) ? `active` : ``}`} 
                >
                    <i className={`fas fa-bold`} /> Bold
                </button>
                <button 
                    type={`button`}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`chatToolbarButton ${editor.isActive(`italic`) ? `active` : ``}`} 
                >
                    <i className={`fas fa-italic`} /> Italic
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    )
})

export default Editor;