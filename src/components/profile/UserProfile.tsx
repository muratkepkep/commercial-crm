import { User as UserIcon, LogOut, BarChart3, Building2, Users, CheckSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface UserProfileProps {
    user?: {
        name: string
        email: string
        role: string
        avatar_url?: string
    }
}

const mockStats = {
    clients: 12,
    properties: 8,
    todos: 5,
    todosCompleted: 3,
}

export function UserProfile({ user }: UserProfileProps) {
    const currentUser = user || {
        name: "Murat Kepkep",
        email: "murat@example.com",
        role: "Admin",
    }

    return (
        <div className="space-y-6 pb-20">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <h2 className="text-xl font-bold truncate">{currentUser.name}</h2>
                            <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                            <p className="text-xs text-primary font-semibold mt-1">👤 {currentUser.role}</p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        İstatistikler
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span className="text-sm">Müşteriler</span>
                            </div>
                            <p className="text-2xl font-bold">{mockStats.clients}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span className="text-sm">Portföyler</span>
                            </div>
                            <p className="text-2xl font-bold">{mockStats.properties}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CheckSquare className="h-4 w-4" />
                            <span className="text-sm">Görevler</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-lg">
                                <span className="font-bold text-primary">{mockStats.todosCompleted}</span>
                                <span className="text-muted-foreground"> / {mockStats.todos}</span>
                            </p>
                            <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${(mockStats.todosCompleted / mockStats.todos) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ayarlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Profili Düzenle
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10">
                        <LogOut className="h-4 w-4 mr-2" />
                        Çıkış Yap
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
