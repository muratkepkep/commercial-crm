import * as React from "react"
import { PropertyList } from "@/components/properties/PropertyList"
import { getProperties, deleteProperty } from "@/lib/db"
import type { Property } from "@/types"

export default function PropertiesPage() {
    const [properties, setProperties] = React.useState<Property[]>([])
    const [loading, setLoading] = React.useState(true)

    const loadProperties = async () => {
        try {
            const { data } = await getProperties()
            setProperties(data || [])
        } catch (error) {
            console.error('Error loading properties:', error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        loadProperties()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            await deleteProperty(id)
            alert("✅ Mülk silindi!")
            await loadProperties()
        } catch (error: any) {
            console.error('Error deleting property:', error)
            alert(`❌ Hata: ${error.message}`)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Portföyler</h2>
            <PropertyList
                properties={properties}
                onDelete={handleDelete}
            />
        </div>
    )
}
