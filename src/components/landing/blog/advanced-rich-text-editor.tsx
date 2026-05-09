'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Type,
    Palette,
    Loader2,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import toast from 'react-hot-toast'

interface AdvancedRichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

export function AdvancedRichTextEditor({ content, onChange, placeholder }: AdvancedRichTextEditorProps) {
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [isUploading, setIsUploading] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                    HTMLAttributes: {
                        class: 'heading-custom',
                    },
                },
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc list-outside ml-6 my-4',
                    },
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal list-outside ml-6 my-4',
                    },
                    keepMarks: true,
                    keepAttributes: false,
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700',
                    },
                },
                paragraph: {
                    HTMLAttributes: {
                        class: 'my-2 leading-relaxed',
                    },
                },
                code: {
                    HTMLAttributes: {
                        class: 'bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600',
                    },
                },
                codeBlock: {
                    HTMLAttributes: {
                        class: 'bg-gray-900 text-gray-100 p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto',
                    },
                },
            }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
                },
            }),
            Image.configure({
                inline: false,
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg my-4 border shadow-sm mx-auto block',
                },
                allowBase64: true,
            }),
        ],
        content: content || '<p></p>',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'editor-content focus:outline-none min-h-[500px] px-6 py-4',
                'data-placeholder': placeholder || 'Start writing your amazing blog post...',
            },
            handleDrop: (view, event) => {
                const files = Array.from(event.dataTransfer?.files || [])
                const imageFiles = files.filter(file => file.type.startsWith('image/'))

                if (imageFiles.length > 0) {
                    event.preventDefault()
                    imageFiles.forEach(file => handleImageUpload(file))
                    return true
                }
                return false
            },
            handlePaste: (view, event) => {
                const items = Array.from(event.clipboardData?.items || [])
                const imageItems = items.filter(item => item.type.startsWith('image/'))

                if (imageItems.length > 0) {
                    event.preventDefault()
                    imageItems.forEach(item => {
                        const file = item.getAsFile()
                        if (file) handleImageUpload(file)
                    })
                    return true
                }
                return false
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    // Update editor content when prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '')
        }
    }, [content, editor])

    const handleImageUpload = async (file: File) => {
        if (!editor) {
            toast.error('Editor not ready')
            return
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size must be less than 10MB')
            return
        }

        setIsUploading(true)
        const uploadToast = toast.loading('Uploading image...')

        try {
            const formData = new FormData()
            formData.append('file', file)

            // Get token from localStorage
            const token = localStorage.getItem('admin_token')

            if (!token) {
                throw new Error('Authentication required. Please login again.')
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Upload failed')
            }

            const result = await response.json()

            if (!result.data?.url) {
                throw new Error('Invalid response from server')
            }

            // Insert image at current cursor position with proper focus
            editor
                .chain()
                .focus()
                .setImage({ src: result.data.url })
                .run()

            toast.success('Image uploaded successfully!', { id: uploadToast })
        } catch (err: unknown) {
            console.error('Upload error:', err)
            const error = err as { message?: string };
            toast.error(error?.message || 'Failed to upload image. Please try again.', { id: uploadToast })
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        files.forEach(file => handleImageUpload(file))
        // Reset input value
        event.target.value = ''
    }

    const setLink = () => {
        if (!editor) return
        
        if (linkUrl) {
            // Add https:// if no protocol specified
            let url = linkUrl
            if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
                url = 'https://' + url
            }
            
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
            setLinkUrl('')
            setIsLinkDialogOpen(false)
            toast.success('Link added successfully!')
        }
    }

    const removeLink = () => {
        if (!editor) return
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
        setIsLinkDialogOpen(false)
        toast.success('Link removed')
    }

    const addHeading = (level: 1 | 2 | 3) => {
        if (!editor) return
        
        // If already a heading of this level, convert to paragraph
        if (editor.isActive('heading', { level })) {
            editor.chain().focus().setParagraph().run()
        } else {
            // Otherwise, set to this heading level
            editor.chain().focus().setHeading({ level }).run()
        }
    }

    const setTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
        editor?.chain().focus().setTextAlign(alignment).run()
    }

    const setTextColor = (color: string) => {
        editor?.chain().focus().setColor(color).run()
    }

    const setHighlight = (color: string) => {
        editor?.chain().focus().setHighlight({ color }).run()
    }

    const colors = [
        '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
        '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
        '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
        '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
        '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
        '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
    ]

    if (!editor) {
        return (
            <div className="border rounded-lg overflow-hidden min-h-[500px] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading editor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-white">
            {/* Custom Styles for Editor */}
            <style jsx global>{`
                .editor-content h1 {
                    font-size: 2.25rem;
                    font-weight: 700;
                    line-height: 2.5rem;
                    margin: 1.5rem 0;
                    color: #1a202c;
                }
                .editor-content h2 {
                    font-size: 1.875rem;
                    font-weight: 600;
                    line-height: 2.25rem;
                    margin: 1.25rem 0;
                    color: #2d3748;
                }
                .editor-content h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    line-height: 2rem;
                    margin: 1rem 0;
                    color: #4a5568;
                }
                .editor-content p {
                    font-size: 1rem;
                    line-height: 1.75rem;
                    margin: 0.75rem 0;
                    color: #2d3748;
                }
                .editor-content ul, .editor-content ol {
                    margin: 1rem 0;
                    padding-left: 1.5rem;
                }
                .editor-content ul li, .editor-content ol li {
                    margin: 0.5rem 0;
                    line-height: 1.75rem;
                }
                .editor-content ul {
                    list-style-type: disc;
                }
                .editor-content ol {
                    list-style-type: decimal;
                }
                .editor-content blockquote {
                    border-left: 4px solid #cbd5e0;
                    padding-left: 1rem;
                    font-style: italic;
                    margin: 1rem 0;
                    color: #4a5568;
                }
                .editor-content strong {
                    font-weight: 700;
                }
                .editor-content em {
                    font-style: italic;
                }
                .editor-content u {
                    text-decoration: underline;
                }
                .editor-content s {
                    text-decoration: line-through;
                }
                .editor-content code {
                    background-color: #f7fafc;
                    padding: 0.125rem 0.375rem;
                    border-radius: 0.25rem;
                    font-family: 'Courier New', monospace;
                    font-size: 0.875rem;
                    color: #e53e3e;
                }
                .editor-content pre {
                    background-color: #1a202c;
                    color: #f7fafc;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                    overflow-x: auto;
                }
                .editor-content pre code {
                    background: none;
                    color: inherit;
                    padding: 0;
                }
                .editor-content a {
                    color: #3182ce;
                    text-decoration: underline;
                }
                .editor-content a:hover {
                    color: #2c5282;
                }
                .editor-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1.5rem auto;
                    display: block;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror:empty::before {
                    content: attr(data-placeholder);
                    color: #adb5bd;
                    pointer-events: none;
                    position: absolute;
                }
                .ProseMirror:focus {
                    outline: none;
                }
                .editor-scroll-container {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e0 #f7fafc;
                }
                .editor-scroll-container::-webkit-scrollbar {
                    width: 8px;
                }
                .editor-scroll-container::-webkit-scrollbar-track {
                    background: #f7fafc;
                }
                .editor-scroll-container::-webkit-scrollbar-thumb {
                    background-color: #cbd5e0;
                    border-radius: 4px;
                }
                .editor-scroll-container::-webkit-scrollbar-thumb:hover {
                    background-color: #a0aec0;
                }
            `}</style>
            
            {/* Main Toolbar - Made Sticky */}
            <div className="sticky top-0 z-50 border-b bg-gray-50/95 backdrop-blur-sm p-3 shadow-sm">
                <div className="flex flex-wrap gap-1 items-center">
                    {/* Text Formatting */}
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant={editor.isActive('bold') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            title="Make text bold - Use Ctrl+B for quick access"
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive('italic') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            title="Make text italic - Use Ctrl+I for quick access"
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive('underline') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            title="Underline text - Use Ctrl+U for quick access"
                        >
                            <UnderlineIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive('strike') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            title="Strikethrough text - Cross out text with a line"
                        >
                            <Strikethrough className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive('code') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            title="Inline code - Format text as code with monospace font"
                        >
                            <Code className="h-4 w-4" />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    {/* Headings */}
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant={editor.isActive('paragraph') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().setParagraph().run()}
                            title="Normal paragraph text - Convert selected text to regular paragraph"
                        >
                            <Type className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => addHeading(1)}
                            title="Large heading (H1) - Main title, largest text size"
                        >
                            <Heading1 className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => addHeading(2)}
                            title="Medium heading (H2) - Section title, medium text size"
                        >
                            <Heading2 className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => addHeading(3)}
                            title="Small heading (H3) - Subsection title, smaller text size"
                        >
                            <Heading3 className="h-4 w-4" />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    {/* Text Alignment */}
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTextAlign('left')}
                            title="Align text to the left - Standard left alignment"
                        >
                            <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTextAlign('center')}
                            title="Center align text - Perfect for titles and headings"
                        >
                            <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTextAlign('right')}
                            title="Align text to the right - Good for dates and signatures"
                        >
                            <AlignRight className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTextAlign('justify')}
                            title="Justify text - Even spacing on both sides for professional look"
                        >
                            <AlignJustify className="h-4 w-4" />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    {/* Lists */}
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            title="Bullet point list - Create unordered list with bullet points"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            title="Numbered list - Create ordered list with numbers"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            title="Quote block - Highlight important text or citations"
                        >
                            <Quote className="h-4 w-4" />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    {/* Colors */}
                    <div className="flex gap-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" title="Text colors and highlighting - Change text color or add background highlights">
                                    <Palette className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3">
                                <Label className="text-sm font-medium mb-2 block">Text Color</Label>
                                <div className="grid grid-cols-10 gap-1 mb-3">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setTextColor(color)}
                                            title={`Apply text color: ${color} - Click to change selected text color`}
                                        />
                                    ))}
                                </div>
                                <Label className="text-sm font-medium mb-2 block">Highlight</Label>
                                <div className="grid grid-cols-10 gap-1">
                                    {colors.slice(10).map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setHighlight(color)}
                                            title={`Apply highlight color: ${color} - Click to add background color to text`}
                                        />
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    {/* Media & Links */}
                    <div className="flex gap-1">
                        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" title="Insert hyperlink - Add clickable links to websites or pages">
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Insert Hyperlink</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="linkUrl">Website URL</Label>
                                        <Input
                                            id="linkUrl"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            placeholder="https://example.com or mailto:email@example.com"
                                            onKeyPress={(e) => e.key === 'Enter' && setLink()}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Tip: You can also use mailto: for email links
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={setLink} disabled={!linkUrl}>
                                            Add Link
                                        </Button>
                                        <Button variant="outline" onClick={removeLink}>
                                            Remove Link
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Button type="button" variant="ghost" size="sm" title="Upload images - Add images from your device or drag & drop directly into editor" asChild>
                                <span>
                                    {isUploading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ImageIcon className="h-4 w-4" />
                                    )}
                                </span>
                            </Button>
                        </label>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    {/* Undo/Redo */}
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            title="Undo last action - Revert your most recent change (Ctrl+Z)"
                        >
                            <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            title="Redo last action - Restore previously undone change (Ctrl+Y)"
                        >
                            <Redo className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Editor Content - Scrollable */}
            <div className="min-h-[500px] max-h-[700px] bg-white relative overflow-y-auto editor-scroll-container">
                <EditorContent 
                    editor={editor} 
                    className="editor-wrapper"
                />

                {/* Upload Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="text-center bg-white rounded-lg shadow-lg p-6">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">Uploading image...</p>
                            <p className="text-xs text-gray-500 mt-1">Please wait</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-500">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span>💡 <strong>Pro tip:</strong> Drag & drop or paste images directly into the editor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>⌨️ <strong>Shortcuts:</strong> Ctrl+B (Bold) | Ctrl+I (Italic) | Ctrl+Z (Undo)</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

