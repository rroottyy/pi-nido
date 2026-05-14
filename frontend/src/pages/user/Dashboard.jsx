import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/ui/Spinner'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'

const STATUS_STYLES = {
    draft:    'bg-gray-100 text-gray-500',
    pending:  'bg-yellow-100 text-yellow-700',
    active:   'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    paused:   'bg-gray-100 text-gray-600',
    sold:     'bg-blue-100 text-blue-700',
    rented:   'bg-purple-100 text-purple-700',
}

export default function Dashboard() {
    const { user } = useRequireAuth()
    const navigate = useNavigate()
    const { t }    = useTranslation()

    const [properties, setProperties] = useState([])
    const [favorites, setFavorites]   = useState([])
    const [messages, setMessages]     = useState([])
    const [loading, setLoading]       = useState(true)

    const isBuyer = user?.role === 'buyer'

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const requests = [api.get('/favorites')]
                if (!isBuyer) {
                    requests.push(api.get('/my-properties'))
                    requests.push(api.get('/notifications'))
                }
                const [favsRes, propsRes, msgsRes] = await Promise.all(requests)
                setFavorites(favsRes.data.data)
                if (propsRes) setProperties(propsRes.data.data)
                if (msgsRes)  setMessages(msgsRes.data.data)
            } finally {
                setLoading(false)
            }
        }
        if (user) fetchAll()
    }, [user])

    if (loading) return <Layout><Spinner /></Layout>

    const unreadMessages = messages.filter(m => !m.is_read).length
    const rejectedProps  = properties.filter(p => p.status === 'rejected').length

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">

                {/* Cabecera */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-full bg-gray-800 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-white shrink-0 transition-colors">
                        {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('dashboard.hello')}, {user?.name?.split(' ')[0]} 👋</h1>
                        <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5 transition-colors">{t('dashboard.subtitle')}</p>
                    </div>
                </div>

                {/* CMPRADOR */}
                {isBuyer && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div
                                onClick={() => navigate('/favorites')}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{favorites.length}</p>
                                <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">{t('dashboard.favorites')}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
                                <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">{t('dashboard.visits')}</p>
                                <p className="text-xs text-gray-300 dark:text-gray-500 mt-1">Próximamente</p>
                            </div>
                        </div>

                        {/* Secciones */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            {/* Favoritos */}
                            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">{t('dashboard.favorites')}</h2>
                                    <Link to="/favorites" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">
                                        {t('dashboard.view_all')}
                                    </Link>
                                </div>
                                {favorites.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-3xl mb-2">❤️</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard.no_favorites')}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {favorites.slice(0, 4).map(p => (
                                            <div key={p.id}
                                                onClick={() => navigate(`/properties/${p.id}`)}
                                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl p-2 transition-colors">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 transition-colors">
                                                    {p.main_image
                                                        ? <img src={p.main_image.url} alt="" className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center text-xl text-gray-200 dark:text-gray-600">🏠</div>
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.title}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-400">{p.city} · {Number(p.price).toLocaleString('es-ES')} €</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Visitas — próximamente */}
                            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">{t('dashboard.visits')}</h2>
                                </div>
                                <div className="text-center py-8">
                                    <p className="text-3xl mb-2">🗓️</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">Próximamente podrás solicitar visitas a los inmuebles.</p>
                                </div>
                            </section>
                        </div>
                    </>
                )}

                {/*VENDEDOR / ADMIN*/}
                {!isBuyer && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <div
                                onClick={() => navigate('/my-properties')}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{properties.length}</p>
                                <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">{t('dashboard.my_properties')}</p>
                                {rejectedProps > 0 && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{rejectedProps} rechazado{rejectedProps > 1 ? 's' : ''}</p>
                                )}
                            </div>
                            <div
                                onClick={() => navigate('/favorites')}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{favorites.length}</p>
                                <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">{t('dashboard.favorites')}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
                                <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">{t('dashboard.visits')}</p>
                                <p className="text-xs text-gray-300 dark:text-gray-500 mt-1">Próximamente</p>
                            </div>
                            <div
                                onClick={() => navigate('/notifications')}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{unreadMessages}</p>
                                <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">{t('dashboard.unread')}</p>
                                {unreadMessages > 0 && (
                                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 font-medium">Sin leer</p>
                                )}
                            </div>
                        </div>

                        {/* Secciones */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                            {/* Mis anuncios */}
                            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">{t('dashboard.my_properties')}</h2>
                                    <Link to="/my-properties" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">
                                        {t('dashboard.view_all')}
                                    </Link>
                                </div>
                                {properties.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-3xl mb-2">🏠</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{t('dashboard.no_properties')}</p>
                                        <button
                                            onClick={() => navigate('/properties/create')}
                                            className="text-xs bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                                            {t('dashboard.publish')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {properties.slice(0, 4).map(p => (
                                            <div key={p.id}
                                                onClick={() => navigate(`/properties/${p.id}`)}
                                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl p-2 transition-colors">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 transition-colors">
                                                    {p.main_image
                                                        ? <img src={p.main_image.url} alt="" className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center text-xl text-gray-200 dark:text-gray-600">🏠</div>
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.title}</p>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status]}`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Notificaciones */}
                            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">{t('notifications.title')}</h2>
                                    <Link to="/notifications" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">
                                        {t('dashboard.view_all')}
                                    </Link>
                                </div>
                                {messages.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-3xl mb-2">🔔</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard.no_notifications')}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {messages.slice(0, 4).map(m => (
                                            <div key={m.id}
                                                onClick={() => navigate('/notifications')}
                                                className={`rounded-xl p-3 cursor-pointer transition-colors
                                                    ${m.is_read 
                                                        ? 'bg-gray-50 dark:bg-gray-700/30' 
                                                        : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50'}`}>
                                                <p className={`text-xs leading-relaxed line-clamp-2
                                                    ${m.is_read 
                                                        ? 'text-gray-500 dark:text-gray-400' 
                                                        : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
                                                    {m.body}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {new Date(m.created_at).toLocaleDateString('es-ES', {
                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Favoritos */}
                            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">{t('dashboard.favorites')}</h2>
                                    <Link to="/favorites" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">
                                        {t('dashboard.view_all')}
                                    </Link>
                                </div>
                                {favorites.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-3xl mb-2">❤️</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard.no_favorites')}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {favorites.slice(0, 4).map(p => (
                                            <div key={p.id}
                                                onClick={() => navigate(`/properties/${p.id}`)}
                                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl p-2 transition-colors">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 transition-colors">
                                                    {p.main_image
                                                        ? <img src={p.main_image.url} alt="" className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center text-xl text-gray-200 dark:text-gray-600">🏠</div>
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.title}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-400">{p.city} · {Number(p.price).toLocaleString('es-ES')} €</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </>
                )}

            </div>
        </Layout>
    )
}