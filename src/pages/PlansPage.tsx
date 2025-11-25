import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, CheckCircle2, Circle, Trash2, Pencil, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { getPlans, createPlan, updatePlan, deletePlan, completePlan } from "@/lib/db"
import type { Plan } from "@/types"

export default function PlansPage() {
    const [plans, setPlans] = React.useState<Plan[]>([])
    const [isAddingPlan, setIsAddingPlan] = React.useState(false)
    const [editingPlan, setEditingPlan] = React.useState<Plan | null>(null)
    const [title, setTitle] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [scheduledDate, setScheduledDate] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        loadPlans()
    }, [])

    const loadPlans = async () => {
        const { data } = await getPlans()
        setPlans(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const planData = {
                title,
                description: description || undefined,
                scheduled_date: scheduledDate || undefined,
            }

            if (editingPlan) {
                await updatePlan(editingPlan.id, planData)
                alert("✅ Plan güncellendi!")
            } else {
                await createPlan(planData)
                alert("✅ Plan kaydedildi!")
            }

            resetForm()
            loadPlans()
        } catch (error) {
            console.error("Plan save error:", error)
            alert("❌ Plan kaydedilemedi")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu planı silmek istediğinizden emin misiniz?")) return

        await deletePlan(id)
        loadPlans()
    }

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan)
        setTitle(plan.title)
        setDescription(plan.description || "")
        setScheduledDate(plan.scheduled_date ? plan.scheduled_date.split('T')[0] : "")
        setIsAddingPlan(true)
    }

    const handleToggleComplete = async (plan: Plan) => {
        if (plan.is_completed) {
            // Un-complete
            await updatePlan(plan.id, { is_completed: false, completed_at: undefined })
        } else {
            // Complete
            await completePlan(plan.id)
        }
        loadPlans()
    }

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setScheduledDate("")
        setEditingPlan(null)
        setIsAddingPlan(false)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const incompletePlans = plans.filter(p => !p.is_completed)
    const completedPlans = plans.filter(p => p.is_completed)

    return (
        <>
            <div className="p-4 pb-20 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        Planlar
                    </h1>
                    <Button onClick={() => setIsAddingPlan(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Yeni Plan
                    </Button>
                </div>

                <div className="flex gap-4 text-sm">
                    <div className="text-muted-foreground">
                        {incompletePlans.length} aktif plan
                    </div>
                    <div className="text-muted-foreground">
                        {completedPlans.length} tamamlandı
                    </div>
                </div>

                {incompletePlans.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="font-semibold text-sm">Yaklaşan Planlar</h2>
                        <AnimatePresence mode="popLayout">
                            {incompletePlans.map((plan) => (
                                <motion.div
                                    key={plan.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <PlanCard
                                        plan={plan}
                                        onToggleComplete={handleToggleComplete}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        formatDate={formatDate}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {completedPlans.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="font-semibold text-sm text-muted-foreground">Tamamlanan Planlar</h2>
                        <AnimatePresence mode="popLayout">
                            {completedPlans.map((plan) => (
                                <motion.div
                                    key={plan.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <PlanCard
                                        plan={plan}
                                        onToggleComplete={handleToggleComplete}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        formatDate={formatDate}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {plans.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Henüz plan eklenmemiş</p>
                        <Button onClick={() => setIsAddingPlan(true)} className="mt-4">
                            İlk Planı Ekle
                        </Button>
                    </div>
                )}
            </div>

            <Sheet open={isAddingPlan} onOpenChange={(open) => !open && resetForm()}>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingPlan ? "Planı Düzenle" : "Yeni Plan Ekle"}</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Başlık *</Label>
                            <Input
                                id="title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Plan başlığı..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduled_date">Tarih</Label>
                            <Input
                                id="scheduled_date"
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Plan açıklaması..."
                                rows={6}
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

function PlanCard({ plan, onToggleComplete, onEdit, onDelete, formatDate }: {
    plan: Plan
    onToggleComplete: (plan: Plan) => void
    onEdit: (plan: Plan) => void
    onDelete: (id: string) => void
    formatDate: (date: string) => string
}) {
    return (
        <Card className={`overflow-hidden border-none shadow-md backdrop-blur-md ${plan.is_completed ? 'opacity-60 bg-white/60 dark:bg-black/20' : 'bg-white/80 dark:bg-black/40'}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                    <button
                        onClick={() => onToggleComplete(plan)}
                        className="flex-shrink-0 mt-0.5"
                    >
                        {plan.is_completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                    </button>
                    <div className="flex-1">
                        <CardTitle className={`text-base ${plan.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                            {plan.title}
                        </CardTitle>
                        {plan.scheduled_date && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(plan.scheduled_date)}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(plan)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(plan.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            {plan.description && (
                <CardContent className="pt-0 pl-11">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {plan.description}
                    </p>
                </CardContent>
            )}
        </Card>
    )
}
