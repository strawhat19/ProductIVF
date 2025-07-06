'use client';

import { Plugin } from 'prosemirror-state';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useImperativeHandle, useState, forwardRef } from 'react';

const Editor = forwardRef(function Editor({ className = `richTextEditorComponent`, onChange = () => {}, onBlur = () => {}, placeholder = `Enter Message Here` }: any, ref) {
    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        setShowEditor(true);
    }, [])

    const onEditorBlur = (e) => {
        onBlur(e);
    }

    const editor = useEditor({
        content: placeholder,
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
        <div className={`richTextEditor editorWrapper ${className}`}>
            <div className={`toolbar`}>
                <button 
                    type={`button`}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`chatToolbarButton hoverBright ${editor.isActive(`bold`) ? `active` : ``}`} 
                >
                    <i className={`fas fa-bold`} style={{ color: `var(--gameBlue)` }} /> Bold
                </button>
                <button 
                    type={`button`}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`chatToolbarButton hoverBright ${editor.isActive(`italic`) ? `active` : ``}`} 
                >
                    <i className={`fas fa-italic`} style={{ color: `var(--gameBlue)` }} /> Italic
                </button>
            </div>
            <EditorContent editor={editor} onBlur={(e) => onEditorBlur(e)} />
        </div>
    )
})

export default Editor;