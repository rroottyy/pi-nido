import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import api from '../../services/api'

const STATUS_STYLES = {
    pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_LABELS = {
    pending:   'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
}

export default function Visits() {
    useRequireAuth()

    const [visits, setVisits]   = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const { data } = await api.get('/visits')
                setVisits(data.data)
            } catch {
                // error silencioso
            } finally {
                setLoading(false)
            }
        }
        fetchVisits()
    }, [])

    const handleCancel = async (visitId) => {
        try {
            const { data } = await api.put(`/visits/${visitId}`, { status: 'cancelled' })
            setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'cancelled' } : v))
        } catch {
            alert('Error al cancelar la visita.')
        }
    }

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Mis visitas</h1>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 transition-colors duration-200">
                    {visits.length} {visits.length === 1 ? 'visita' : 'visitas'} solicitadas
                </p>
            </div>

            {loading && <Spinner />}

            {!loading && visits.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-5xl mb-4">🗓️</p>
                    <p className="text-gray-400 dark:text-gray-500 text-lg transition-colors duration-200">No tienes visitas solicitadas.</p>
                </div>
            )}

            {!loading && visits.length > 0 && (
                <div className="flex flex-col gap-4">
                    {visits.map(visit => (
                        <div key={visit.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-5 transition-colors duration-200">

                            {/* Imagen */}
                            <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700/50 overflow-hidden shrink-0 transition-colors duration-200">
                                {visit.property?.main_image ? (
                                    <img
                                        src={visit.property.main_image.url}
                                        alt={visit.property.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300 dark:text-gray-600">
                                        🏠
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <Link
                                    to={`/properties/${visit.property?.id}`}
                                    className="font-semibold text-gray-800 dark:text-gray-100 hover:text-gray-600 dark:hover:text-white truncate block transition-colors duration-200">
                                    {visit.property?.title}
                                </Link>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 transition-colors duration-200">
                                    📅 {new Date(visit.scheduled_at).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year:    'numeric',
                                        month:   'long',
                                        day:     'numeric',
                                        hour:    '2-digit',
                                        minute:  '2-digit',
                                    })}
                                </p>
                                {visit.notes && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate transition-colors duration-200">
                                        💬 {visit.notes}
                                    </p>
                                )}
                            </div>

                            {/* Estado y acciones */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors duration-200 ${STATUS_STYLES[visit.status]}`}>
                                    {STATUS_LABELS[visit.status]}
                                </span>
                                {visit.status === 'pending' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCancel(visit.id)}
                                        className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200">
                                        Cancelar
                                    </Button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </Layout>
    )
}