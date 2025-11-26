
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IndustrialCalculator } from "./IndustrialCalculator"
import type { Property, PropertyCategory, ListingType, Client } from "@/types"
import { X } from "lucide-react"
import { getClientsByRole } from "@/lib/db"
import { MapPicker } from "@/components/common/MapPicker"

interface PropertyFormProps {
    initialData?: Partial<Property>
    onSubmit?: (data: Partial<Property>) => Promise<any>
    isLoading?: boolean
}

export function PropertyForm({ initialData, onSubmit, isLoading }: PropertyFormProps) {
    // Property categorization
    const [propertyCategory, setPropertyCategory] = React.useState<PropertyCategory>(initialData?.property_category || "fabrika")
    const [listingType, setListingType] = React.useState<ListingType>(initialData?.listing_type || initialData?.property_type as any || "satilik")

    // Location fields
    const [address, setAddress] = React.useState(initialData?.address || "")
    const [city, setCity] = React.useState(initialData?.city || "")
    const [district, setDistrict] = React.useState(initialData?.district || "")

    // Property owner for rentals
    const [propertyOwnerId, setPropertyOwnerId] = React.useState(initialData?.property_owner_id || "")
    const [propertyOwners, setPropertyOwners] = React.useState<Client[]>([])

    // Existing fields
    const [closedArea, setClosedArea] = React.useState(initialData?.closed_area_m2?.toString() || "")
    const [openArea, setOpenArea] = React.useState(initialData?.open_area_m2?.toString() || "")
    const [unitPrice, setUnitPrice] = React.useState("")
    const [totalPrice, setTotalPrice] = React.useState(initialData?.price?.toString() || "")
    const [currency, setCurrency] = React.useState<"TRY" | "USD" | "EUR">(initialData?.currency || "TRY")
    const [title, setTitle] = React.useState(initialData?.title || "")
    const [description, setDescription] = React.useState(initialData?.description || "")
    const [height, setHeight] = React.useState(initialData?.height_m?.toString() || "")
    const [power, setPower] = React.useState(initialData?.power_kw?.toString() || "")
    const [ada, setAda] = React.useState(initialData?.ada || "")
    const [parsel, setParsel] = React.useState(initialData?.parsel || "")

    // Category specific fields
    const [roomCount, setRoomCount] = React.useState(initialData?.room_count || "")
    const [floorNumber, setFloorNumber] = React.useState(initialData?.floor_number?.toString() || "")
    const [buildingAge, setBuildingAge] = React.useState(initialData?.building_age || "")
    const [heatingType, setHeatingType] = React.useState(initialData?.heating_type || "")
    const [balcony, setBalcony] = React.useState(initialData?.balcony || false)
    const [elevator, setElevator] = React.useState(initialData?.elevator || false)
    const [furnished, setFurnished] = React.useState(initialData?.furnished || false)
    const [parkingSpots, setParkingSpots] = React.useState(initialData?.parking_spots?.toString() || "")
    const [crane, setCrane] = React.useState(initialData?.crane || false)
    const [entranceHeight, setEntranceHeight] = React.useState(initialData?.entrance_height_m?.toString() || "")
    const [groundLoading, setGroundLoading] = React.useState(initialData?.ground_loading || false)
    const [zoningStatus, setZoningStatus] = React.useState(initialData?.zoning_status || "")
    const [gabari, setGabari] = React.useState(initialData?.gabari?.toString() || "")
    const [kak, setKak] = React.useState(initialData?.kak?.toString() || "")
    const [administrativeBuilding, setAdministrativeBuilding] = React.useState(initialData?.administrative_building || false)

    const [lat, setLat] = React.useState<number | undefined>(initialData?.lat)
    const [lng, setLng] = React.useState<number | undefined>(initialData?.lng)

    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const [existingImages, setExistingImages] = React.useState<string[]>(initialData?.image_urls || [])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Load property owners (clients with role 'ev_sahibi')
    React.useEffect(() => {
        const loadOwners = async () => {
            const { data } = await getClientsByRole('ev_sahibi')
            setPropertyOwners(data)
        }
        loadOwners()
    }, [])

    const handleAreaCalculated = (area: number) => {
        setClosedArea(area.toString())
        calculatePricing(area.toString(), unitPrice, totalPrice, listingType)
    }

    const calculatePricing = (area: string, unit: string, total: string, type: ListingType) => {
        const areaNum = parseFloat(area)
        if (!areaNum) return

        if (type === "kiralik") {
            if (unit) setTotalPrice((areaNum * parseFloat(unit)).toString())
        } else {
            if (total) setUnitPrice((parseFloat(total) / areaNum).toFixed(2))
        }
    }

    const handleUnitPriceChange = (val: string) => {
        setUnitPrice(val)
        if (listingType === "kiralik" && closedArea && val) {
            setTotalPrice((parseFloat(closedArea) * parseFloat(val)).toString())
        }
    }

    const handleTotalPriceChange = (val: string) => {
        setTotalPrice(val)
        if (listingType === "satilik" && closedArea && val) {
            setUnitPrice((parseFloat(val) / parseFloat(closedArea)).toFixed(2))
        }
    }

    const handleClosedAreaChange = (val: string) => {
        setClosedArea(val)
        calculatePricing(val, unitPrice, totalPrice, listingType)
    }

    const handleListingTypeChange = (type: ListingType) => {
        setListingType(type)
        calculatePricing(closedArea, unitPrice, totalPrice, type)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files)
            setSelectedFiles(prev => [...prev, ...filesArray])
        }
    }

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!onSubmit) {
            alert("⚠️ Form handler tanımlı değil")
            return
        }

        try {
            const propertyData: Partial<Property> = {
                title,
                description: description || undefined,
                property_category: propertyCategory,
                listing_type: listingType,
                property_type: listingType, // Keep for backwards compatibility
                price: totalPrice ? parseFloat(totalPrice) : undefined,
                currency,
                address: address || undefined,
                city: city || undefined,
                district: district || undefined,
                closed_area_m2: closedArea ? parseFloat(closedArea) : undefined,
                open_area_m2: openArea ? parseFloat(openArea) : undefined,
                height_m: height ? parseFloat(height) : undefined,
                power_kw: power ? parseFloat(power) : undefined,
                ada: ada || undefined,
                parsel: parsel || undefined,
                property_owner_id: (listingType === "kiralik" && propertyOwnerId) ? propertyOwnerId : undefined,

                // New fields
                room_count: roomCount || undefined,
                floor_number: floorNumber ? parseInt(floorNumber) : undefined,
                building_age: buildingAge || undefined,
                heating_type: heatingType || undefined,
                balcony,
                elevator,
                furnished,
                parking_spots: parkingSpots ? parseInt(parkingSpots) : undefined,
                crane,
                entrance_height_m: entranceHeight ? parseFloat(entranceHeight) : undefined,
                ground_loading: groundLoading,
                zoning_status: zoningStatus || undefined,
                gabari: gabari ? parseFloat(gabari) : undefined,
                kak: kak ? parseFloat(kak) : undefined,
                administrative_building: administrativeBuilding,
                lat,
                lng,
            }

            // Attach image files (handled by parent component)
            if (selectedFiles.length > 0) {
                (propertyData as any)._imageFiles = selectedFiles
            }


            await onSubmit(propertyData)

            // Reset form
            resetForm()
        } catch (error) {
            console.error("Submit error:", error)
        }
    }

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setPropertyCategory("fabrika")
        setListingType("satilik")
        setAddress("")
        setCity("")
        setDistrict("")
        setPropertyOwnerId("")
        setClosedArea("")
        setOpenArea("")
        setUnitPrice("")
        setTotalPrice("")
        setHeight("")
        setPower("")
        setAda("")
        setParsel("")
        setRoomCount("")
        setFloorNumber("")
        setBuildingAge("")
        setHeatingType("")
        setBalcony(false)
        setElevator(false)
        setFurnished(false)
        setParkingSpots("")
        setCrane(false)
        setAdministrativeBuilding(false)
        setEntranceHeight("")
        setGroundLoading(false)
        setZoningStatus("")
        setGabari("")
        setKak("")
        setSelectedFiles([])
        setExistingImages([])
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleShare = () => {
        const categoryLabels = {
            daire: "Daire",
            fabrika: "Fabrika",
            arsa: "Arsa",
            ofis: "Ofis",
            depo: "Depo",
            arazi: "Arazi"
        }
        const typeLabel = listingType === "satilik" ? "SATILIK" : "KİRALIK"
        const priceLabel = listingType === "satilik" ? "Fiyat" : "Aylık Kira"

        const text = `🏭 *YENİ PORTFÖY: ${title}* (${categoryLabels[propertyCategory]} - ${typeLabel})
    
${city && district ? `📍 *Konum:* ${district}, ${city}` : ''}
📐 *Kapalı Alan:* ${closedArea} m²
${openArea ? `🌳 *Açık Alan:* ${openArea} m²` : ''}
💰 *${priceLabel}:* ${totalPrice ? parseFloat(totalPrice).toLocaleString('tr-TR') : ''} ${currency}
${unitPrice ? `💵 *Birim Fiyat:* ${unitPrice} ${currency}/m²` : ''}
    
${height ? `🏗 *Yükseklik:* ${height} m` : ''}
${power ? `⚡ *Enerji:* ${power} kW` : ''}
${ada && parsel ? `📍 *Ada-Parsel:* ${ada}/${parsel}` : ''}
    
Detaylar için arayınız.`.trim()

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{initialData ? "Mülk Düzenle" : "Yeni Mülk Ekle"}</h2>
                <Button type="button" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={handleShare}>
                    WhatsApp Paylaş
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Başlık *</Label>
                    <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: Gebze OSB Satılık Fabrika" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ek notlar..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Mülk Kategorisi *</Label>
                        <Select value={propertyCategory} onValueChange={(v) => setPropertyCategory(v as PropertyCategory)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daire">Daire</SelectItem>
                                <SelectItem value="fabrika">Fabrika</SelectItem>
                                <SelectItem value="arsa">Arsa</SelectItem>
                                <SelectItem value="ofis">Ofis</SelectItem>
                                <SelectItem value="depo">Depo</SelectItem>
                                <SelectItem value="arazi">Arazi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>İlan Tipi *</Label>
                        <Select value={listingType} onValueChange={handleListingTypeChange}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="satilik">Satılık</SelectItem>
                                <SelectItem value="kiralik">Kiralık</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">Şehir</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Örn: Kocaeli" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="district">İlçe</Label>
                        <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Örn: Gebze" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Adres</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Mahalle, sokak, bina no..." />
                </div>

                {listingType === "kiralik" && propertyOwners.length > 0 && (
                    <div className="space-y-2">
                        <Label>Mülk Sahibi</Label>
                        <Select value={propertyOwnerId} onValueChange={setPropertyOwnerId}>
                            <SelectTrigger><SelectValue placeholder="Seçiniz (İsteğe bağlı)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">-- Seçiniz --</SelectItem>
                                {propertyOwners.map(owner => (
                                    <SelectItem key={owner.id} value={owner.id}>
                                        {owner.full_name} {owner.phone && `(${owner.phone})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {listingType === "kiralik" ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unitPrice">Birim Fiyat (m²/ay)</Label>
                                <Input id="unitPrice" type="number" value={unitPrice} onChange={(e) => handleUnitPriceChange(e.target.value)} placeholder="2000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Para Birimi</Label>
                                <Select value={currency} onValueChange={(v) => setCurrency(v as any)}>
                                    <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TRY">TL</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="totalPrice">Aylık Toplam Kira</Label>
                            <Input id="totalPrice" type="number" value={totalPrice} readOnly className="bg-muted font-bold" placeholder="Otomatik Hesaplanır" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="totalPrice">Satış Fiyatı</Label>
                                <Input id="totalPrice" type="number" value={totalPrice} onChange={(e) => handleTotalPriceChange(e.target.value)} placeholder="10000000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Para Birimi</Label>
                                <Select value={currency} onValueChange={(v) => setCurrency(v as any)}>
                                    <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TRY">TL</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unitPrice">Birim Fiyat (m²)</Label>
                            <Input id="unitPrice" type="number" value={unitPrice} readOnly className="bg-muted font-bold" placeholder="Otomatik Hesaplanır" />
                        </div>
                    </>
                )}

                <div className="space-y-2">
                    <Label>Kapalı Alan (m²) *</Label>
                    <div className="flex gap-2">
                        <Input required value={closedArea} onChange={(e) => handleClosedAreaChange(e.target.value)} type="number" placeholder="5000" />
                        <IndustrialCalculator onCalculate={handleAreaCalculated} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="openArea">Açık Alan (m²)</Label>
                    <Input id="openArea" type="number" value={openArea} onChange={(e) => setOpenArea(e.target.value)} placeholder="2000" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="height">Yükseklik (m)</Label>
                        <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="12" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="power">Enerji (kW)</Label>
                        <Input id="power" type="number" value={power} onChange={(e) => setPower(e.target.value)} placeholder="400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ada">Ada</Label>
                        <Input id="ada" value={ada} onChange={(e) => setAda(e.target.value)} placeholder="123" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="parsel">Parsel</Label>
                        <Input id="parsel" value={parsel} onChange={(e) => setParsel(e.target.value)} placeholder="4" />
                    </div>
                </div>

                {/* Category Specific Fields */}
                {(propertyCategory === 'daire' || propertyCategory === 'ofis') && (
                    <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
                        <h3 className="font-semibold text-sm">Daire/Ofis Detayları</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Oda Sayısı</Label>
                                <Select value={roomCount} onValueChange={setRoomCount}>
                                    <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1+0">1+0</SelectItem>
                                        <SelectItem value="1+1">1+1</SelectItem>
                                        <SelectItem value="2+1">2+1</SelectItem>
                                        <SelectItem value="3+1">3+1</SelectItem>
                                        <SelectItem value="4+1">4+1</SelectItem>
                                        <SelectItem value="5+1">5+1</SelectItem>
                                        <SelectItem value="5+2">5+2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Bulunduğu Kat</Label>
                                <Input type="number" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} placeholder="3" />
                            </div>
                            <div className="space-y-2">
                                <Label>Isıtma Tipi</Label>
                                <Select value={heatingType} onValueChange={setHeatingType}>
                                    <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kombi">Kombi</SelectItem>
                                        <SelectItem value="merkezi">Merkezi</SelectItem>
                                        <SelectItem value="yerden">Yerden Isıtma</SelectItem>
                                        <SelectItem value="klima">Klima</SelectItem>
                                        <SelectItem value="soba">Soba</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {propertyCategory === 'daire' && (
                                <div className="space-y-2">
                                    <Label>Bina Yaşı</Label>
                                    <Select value={buildingAge} onValueChange={setBuildingAge}>
                                        <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">0 (Yeni)</SelectItem>
                                            <SelectItem value="1-5">1-5 Yıl</SelectItem>
                                            <SelectItem value="5-10">5-10 Yıl</SelectItem>
                                            <SelectItem value="10-20">10-20 Yıl</SelectItem>
                                            <SelectItem value="20+">20+ Yıl</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={elevator} onChange={(e) => setElevator(e.target.checked)} className="w-4 h-4" />
                                <span className="text-sm">Asansör</span>
                            </label>
                            {propertyCategory === 'daire' && (
                                <>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={balcony} onChange={(e) => setBalcony(e.target.checked)} className="w-4 h-4" />
                                        <span className="text-sm">Balkon</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={furnished} onChange={(e) => setFurnished(e.target.checked)} className="w-4 h-4" />
                                        <span className="text-sm">Eşyalı</span>
                                    </label>
                                </>
                            )}
                            {propertyCategory === 'ofis' && (
                                <div className="flex items-center gap-2">
                                    <Label className="whitespace-nowrap">Otopark (Araç)</Label>
                                    <Input type="number" className="w-20 h-8" value={parkingSpots} onChange={(e) => setParkingSpots(e.target.value)} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(propertyCategory === 'fabrika' || propertyCategory === 'depo') && (
                    <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
                        <h3 className="font-semibold text-sm">Fabrika/Depo Detayları</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Giriş Yüksekliği (m)</Label>
                                <Input type="number" value={entranceHeight} onChange={(e) => setEntranceHeight(e.target.value)} placeholder="5" />
                            </div>
                            <div className="flex flex-col gap-2 pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={crane} onChange={(e) => setCrane(e.target.checked)} className="w-4 h-4" />
                                    <span className="text-sm">Vinç Var</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={administrativeBuilding} onChange={(e) => setAdministrativeBuilding(e.target.checked)} className="w-4 h-4" />
                                    <span className="text-sm">İdari Bina Mevcut</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={groundLoading} onChange={(e) => setGroundLoading(e.target.checked)} className="w-4 h-4" />
                                    <span className="text-sm">Zemin Yüklemesi Uygun</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {(propertyCategory === 'arsa' || propertyCategory === 'arazi') && (
                    <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
                        <h3 className="font-semibold text-sm">Arsa/Arazi Detayları</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>İmar Durumu</Label>
                                <Select value={zoningStatus} onValueChange={setZoningStatus}>
                                    <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="konut">Konut</SelectItem>
                                        <SelectItem value="ticari">Ticari</SelectItem>
                                        <SelectItem value="sanayi">Sanayi</SelectItem>
                                        <SelectItem value="tarla">Tarla</SelectItem>
                                        <SelectItem value="bag_bahce">Bağ/Bahçe</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Gabari</Label>
                                <Input type="number" value={gabari} onChange={(e) => setGabari(e.target.value)} placeholder="6.50" />
                            </div>
                            <div className="space-y-2">
                                <Label>KAK (Emsal)</Label>
                                <Input type="number" value={kak} onChange={(e) => setKak(e.target.value)} placeholder="1.5" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Konum Seçimi</Label>
                    <MapPicker
                        lat={lat}
                        lng={lng}
                        onLocationSelect={(newLat, newLng) => {
                            setLat(newLat)
                            setLng(newLng)
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="images">Görseller (Supabase Storage)</Label>
                    <Input ref={fileInputRef} id="images" type="file" accept="image/*" multiple className="cursor-pointer" onChange={handleFileSelect} />
                    <p className="text-xs text-muted-foreground">Birden fazla görsel seçebilirsiniz - Supabase Storage'a yüklenecek</p>

                    {existingImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {existingImages.map((url, idx) => (
                                <div key={idx} className="relative group">
                                    <img src={url} alt={`Existing ${idx}`} className="w-20 h-20 object-cover rounded border" />
                                    <button type="button" onClick={() => removeExistingImage(idx)} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedFiles.map((file, idx) => (
                                <div key={idx} className="relative group">
                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20 object-cover rounded border" />
                                    <button type="button" onClick={() => removeSelectedFile(idx)} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
            </div>
        </form >
    )
}
