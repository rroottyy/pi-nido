import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/ui/Spinner'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'


export default function Notifications() {
    useRequireAuth()
    const { decreaseUnread, resetUnread, user } = useAuth()
    const { t } = useTranslation()
    const [messages, setMessages] = useState([])
    const [loading, setLoading]   = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get('/notifications')
                setMessages(data.data)
            } finally {
                setLoading(false)
            }
        }
        fetchMessages()
    }, [])

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`)
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
            decreaseUnread()
        } catch {}
    }

    const handleDelete = async (id) => {
        try {
            const msg = messages.find(m => m.id === id)
            await api.delete(`/notifications/${id}`)
            setMessages(prev => prev.filter(m => m.id !== id))
            if (!msg.is_read) decreaseUnread()
        } catch {}
    }

    const handleDeleteAll = async () => {
        if (!confirm(t('notifications.confirm_delete_all'))) return
        try {
            await api.delete('/notifications')
            const unreadBefore = messages.filter(m => !m.is_read).length
            setMessages([])
            if (unreadBefore > 0) resetUnread()
        } catch {}
    }

    const unreadCount = messages.filter(m => !m.is_read).length

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{t('notifications.title')}</h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 transition-colors duration-200">
                            {unreadCount > 0 ? `${unreadCount} ${t('notifications.unread')}` : t('notifications.all_read')}
                        </p>
                    </div>
                    {messages.length > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            className="text-xs font-medium text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 px-3 py-1.5 rounded-lg border border-red-100 hover:border-red-200 dark:border-red-800/50 dark:hover:border-red-700 transition-colors duration-200">
                            {t('notifications.delete_all')}
                        </button>
                    )}
                </div>

                {loading && <Spinner />}

                {!loading && messages.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🔔</p>
                        <p className="text-gray-400 dark:text-gray-500 text-lg transition-colors duration-200">{t('notifications.empty')}</p>
                    </div>
                )}

                {!loading && messages.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {messages.map(message => {
                            // Mensaje de otro usuario
                            const isUserMessage = message.sender && message.sender.id !== user?.id

                            return (
                                <div
                                    key={message.id}
                                    onClick={() => {
                                        if (!message.is_read) handleMarkRead(message.id)
                                    }}
                                    className={`rounded-2xl border p-5 transition-colors duration-200 cursor-pointer
                                        ${message.is_read
                                            ? 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'
                                            : 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50'}`}>

                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Sender info — solo si es de otro usuario */}
                                            {isUserMessage && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-7 h-7 rounded-full bg-gray-800 dark:bg-gray-600 flex items-center justify-center text-white text-xs font-bold shrink-0 transition-colors duration-200">
                                                        {message.sender.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-200">{message.sender.name}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-200">{message.sender.email}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <p className={`text-sm leading-relaxed line-clamp-2 transition-colors duration-200
                                                ${message.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100 font-medium'}`}>
                                                {message.body}
                                            </p>
                                        </div>
                                        {!message.is_read && (
                                            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0 mt-1.5 transition-colors duration-200"></span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-200">
                                            {new Date(message.created_at).toLocaleDateString('es-ES', {
                                                day: 'numeric', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>

                                        <div className="flex items-center gap-3">
                                            {/* Ver mensaje — solo si viene de otro usuario */}
                                            {isUserMessage && (
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation()
                                                        navigate(`/messages#message-${message.id}`)
                                                    }}
                                                    className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200">
                                                    {t('notifications.view_message')}
                                                </button>
                                            )}

                                            {/* Ver anuncio — solo si es auto-notificación con anuncio */}
                                            {!isUserMessage && message.property && (
                                                <Link
                                                    to={`/properties/${message.property.id}`}
                                                    onClick={e => e.stopPropagation()}
                                                    className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200">
                                                    {t('notifications.view_property')}
                                                </Link>
                                            )}

                                            {/* Eliminar */}
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    handleDelete(message.id)
                                                }}
                                                className="text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-500 transition-colors duration-200"
                                                title="Eliminar">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </Layout>
    )
}