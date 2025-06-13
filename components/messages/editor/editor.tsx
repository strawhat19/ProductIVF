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

    return <EditorContent editor={editor} />
})

export default Editor;