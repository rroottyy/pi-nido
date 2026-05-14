import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix icono por defecto de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function PropertyMap({ address, city, province, title }) {
    const [coords, setCoords] = useState(null)
    const [error, setError]   = useState(false)

    useEffect(() => {
        if (!address || !city) return

        const query = `${address}, ${city}, ${province}`

        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
            headers: { 'Accept-Language': 'es' }
        })
        .then(r => r.json())
        .then(data => {
            if (data.length > 0) {
                setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)])
            } else {
                setError(true)
            }
        })
        .catch(() => setError(true))
    }, [address, city, province])

    if (error) return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-300">📍 Ubicación no disponible</p>
        </div>
    )

    if (!coords) return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-300">Cargando mapa...</p>
        </div>
    )

    return (
        <MapContainer
            center={coords}
            zoom={16}
            className="w-full h-full rounded-2xl z-0"
            scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coords}>
                <Popup>{title}</Popup>
            </Marker>
        </MapContainer>
    )
}