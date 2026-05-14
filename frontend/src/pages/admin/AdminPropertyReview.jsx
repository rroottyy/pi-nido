import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const TYPE_LABELS = {
    apartment:  'Piso',
    house:      'Casa',
    land:       'Terreno',
    commercial: 'Local comercial',
    garage:     'Garaje',
}

export default function AdminPropertyReview() {
    const { id }            = useParams()
    const navigate          = useNavigate()
    const [property, setProperty] = useState(null)
    const [loading, setLoading]   = useState(true)
    const [acting, setActing]     = useState(false)
    const [showReject, setShowReject]   = useState(false)
    const [showDelete, setShowDelete]   = useState(false)
    const [reason, setReason]           = useState('')
    const [reasonError, setReasonError] = useState('')
    const [deleteReason, setDeleteReason] = useState('')
    const [mainImage, setMainImage]     = useState(0)
    const { decreasePending } = useAuth()

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const { data } = await api.get(`/admin/properties/${id}`)
                setProperty(data.data)
            } catch {
                navigate('/admin/properties')
            } finally {
                setLoading(false)
            }
        }
        fetchProperty()
    }, [id])

    const handleApprove = async () => {
        setActing(true)
        try {
            await api.put(`/admin/properties/${id}/approve`)
            decreasePending()
            navigate('/admin', { state: { success: 'Anuncio aprobado correctamente.' } })
        } catch {
            setActing(false)
        }
    }

    const handleReject = async () => {
        if (!reason.trim() || reason.trim().length < 10) {
            setReasonError('El motivo debe tener al menos 10 caracteres.')
            return
        }
        setActing(true)
        try {
            await api.put(`/admin/properties/${id}/reject`, { reason })
            decreasePending()
            navigate('/admin', { state: { success: 'Anuncio rechazado y propietario notificado.' } })
        } catch {
            setActing(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteReason.trim()) return
        setActing(true)
        try {
            await api.post(`/properties/${id}/messages`, {
                body: `🗑️ Tu anuncio "${property.title}" ha sido eliminado por el administrador.\n\nMotivo: ${deleteReason}`
            })
            await api.delete(`/admin/properties/${id}`)
            navigate('/admin/properties')
        } catch {
            setActing(false)
        }
    }

    if (loading) return <AdminLayout><Spinner /></AdminLayout>

    const images = property.images || []

    return (
        <AdminLayout>

            {/* Cabecera */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-2 block transition-colors">
                        ← Volver
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{property.title}</h1>
                </div>

                {/* Acciones */}
                {property.status === 'pending' && !showReject && (
                    <div className="flex gap-3">
                        <Button
                            variant="danger"
                            onClick={() => setShowReject(true)}
                            disabled={acting}>
                            ❌ Rechazar
                        </Button>
                        <Button
                            onClick={handleApprove}
                            loading={acting}>
                            ✅ Aprobar
                        </Button>
                    </div>
                )}

                {property.status !== 'pending' && !showDelete && (
                    <Button
                        variant="danger"
                        onClick={() => setShowDelete(true)}>
                        🗑️ Eliminar anuncio
                    </Button>
                )}
            </div>

            {/* Panel de rechazo */}
            {showReject && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-5 mb-6 transition-colors duration-200">
                    <h3 className="font-semibold text-red-800 dark:text-red-400 mb-3">Motivo del rechazo</h3>
                    <textarea
                        value={reason}
                        onChange={e => { setReason(e.target.value); setReasonError('') }}
                        rows={3}
                        placeholder="Explica al usuario por qué se rechaza su anuncio..."
                        className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none resize-none transition-colors duration-200 dark:text-white
                            ${reasonError 
                                ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/30' 
                                : 'border-red-200 focus:border-red-400 bg-white dark:bg-gray-800 dark:border-gray-700 dark:focus:border-red-500'}`}
                    />
                    {reasonError && <p className="text-xs text-red-500 mt-1">{reasonError}</p>}
                    <div className="flex gap-2 mt-3">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => { setShowReject(false); setReason('') }}>
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            loading={acting}
                            onClick={handleReject}>
                            Confirmar rechazo
                        </Button>
                    </div>
                </div>
            )}

            {/* Panel de eliminación */}
            {showDelete && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-5 mb-6 transition-colors duration-200">
                    <h3 className="font-semibold text-red-800 dark:text-red-400 mb-3">Motivo de eliminación</h3>
                    <p className="text-xs text-red-600 dark:text-red-400/80 mb-3">
                        El propietario recibirá una notificación con este motivo.
                    </p>
                    <textarea
                        value={deleteReason}
                        onChange={e => setDeleteReason(e.target.value)}
                        rows={3}
                        placeholder="Explica al usuario por qué se elimina su anuncio..."
                        className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none resize-none transition-colors duration-200 dark:text-white
                            ${!deleteReason.trim() 
                                ? 'border-red-300 dark:border-gray-700 dark:bg-gray-800 bg-white' 
                                : 'border-red-200 focus:border-red-400 bg-white dark:bg-gray-800 dark:border-gray-700 dark:focus:border-red-500'}`}
                    />
                    {!deleteReason.trim() && (
                        <p className="text-xs text-red-500 mt-1">El motivo es obligatorio.</p>
                    )}
                    <div className="flex gap-2 mt-3">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => { setShowDelete(false); setDeleteReason('') }}>
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            loading={acting}
                            disabled={!deleteReason.trim()}
                            onClick={handleDelete}>
                            Confirmar eliminación
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna izquierda — imágenes */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Imagen principal */}
                    <div className="aspect-video rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden transition-colors duration-200">
                        {images.length > 0 ? (
                            <img
                                src={images[mainImage]?.url}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200 dark:text-gray-600">🏠</div>
                        )}
                    </div>

                    {/* Miniaturas */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {images.map((img, i) => (
                                <button
                                    key={img.id}
                                    onClick={() => setMainImage(i)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors duration-200
                                        ${mainImage === i ? 'border-gray-800 dark:border-gray-300' : 'border-transparent dark:border-transparent'}`}>
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Descripción */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Descripción</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed wrap-break-word">
                            {property.description}
                        </p>
                    </div>
                </div>

                {/* Columna derecha — detalles */}
                <div className="flex flex-col gap-4">

                    {/* Precio y tipo */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Number(property.price).toLocaleString('es-ES')} €
                            {property.operation === 'rent' && <span className="text-base font-normal text-gray-400 dark:text-gray-500">/mes</span>}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {TYPE_LABELS[property.type]} · {property.operation === 'sale' ? 'En venta' : 'En alquiler'}
                        </p>
                    </div>

                    {/* Características */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Características</h2>
                        <div className="flex flex-col gap-2 text-sm">
                            {property.bedrooms  != null && <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500">Habitaciones</span><span className="font-medium dark:text-gray-200">{property.bedrooms}</span></div>}
                            {property.bathrooms != null && <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500">Baños</span><span className="font-medium dark:text-gray-200">{property.bathrooms}</span></div>}
                            {property.area      != null && <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500">Superficie</span><span className="font-medium dark:text-gray-200">{property.area} m²</span></div>}
                        </div>
                    </div>

                    {/* Extras */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Extras</h2>
                        <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-700/50">
                            {[
                                { key: 'has_garage',   label: 'Garaje'    },
                                { key: 'has_elevator', label: 'Ascensor'  },
                                { key: 'has_pool',     label: 'Piscina'   },
                                { key: 'has_garden',   label: 'Jardín'    },
                                { key: 'is_furnished', label: 'Amueblado' },
                            ].filter(f => property[f.key]).map(feat => (
                                <div key={feat.key} className="flex items-center justify-between py-2.5">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">{feat.label}</span>
                                    <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full transition-colors duration-200">Sí</span>
                                </div>
                            ))}
                            {!property.has_garage && !property.has_elevator && !property.has_pool && !property.has_garden && !property.is_furnished && (
                                <p className="text-sm text-gray-400 dark:text-gray-500 py-2">Sin extras</p>
                            )}
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors duration-200">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Ubicación</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 wrap-break-words">{property.address}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 wrap-break-words">{property.city}, {property.province} {property.postal_code}</p>
                    </div>

                    {/* Motivo de rechazo si existe */}
                    {property.rejection_reason && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-5 transition-colors duration-200">
                            <h2 className="font-semibold text-red-800 dark:text-red-400 mb-2">Motivo de rechazo</h2>
                            <p className="text-sm text-red-600 dark:text-red-300">{property.rejection_reason}</p>
                        </div>
                    )}

                </div>
            </div>
        </AdminLayout>
    )
}