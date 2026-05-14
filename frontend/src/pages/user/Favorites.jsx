import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import PropertyCard from '../../components/ui/PropertyCard'
import Spinner from '../../components/ui/Spinner'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'

export default function Favorites() {
    useRequireAuth()

    const [properties, setProperties] = useState([])
    const [loading, setLoading]       = useState(true)
    const { t }                       = useTranslation()

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const { data } = await api.get('/favorites')
                setProperties(data.data)
            } catch {
                // error silencioso
            } finally {
                setLoading(false)
            }
        }
        fetchFavorites()
    }, [])

    const handleRemove = async (propertyId) => {
        try {
            await api.delete(`/favorites/${propertyId}`)
            setProperties(prev => prev.filter(p => p.id !== propertyId))
        } catch {
            alert('Error al eliminar el favorito.')
        }
    }

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{t('favorites.title')}</h1>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 transition-colors duration-200">
                    {properties.length} {properties.length === 1 ? t('favorites.saved') : t('favorites.saved_plural')}
                </p>
            </div>

            {loading && <Spinner />}

            {!loading && properties.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-5xl mb-4">❤️</p>
                    <p className="text-gray-400 dark:text-gray-500 text-lg transition-colors duration-200">{t('favorites.empty')}</p>
                </div>
            )}

            {!loading && properties.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map(property => (
                        <div key={property.id} className="relative group">
                            <PropertyCard property={property} />
                            <button
                                onClick={() => handleRemove(property.id)}
                                className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 dark:text-red-400">
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    )
}