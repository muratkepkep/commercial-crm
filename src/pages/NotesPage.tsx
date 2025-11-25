import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StickyNote, Trash2, Pencil, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { getNotes, createNote, updateNote, deleteNote } from "@/lib/db"
import type { Note } from "@/types"

export default function NotesPage() {
    const [notes, setNotes] = React.useState<Note[]>([])
    const [isAddingNote, setIsAddingNote] = React.useState(false)
    const [editingNote, setEditingNote] = React.useState<Note | null>(null)
    const [title, setTitle] = React.useState("")
    const [content, setContent] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        loadNotes()
    }, [])

    const loadNotes = async () => {
        const { data } = await getNotes()
        setNotes(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (editingNote) {
                await updateNote(editingNote.id, { title, content })
                alert("✅ Not güncellendi!")
            } else {
                await createNote({ title, content })
                alert("✅ Not kaydedildi!")
            }

            resetForm()
            loadNotes()
        } catch (error) {
            console.error("Note save error:", error)
            alert("❌ Not kaydedilemedi")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu notu silmek istediğinizden emin misiniz?")) return

        await deleteNote(id)
        loadNotes()
    }

    const handleEdit = (note: Note) => {
        setEditingNote(note)
        setTitle(note.title)
        setContent(note.content || "")
        setIsAddingNote(true)
    }

    const resetForm = () => {
        setTitle("")
        setContent("")
        setEditingNote(null)
        setIsAddingNote(false)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <>
            <div className="p-4 pb-20 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <StickyNote className="h-6 w-6" />
                        Notlar
                    </h1>
                    <Button onClick={() => setIsAddingNote(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Yeni Not
                    </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                    {notes.length} not kayıtlı
                </p>

                <div className="grid  gap-4">
                    <AnimatePresence mode="popLayout">
                        {notes.map((note) => (
                            <motion.div
                                key={note.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="overflow-hidden border-none shadow-md bg-white/80 dark:bg-black/40 backdrop-blur-md">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-base">{note.title}</CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDate(note.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(note)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(note.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {note.content && (
                                        <CardContent className="pt-0">
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {note.content}
                                            </p>
                                        </CardContent>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {notes.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Henüz not eklenmemiş</p>
                            <Button onClick={() => setIsAddingNote(true)} className="mt-4">
                                İlk Notu Ekle
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Sheet open={isAddingNote} onOpenChange={(open) => !open && resetForm()}>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingNote ? "Notu Düzenle" : "Yeni Not Ekle"}</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Başlık *</Label>
                            <Input
                                id="title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Not başlığı..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">İçerik</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Not içeriği..."
                                rows={8}
                            />
                        </div>

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={resetForm}>İptal</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Kaydediliyor..." : "Kaydet"}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    )
}
