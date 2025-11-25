import * as React from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Loader2 } from "lucide-react"
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
    lat?: number
    lng?: number
    onLocationSelect: (lat: number, lng: number) => void
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng)
        },
    })
    return position === null ? null : (
        <Marker position={position}></Marker>
    )
}

function MapUpdater({ center }: { center: [number, number] | null }) {
    const map = useMap()
    React.useEffect(() => {
        if (center) {
            map.flyTo(center, 15)
        }
    }, [center, map])
    return null
}

export function MapPicker({ lat, lng, onLocationSelect }: MapPickerProps) {
    const [position, setPosition] = React.useState<L.LatLng | null>(lat && lng ? new L.LatLng(lat, lng) : null)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isSearching, setIsSearching] = React.useState(false)
    const [mapCenter, setMapCenter] = React.useState<[number, number] | null>(lat && lng ? [lat, lng] : [41.0082, 28.9784]) // Default Istanbul

    React.useEffect(() => {
        if (lat && lng) {
            const newPos = new L.LatLng(lat, lng)
            setPosition(newPos)
            setMapCenter([lat, lng])
        }
    }, [lat, lng])

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
            const data = await response.json()

            if (data && data.length > 0) {
                const result = data[0]
                const newLat = parseFloat(result.lat)
                const newLng = parseFloat(result.lon)
                const newPos = new L.LatLng(newLat, newLng)

                setMapCenter([newLat, newLng])
                setPosition(newPos)
                onLocationSelect(newLat, newLng)
            } else {
                alert("Adres bulunamadı.")
            }
        } catch (error) {
            console.error("Search error:", error)
            alert("Arama sırasında hata oluştu.")
        } finally {
            setIsSearching(false)
        }
    }

    const handleMapClick = (pos: L.LatLng) => {
        setPosition(pos)
        onLocationSelect(pos.lat, pos.lng)
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    placeholder="Adres ara (İl, ilçe, mahalle...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                />
                <Button type="button" onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </div>

            <div className="h-[300px] rounded-lg overflow-hidden border z-0 relative">
                <MapContainer
                    center={mapCenter || [41.0082, 28.9784]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <LocationMarker position={position} setPosition={handleMapClick} />
                    <MapUpdater center={mapCenter} />
                </MapContainer>

                {!position && (
                    <div className="absolute top-2 right-2 bg-white/90 p-2 rounded text-xs text-muted-foreground z-[1000] pointer-events-none">
                        Konum seçmek için haritaya tıklayın
                    </div>
                )}
            </div>

            {position && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>Seçilen Konum: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</span>
                </div>
            )}
        </div>
    )
}
