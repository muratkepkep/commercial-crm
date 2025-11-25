import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, MapPin, Building2, Share2, Pencil, Trash2, Calendar, Ruler, Zap, ArrowUpFromLine, ChevronRight } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { getProperty, getPropertyImages, getPropertyImageUrl, deleteProperty, deletePropertyImage } from "@/lib/db"
import { useAuth } from "@/contexts/AuthContext"
import { canEdit, canDelete } from "@/lib/auth"
import type { Property } from "@/types"

// Fix Leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyImage {
    id: string
    storage_path: string
    file_name: string
    display_order: number
}

export default function PropertyDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [property, setProperty] = React.useState<Property | null>(null)
    const [images, setImages] = React.useState<PropertyImage[]>([])
    const [loading, setLoading] = React.useState(true)
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

    React.useEffect(() => {
        const loadData = async () => {
            if (!id) return
            setLoading(true)
            try {
                const [propRes, imgRes] = await Promise.all([
                    getProperty(id),
                    getPropertyImages(id)
                ])

                if (propRes.data) {
                    setProperty(propRes.data)
                }
                if (imgRes.data) {
                    setImages(imgRes.data)
                }
            } catch (error) {
                console.error("Error loading property details:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id])

    const handleShare = () => {
        if (!property) return
        const typeLabel = property.property_type === "satilik" ? "SATILIK" : "KİRALIK"
        const text = `
🏭 *${property.title}* (${typeLabel})

📐 *Kapalı Alan:* ${property.closed_area_m2} m²
${property.open_area_m2 ? `🌳 *Açık Alan:* ${property.open_area_m2} m²` : ''}
💰 *Fiyat:* ${property.price?.toLocaleString('tr-TR')} ${property.currency}
${property.height_m ? `🏗 *Yükseklik:* ${property.height_m} m` : ''}
${property.power_kw ? `⚡ *Enerji:* ${property.power_kw} kW` : ''}
${property.ada && property.parsel ? `📍 *Ada-Parsel:* ${property.ada}/${property.parsel}` : ''}

Detaylar için: ${window.location.href}
    `.trim()

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    const handleDelete = async () => {
        if (!property || !confirm(`"${property.title}" mülkü silinsin mi?`)) return

        try {
            for (const img of images) {
                await deletePropertyImage(img.id, img.storage_path)
            }
            await deleteProperty(property.id)
            navigate('/properties')
        } catch (error) {
            console.error('Error deleting property:', error)
            alert('Mülk silinirken hata oluştu.')
        }
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>
    }

    if (!property) {
        return <div className="flex flex-col items-center justify-center h-screen gap-4">
            <p>Mülk bulunamadı.</p>
            <Button onClick={() => navigate('/properties')}>Geri Dön</Button>
        </div>
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="font-semibold text-lg truncate flex-1">{property.title}</h1>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                </Button>
            </div>

            <div className="p-4 space-y-6 max-w-3xl mx-auto">
                {/* Image Gallery */}
                {images.length > 0 ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-muted group">
                        <img
                            src={getPropertyImageUrl(images[currentImageIndex].storage_path)}
                            alt={`${property.title} - ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                        Görsel Yok
                    </div>
                )}

                {/* Key Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-muted-foreground mb-1">Fiyat</span>
                            <div className="font-bold text-xl text-primary">
                                {property.price?.toLocaleString('tr-TR')} {property.currency}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-secondary/50 border-secondary">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-muted-foreground mb-1">Kapalı Alan</span>
                            <div className="font-bold text-xl">
                                {property.closed_area_m2} m²
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details List */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-lg">Özellikler</h2>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                                <ArrowUpFromLine className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Yükseklik</p>
                                <p className="font-medium">{property.height_m} m</p>
                            </div>
                        </div>
                        )}

                        {property.power_kw && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30">
                                    <Zap className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Enerji Gücü</p>
                                    <p className="font-medium">{property.power_kw} kW</p>
                                </div>
                            </div>
                        )}

                        {(property.ada || property.parsel) && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Ada / Parsel</p>
                                    <p className="font-medium">{property.ada || '-'} / {property.parsel || '-'}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">İlan Tarihi</p>
                                <p className="font-medium">{new Date(property.created_at).toLocaleDateString('tr-TR')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Description */}
                {property.description && (
                    <div className="space-y-2">
                        <h2 className="font-semibold text-lg">Açıklama</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {property.description}
                        </p>
                    </div>
                )}

                <Separator />

                {/* Map */}
                <div className="space-y-2">
                    <h2 className="font-semibold text-lg">Konum</h2>
                    <div className="h-64 rounded-xl overflow-hidden border z-0 relative">
                        {property.lat && property.lng ? (
                            <MapContainer
                                center={[property.lat, property.lng]}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                dragging={false}
                                touchZoom={false}
                                scrollWheelZoom={false}
                                doubleClickZoom={false}
                                zoomControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[property.lat, property.lng]}>
                                    <Popup>{property.title}</Popup>
                                </Marker>
                            </MapContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-muted text-muted-foreground">
                                Konum bilgisi yok
                            </div>
                        )}
                    </div>
                    {(property.city || property.district) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{property.district}, {property.city}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-3">
                    {canEdit(user?.role || 'viewer') && (
                        <Button className="flex-1" variant="outline" onClick={() => {
                            // Edit logic here - maybe open sheet with initial data
                            // For now, we might need to pass state back or handle it differently
                            // Since we are on a separate page, we might need a dedicated edit page or modal
                            alert("Düzenleme özelliği bu sayfada henüz aktif değil. Listeden düzenleyebilirsiniz.")
                        }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Düzenle
                        </Button>
                    )}
                    {canDelete(user?.role || 'viewer') && (
                        <Button className="flex-1" variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
