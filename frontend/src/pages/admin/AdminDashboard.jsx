import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import Spinner from '../../components/ui/Spinner'
import api from '../../services/api'

const STATUS_STYLES = {
    pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white',
    active:   'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-600 dark:text-white',
}

const STATUS_LABELS = {
    pending:  'Pendiente',
    active:   'Publicado',
    rejected: 'Rechazado',
}

export default function AdminDashboard() {

    const [dashboardData, setDashboardData] = useState(null)
    const [properties, setProperties]       = useState([])
    const [loadingStats, setLoadingStats]   = useState(true)
    const [loadingList, setLoadingList]     = useState(false)
    const [filtro, setFiltro]               = useState('pending')
    const navigate                          = useNavigate()

    // 1. Cargar las estadísticas de los recuadros superiores (solo se ejecuta una vez)
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const { data } = await api.get('/admin/dashboard')
                setDashboardData(data)
            } catch {
                navigate('/login')
            } finally {
                setLoadingStats(false)
            }
        }
        fetchDashboard()
    }, [navigate])

    // 2. Cargar la lista de anuncios cada vez que cambie el filtro
    useEffect(() => {
        const fetchProperties = async () => {

            setLoadingList(true)
            try {
                const params = new URLSearchParams()
                if (filtro !== 'all') params.append('status', filtro)
                
                const { data } = await api.get(`/admin/properties?${params}`)
                setProperties(data.data)
            } catch {
                setProperties([])
            } finally {
                setLoadingList(false)
            }
        }
        fetchProperties()
    }, [filtro])

    if (loadingStats) return <AdminLayout><Spinner /></AdminLayout>

    const STATS = [
        { id: 'all',      label: 'Total anuncios', value: dashboardData.stats.total_properties, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
        { id: 'pending',  label: 'Pendientes',     value: dashboardData.stats.pending,          color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
        { id: 'active',   label: 'Publicados',     value: dashboardData.stats.active,           color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
        { id: 'rejected', label: 'Rechazados',     value: dashboardData.stats.rejected,         color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
    ]

    const tituloActivo = STATS.find(s => s.id === filtro)?.label || 'Anuncios'

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">Dashboard</h1>

            {/* Tarjetas de estadísticas / Botones de filtro */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {STATS.map(stat => (
                    <div 
                        key={stat.id} 
                        onClick={() => setFiltro(stat.id)} 
                        className={`rounded-2xl p-5 border-2 transition-all duration-200 ${stat.color} ${
                            'cursor-pointer hover:scale-105'
                        } ${filtro === stat.id ? 'border-gray-900 dark:border-gray-300 shadow-md scale-105' : 'border-transparent'}`}
                    >
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-sm font-medium mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Cabecera de la lista */}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200">
                Listado: {tituloActivo}
            </h2>

            {/* Contenedor de la lista dinámica */}
            {loadingList ? (
                <div className="py-10 flex justify-center"><Spinner /></div>
            ) : properties.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <p className="text-4xl mb-3">✅</p>
                    <p className="text-gray-400 dark:text-gray-500">No hay {tituloActivo.toLowerCase()} en este momento.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {properties.map(property => (
                        <div
                            key={property.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-5 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200"
                            onClick={() => navigate(`/admin/properties/${property.id}`)}>

                            {/* Imagen */}
                            <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 transition-colors duration-200">
                                {property.main_image ? (
                                    <img
                                        src={property.main_image.url}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300 dark:text-gray-500">🏠</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate transition-colors duration-200">{property.title}</p>
                                <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5 transition-colors duration-200">
                                    {property.city} · {property.user?.name}
                                </p>
                            </div>

                            {/* Badge de Estado */}
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 transition-colors duration-200 ${STATUS_STYLES[property.status]}`}>
                                {STATUS_LABELS[property.status] || property.status}
                            </span>

                            <span className="text-gray-300 dark:text-gray-600 text-lg transition-colors duration-200">→</span>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    )
}