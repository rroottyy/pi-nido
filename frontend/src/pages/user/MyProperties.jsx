import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'

const STATUS_STYLES = {
    draft:    'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400',
    pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    paused:   'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300',
    sold:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    rented:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function MyProperties() {
    const { user }  = useRequireAuth(['seller', 'admin'])
    const navigate  = useNavigate()
    const { t }     = useTranslation()

    const STATUS_LABELS = {
        draft:    t('my_properties.status.draft'),
        pending:  t('my_properties.status.pending'),
        active:   t('my_properties.status.active'),
        rejected: t('my_properties.status.rejected'),
        paused:   t('my_properties.status.paused'),
        sold:     t('my_properties.status.sold'),
        rented:   t('my_properties.status.rented'),
    }

    const [properties, setProperties] = useState([])
    const [loading, setLoading]       = useState(true)

    useEffect(() => {
        const fetchMyProperties = async () => {
            try {
                const { data } = await api.get('/my-properties')
                setProperties(data.data)
            } finally {
                setLoading(false)
            }
        }
        fetchMyProperties()
    }, [])

    const handleDelete = async (id, title) => {
        if (!confirm(`${t('my_properties.confirm_delete')} "${title}"?`)) return
        try {
            await api.delete(`/properties/${id}`)
            setProperties(prev => prev.filter(p => p.id !== id))
        } catch {
            alert('Error al eliminar el anuncio.')
        }
    }

    const handleChangeStatus = async (id, status) => {
        try {
            await api.put(`/properties/${id}/status`, { status })
            setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p))
        } catch {
            alert('Error al cambiar el estado.')
        }
    }

    return (
        <Layout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{t('my_properties.title')}</h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 transition-colors duration-200">
                        {properties.length} {properties.length === 1 ? t('my_properties.title') : t('my_properties.title')}
                    </p>
                </div>
                <Button onClick={() => navigate('/properties/create')}>
                    {t('my_properties.new')}
                </Button>
            </div>

            {loading && <Spinner />}

            {!loading && properties.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-5xl mb-4">🏠</p>
                    <p className="text-gray-400 dark:text-gray-500 text-lg mb-6 transition-colors duration-200">{t('my_properties.empty')}</p>
                    <Button onClick={() => navigate('/properties/create')}>
                        {t('my_properties.first')}
                    </Button>
                </div>
            )}

            {!loading && properties.length > 0 && (
                <div className="flex flex-col gap-4">
                    {properties.map(property => (
                        <div key={property.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex gap-5 transition-colors duration-200">

                            {/* Imagen */}
                            <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700/50 overflow-hidden shrink-0 transition-colors duration-200">
                                {property.main_image ? (
                                    <img
                                        src={property.main_image.url}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300 dark:text-gray-600">🏠</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                    <Link
                                        to={`/properties/${property.id}`}
                                        className="font-semibold text-gray-800 dark:text-gray-100 hover:text-gray-600 dark:hover:text-white truncate block transition-colors duration-200">
                                        {property.title}
                                    </Link>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 transition-colors duration-200 ${STATUS_STYLES[property.status]}`}>
                                        {STATUS_LABELS[property.status]}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 transition-colors duration-200">
                                    {property.city} · {Number(property.price).toLocaleString('es-ES')} €
                                </p>

                                {/* Motivo de rechazo */}
                                {property.status === 'rejected' && property.rejection_reason && (
                                    <div className="mt-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg px-3 py-2 transition-colors duration-200">
                                        <p className="text-xs text-red-600 dark:text-red-400">
                                            <span className="font-semibold">{t('my_properties.rejection_reason')} </span>
                                            {property.rejection_reason}
                                        </p>
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="flex flex-wrap gap-2 mt-3">

                                    {property.status === 'draft' && (
                                        <Link
                                            to={`/properties/${property.id}/photos`}
                                            className="text-xs font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 hover:border-blue-200 dark:border-blue-800/50 dark:hover:border-blue-700 transition-colors duration-200">
                                            {t('my_properties.continue_photos')}
                                        </Link>
                                    )}

                                    {property.status !== 'sold' && property.status !== 'draft' && (
                                        <Link
                                            to={`/properties/${property.id}/edit`}
                                            className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-500 transition-colors duration-200">
                                            {t('my_properties.edit')}
                                        </Link>
                                    )}

                                    {property.status === 'active' && (
                                        <>
                                            <button
                                                onClick={() => handleChangeStatus(property.id, 'paused')}
                                                className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-500 transition-colors duration-200">
                                                {t('my_properties.pause')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(t('my_properties.confirm_sold'))) {
                                                        handleChangeStatus(property.id, 'sold')
                                                    }
                                                }}
                                                className="text-xs font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 hover:border-blue-200 dark:border-blue-800/50 dark:hover:border-blue-700 transition-colors duration-200">
                                                {t('my_properties.sold')}
                                            </button>
                                            <button
                                                onClick={() => handleChangeStatus(property.id, 'rented')}
                                                className="text-xs font-medium text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 px-3 py-1.5 rounded-lg border border-purple-100 hover:border-purple-200 dark:border-purple-800/50 dark:hover:border-purple-700 transition-colors duration-200">
                                                {t('my_properties.rented')}
                                            </button>
                                        </>
                                    )}

                                    {(property.status === 'paused' || property.status === 'rented') && (
                                        <button
                                            onClick={() => handleChangeStatus(property.id, 'pending')}
                                            className="text-xs font-medium text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 px-3 py-1.5 rounded-lg border border-green-100 hover:border-green-200 dark:border-green-800/50 dark:hover:border-green-700 transition-colors duration-200">
                                            {t('my_properties.reactivate')}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(property.id, property.title)}
                                        className="text-xs font-medium text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-100 hover:border-red-200 dark:border-red-800/50 dark:hover:border-red-700 transition-colors duration-200">
                                        {t('my_properties.delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    )
}