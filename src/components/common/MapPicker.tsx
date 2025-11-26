import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    lat?: number;
    lng?: number;
}

function LocationMarker({ onLocationSelect, initialPosition }: { onLocationSelect: (lat: number, lng: number) => void; initialPosition?: L.LatLng | null }) {
    const [position, setPosition] = useState<L.LatLng | null>(initialPosition || null)

    useMapEvents({
        click(e) {
            setPosition(e.latlng)
            onLocationSelect(e.latlng.lat, e.latlng.lng)
        },
    })

    return position === null ? null : (
        <Marker position={position} />
    )
}

function GeolocationButton({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
    const map = useMap()
    const [loading, setLoading] = useState(false)

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Tarayıcınız konum özelliğini desteklemiyor')
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                map.setView([latitude, longitude], 15)
                onLocationFound(latitude, longitude)
                setLoading(false)
            },
            (error) => {
                console.error('Geolocation error:', error)
                alert('Konum bilgisi alınamadı. Lütfen tarayıcınızdan konum iznini kontrol edin.')
                setLoading(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    return (
        <Button
            onClick={handleGetLocation}
            disabled={loading}
            size="sm"
            className="absolute top-2 right-2 z-[1000] shadow-lg"
            variant="default"
        >
            <Navigation className={`h-4 w-4 mr-1 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Alınıyor...' : 'Konumumu Al'}
        </Button>
    )
}

export function MapPicker({ onLocationSelect, lat, lng }: MapPickerProps) {
    // Create initial position if lat/lng are provided
    const initialPosition = (lat != null && lng != null) ? L.latLng(lat, lng) : null
    const centerPosition: [number, number] = (lat != null && lng != null) ? [lat, lng] : [41.0082, 28.9784]

    const handleLocationFound = (newLat: number, newLng: number) => {
        onLocationSelect(newLat, newLng)
    }

    return (
        <div className="h-[300px] w-full rounded-md overflow-hidden border z-0 relative">
            <MapContainer
                center={centerPosition}
                zoom={lat != null && lng != null ? 15 : 13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelect={onLocationSelect} initialPosition={initialPosition} />
                <GeolocationButton onLocationFound={handleLocationFound} />
            </MapContainer>
        </div>
    )
}
