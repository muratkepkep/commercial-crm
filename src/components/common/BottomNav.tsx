import { Home, Building2, PlusCircle, CheckSquare, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const navItems = [
    { label: "Müşteriler", icon: Home, path: "/" },
    { label: "Portföy", icon: Building2, path: "/properties" },
    { label: "Ekle", icon: PlusCircle, path: "/add" },
    { label: "To-Do", icon: CheckSquare, path: "/todos" },
    { label: "Profil", icon: User, path: "/profile" },
]

export function BottomNav() {
    const location = useLocation()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-md">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs transition-colors",
                                    isActive
                                        ? "text-primary font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
