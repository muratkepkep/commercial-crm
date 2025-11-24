import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, MapPin, DollarSign, Share2, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { PropertyForm } from "./PropertyForm"
import { getPropertyImages, getPropertyImageUrl, deletePropertyImage } from "@/lib/db"
import type { Property } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { canEdit, canDelete } from "@/lib/auth"

interface PropertyListProps {
    properties?: Property[]
    onDelete?: (id: string) => void
}

interface PropertyImage {
    id: string
    storage_path: string
    file_name: string
    display_order: number
}

export function PropertyList({ properties = [], onDelete }: PropertyListProps) {
    const [editingProperty, setEditingProperty] = React.useState<Property | null>(null)
    const [imageIndexes, setImageIndexes] = React.useState<Record<string, number>>({})
    const [propertyImages, setPropertyImages] = React.useState<Record<string, PropertyImage[]>>({})
    const { user } = useAuth()

    // Fetch images from property_images table
    React.useEffect(() => {
        const loadImages = async () => {
            const imagesMap: Record<string, PropertyImage[]> = {}

            for (const property of properties) {
                const { data } = await getPropertyImages(property.id)
                if (data && data.length > 0) {
                    imagesMap[property.id] = data
                }
            }

            setPropertyImages(imagesMap)
        }

        if (properties.length > 0) {
            loadImages()
        }
    }, [properties])

    const handleShare = (property: Property) => {
        const typeLabel = property.property_type === "satilik" ? "SATILIK" : "KİRALIK"

        // Get images from state
        const images = propertyImages[property.id] || []
        const imageUrls = images.map(img => getPropertyImageUrl(img.storage_path))

        let text = `
🏭 *${property.title}* (${typeLabel})

📐 *Kapalı Alan:* ${property.closed_area_m2} m²
${property.open_area_m2 ? `🌳 *Açık Alan:* ${property.open_area_m2} m²` : ''}
💰 *Fiyat:* ${property.price?.toLocaleString('tr-TR')} ${property.currency}
${property.height_m ? `🏗 *Yükseklik:* ${property.height_m} m` : ''}
${property.power_kw ? `⚡ *Enerji:* ${property.power_kw} kW` : ''}
${property.ada && property.parsel ? `📍 *Ada-Parsel:* ${property.ada}/${property.parsel}` : ''}

Detaylar için arayınız.
    `.trim()

        if (imageUrls.length > 0) {
            text += `\\n\\n📸 *Görseller:*\\n${imageUrls.slice(0, 3).join('\\n')}`
        }

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    const handleDeleteClick = async (property: Property) => {
        if (!confirm(`"${property.title}" mülkü silinsin mi?`)) return

        try {
            const images = propertyImages[property.id] || []
            for (const img of images) {
                await deletePropertyImage(img.id, img.storage_path)
            }
            onDelete?.(property.id)
        } catch (error) {
            console.error('Error deleting property:', error)
            alert('Mülk silinirken hata oluştu.')
        }
    }

    const handleEdit = (property: Property) => {
        setEditingProperty(property)
    }

    const nextImage = (propertyId: string, totalImages: number) => {
        setImageIndexes(prev => ({
            ...prev,
            [propertyId]: ((prev[propertyId] || 0) + 1) % totalImages
        }))
    }

    const prevImage = (propertyId: string, totalImages: number) => {
        setImageIndexes(prev => ({
            ...prev,
            [propertyId]: ((prev[propertyId] || 0) - 1 + totalImages) % totalImages
        }))
    }

    const getCurrentImageIndex = (propertyId: string) => imageIndexes[propertyId] || 0

    return (
        <>
            <div className="space-y-4 pb-20">
                <div className="flex items-center justify-between">
                    <Badge variant="secondary">{properties.length} Mülk</Badge>
                </div>

                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {properties.map((property) => {
                            const currentImageIndex = getCurrentImageIndex(property.id)
                            const images = propertyImages[property.id] || []
                            const hasImages = images.length > 0

                            return (
                                <motion.div
                                    key={property.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="overflow-hidden border-none shadow-md bg-white/80 dark:bg-black/40 backdrop-blur-md">
                                        {hasImages && (
                                            <div className="relative h-48 bg-muted">
                                                <img
                                                    src={getPropertyImageUrl(images[currentImageIndex].storage_path)}
                                                    alt={property.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                {images.length > 1 && (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                                                            onClick={() => prevImage(property.id, images.length)}
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                                                            onClick={() => nextImage(property.id, images.length)}
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                                            {currentImageIndex + 1} / {images.length}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold leading-none">{property.title}</h3>
                                                    {property.description && (
                                                        <p className="text-sm text-muted-foreground">{property.description}</p>
                                                    )}
                                                </div>
                                                <Badge variant={property.property_type === "satilik" ? "default" : "secondary"}>
                                                    {property.property_type === "satilik" ? "Satılık" : "Kiralık"}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pb-3">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                {property.closed_area_m2 && (
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <span>{property.closed_area_m2} m²</span>
                                                    </div>
                                                )}
                                                {property.price && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-semibold text-primary">
                                                            {property.price.toLocaleString('tr-TR')} {property.currency}
                                                        </span>
                                                    </div>
                                                )}
                                                {(property.lat && property.lng) && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            {property.lat.toFixed(4)}, {property.lng.toFixed(4)}
                                                        </span>
                                                    </div>
                                                )}
                                                {property.power_kw && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <span>⚡ {property.power_kw} kW</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="gap-2 pt-3">
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleShare(property)}>
                                                <Share2 className="h-4 w-4 mr-1" />
                                                Paylaş
                                            </Button>
                                            {canEdit(user?.role || 'viewer') && (
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(property)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canDelete(user?.role || 'viewer') && (
                                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteClick(property)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>

            <Sheet open={!!editingProperty} onOpenChange={(open) => !open && setEditingProperty(null)}>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Mülk Düzenle</SheetTitle>
                    </SheetHeader>
                    {editingProperty && (
                        <PropertyForm
                            initialData={editingProperty}
                            onSubmit={async (updatedData) => {
                                try {
                                    console.log('🔵 Updating property:', editingProperty.id, updatedData)
                                    const { updateProperty } = await import('@/lib/db')
                                    const { error } = await updateProperty(editingProperty.id, updatedData)

                                    if (error) {
                                        console.error('🔴 Update error:', error)
                                        alert(`❌ Güncelleme hatası: ${error.message || JSON.stringify(error)}`)
                                        return
                                    }

                                    console.log('✅ Property updated successfully')
                                    alert('✅ Mülk güncellendi!')
                                    setEditingProperty(null)

                                    // Listeyi yenile
                                    window.location.reload()
                                } catch (error: any) {
                                    console.error('🔴 Exception updating property:', error)
                                    alert(`❌ Hata: ${error.message || 'Beklenmeyen hata'}`)
                                }
                            }}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
