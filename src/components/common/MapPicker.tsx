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
    initialLat?: number;
    initialLng?: number;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null)

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

export function MapPicker({ onLocationSelect, initialLat = 41.0082, initialLng = 28.9784 }: MapPickerProps) {
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null)

    const handleLocationFound = (lat: number, lng: number) => {
        setCurrentPosition([lat, lng])
        onLocationSelect(lat, lng)
    }

    return (
        <div className="h-[300px] w-full rounded-md overflow-hidden border z-0 relative">
            <MapContainer
                center={[initialLat, initialLng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelect={onLocationSelect} />
                {currentPosition && <Marker position={currentPosition} />}
                <GeolocationButton onLocationFound={handleLocationFound} />
            </MapContainer>
        </div>
    )
}
