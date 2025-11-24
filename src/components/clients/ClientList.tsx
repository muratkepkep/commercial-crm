import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Phone, Briefcase, Factory } from "lucide-react"
import type { Client, ClientRole } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AddClientForm } from "./AddClientForm"
import { getClients, createClient } from "@/lib/db"

export function ClientList() {
    const [clients, setClients] = React.useState<Client[]>([])
    const [loading, setLoading] = React.useState(true)
    const [filter, setFilter] = React.useState<ClientRole | "all">("all")
    const [isAddOpen, setIsAddOpen] = React.useState(false)

    const loadClients = async () => {
        try {
            const { data } = await getClients()
            setClients(data || [])
        } catch (error) {
            console.error('Error loading clients:', error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        loadClients()
    }, [])

    const filteredClients = React.useMemo(() => filter === "all" ? clients : clients.filter(c => c.role === filter), [clients, filter])

    const handleAddClient = async (data: any) => {
        try {
            await createClient(data)
            await loadClients()
            setIsAddOpen(false)
            alert("✅ Müşteri eklendi!")
        } catch (error: any) {
            console.error('Error adding client:', error)
            alert(`❌ Hata: ${error.message}`)
        }
    }

    const getRoleLabel = (role: ClientRole) => role === "alici" ? "Alıcı" : role === "satici" ? "Satıcı" : "Kiracı"

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-4 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Müşteri Defteri</h1>
                <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <SheetTrigger asChild>
                        <Button size="icon" className="rounded-full h-12 w-12 shadow-lg"><Plus className="h-6 w-6" /></Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
                        <SheetHeader className="mb-4">
                            <SheetTitle>Yeni Müşteri Ekle</SheetTitle>
                            <SheetDescription>Müşteri bilgilerini ve taleplerini giriniz.</SheetDescription>
                        </SheetHeader>
                        <AddClientForm onSubmit={handleAddClient} onCancel={() => setIsAddOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)} className="w-full">
                <TabsList className="w-full grid grid-cols-4 p-1 bg-muted/50 backdrop-blur-sm">
                    <TabsTrigger value="all" className="text-xs">TÜMÜ</TabsTrigger>
                    <TabsTrigger value="alici" className="text-xs">ALICI</TabsTrigger>
                    <TabsTrigger value="satici" className="text-xs">SATICI</TabsTrigger>
                    <TabsTrigger value="kiraci" className="text-xs">KİRACI</TabsTrigger>
                </TabsList>
            </Tabs>

            {filteredClients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Henüz müşteri eklenmemiş.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredClients.map((client) => (
                            <motion.div key={client.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                                <Card className="overflow-hidden border-none shadow-md bg-white/80 dark:bg-black/40 backdrop-blur-md">
                                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                                        <div>
                                            <h3 className="font-semibold text-lg">{client.full_name}</h3>
                                            <Badge variant="default" className="mt-1">{getRoleLabel(client.role)}</Badge>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => window.open(`tel:${client.phone}`)}>
                                            <Phone className="h-5 w-5" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2 space-y-3">
                                        {client.current_job && <div className="flex items-center text-sm text-muted-foreground"><Briefcase className="mr-2 h-4 w-4 opacity-70" /><span>{client.current_job}</span></div>}
                                        {client.planned_activity && <div className="flex items-center text-sm font-medium text-primary"><Factory className="mr-2 h-4 w-4" /><span>{client.planned_activity}</span></div>}
                                        {client.notes && <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md mt-2">{client.notes}</p>}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
