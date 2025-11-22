import * as React from "react"
import { Calendar, Plus, Trash2, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getTodos, createTodo, updateTodo, deleteTodo } from "@/lib/db"

interface Todo {
    id: string
    task: string
    is_completed: boolean
    due_date?: string
    weekday?: number // 0 = Pazartesi, 6 = Pazar
}

const WEEKDAYS = [
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar"
]

export function TodoList() {
    const [todos, setTodos] = React.useState<Todo[]>([])
    const [loading, setLoading] = React.useState(true)
    const [newTask, setNewTask] = React.useState("")
    const [selectedWeekday, setSelectedWeekday] = React.useState<number>(0)
    const [viewMode, setViewMode] = React.useState<"all" | "weekly">("weekly")

    const loadTodos = async () => {
        try {
            const { data } = await getTodos()
            setTodos(data || [])
        } catch (error) {
            console.error('Error loading todos:', error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        loadTodos()
    }, [])

    const handleAdd = async () => {
        if (!newTask.trim()) return

        try {
            await createTodo({
                task: newTask,
                is_completed: false,
                weekday: viewMode === "weekly" ? selectedWeekday : undefined,
            })
            await loadTodos()
            setNewTask("")
        } catch (error: any) {
            console.error('Error adding todo:', error)
            alert(`❌ Hata: ${error.message}`)
        }
    }

    const handleToggle = async (id: string) => {
        try {
            const todo = todos.find(t => t.id === id)
            if (!todo) return

            await updateTodo(id, { is_completed: !todo.is_completed })
            await loadTodos()
        } catch (error: any) {
            console.error('Error toggling todo:', error)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteTodo(id)
            await loadTodos()
        } catch (error: any) {
            console.error('Error deleting todo:', error)
        }
    }

    const getTodosByWeekday = (weekday: number) => {
        return todos.filter(t => t.weekday === weekday)
    }

    const activeTodos = todos.filter(t => !t.is_completed)
    const completedTodos = todos.filter(t => t.is_completed)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Görevler</h2>
                    <p className="text-sm text-muted-foreground">
                        {activeTodos.length} aktif, {completedTodos.length} tamamlandı
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("all")}
                    >
                        Tümü
                    </Button>
                    <Button
                        variant={viewMode === "weekly" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("weekly")}
                    >
                        <Calendar className="h-4 w-4 mr-1" />
                        Haftalık
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        {viewMode === "weekly" && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {WEEKDAYS.map((day, index) => (
                                    <Button
                                        key={index}
                                        variant={selectedWeekday === index ? "default" : "outline"}
                                        size="sm"
                                        className="whitespace-nowrap"
                                        onClick={() => setSelectedWeekday(index)}
                                    >
                                        {day}
                                    </Button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Input
                                placeholder={viewMode === "weekly" ? `${WEEKDAYS[selectedWeekday]} için görev...` : "Yeni görev ekle..."}
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />
                            <Button onClick={handleAdd} size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {viewMode === "weekly" ? (
                // Haftalık Görünüm
                <div className="space-y-4">
                    {WEEKDAYS.map((day, dayIndex) => {
                        const dayTodos = getTodosByWeekday(dayIndex)
                        if (dayTodos.length === 0 && dayIndex !== selectedWeekday) return null

                        return (
                            <Card key={dayIndex} className={cn(
                                selectedWeekday === dayIndex && "border-primary"
                            )}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center justify-between">
                                        <span>{day}</span>
                                        <Badge variant="secondary">
                                            {dayTodos.filter(t => !t.is_completed).length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {dayTodos.map((todo) => (
                                        <div key={todo.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                                            <button
                                                onClick={() => handleToggle(todo.id)}
                                                className={cn(
                                                    "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                                                    todo.is_completed
                                                        ? "bg-primary border-primary"
                                                        : "border-primary hover:bg-primary/10"
                                                )}
                                            >
                                                {todo.is_completed && <Check className="h-3 w-3 text-primary-foreground" />}
                                            </button>
                                            <div className="flex-1">
                                                <p className={cn(
                                                    "text-sm",
                                                    todo.is_completed && "line-through text-muted-foreground"
                                                )}>
                                                    {todo.task}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleDelete(todo.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    {dayTodos.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Bu gün için görev yok
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                // Tümü Görünümü
                <div className="space-y-3">
                    {activeTodos.map((todo) => (
                        <Card key={todo.id}>
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleToggle(todo.id)}
                                        className="h-5 w-5 rounded border-2 border-primary flex items-center justify-center hover:bg-primary/10 transition-colors"
                                    >
                                        {todo.is_completed && <Check className="h-3 w-3 text-primary" />}
                                    </button>
                                    <div className="flex-1">
                                        <p className="font-medium">{todo.task}</p>
                                        {todo.weekday !== undefined && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                📅 {WEEKDAYS[todo.weekday]}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(todo.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {completedTodos.length > 0 && (
                        <>
                            <div className="pt-4">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tamamlananlar</h3>
                            </div>
                            {completedTodos.map((todo) => (
                                <Card key={todo.id} className="opacity-60">
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleToggle(todo.id)}
                                                className="h-5 w-5 rounded border-2 border-primary flex items-center justify-center bg-primary"
                                            >
                                                <Check className="h-3 w-3 text-primary-foreground" />
                                            </button>
                                            <div className="flex-1">
                                                <p className="font-medium line-through text-muted-foreground">
                                                    {todo.task}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(todo.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
