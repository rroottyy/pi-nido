import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/ui/Spinner'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'


export default function Messages() {
    useRequireAuth()
    const { decreaseUnread } = useAuth()
    const location = useLocation()
    const { t } = useTranslation()

    const [messages, setMessages] = useState([])
    const [loading, setLoading]   = useState(true)
    const [selected, setSelected] = useState(null)
    const messageRefs             = useRef({})

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get('/messages')
                setMessages(data.data)
            } finally {
                setLoading(false)
            }
        }
        fetchMessages()
    }, [])

    useEffect(() => {
        if (!loading && location.hash) {
            const id = parseInt(location.hash.replace('#message-', ''))
            if (id) {
                setSelected(id)
                setTimeout(() => {
                    messageRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }, 100)
            }
        }
    }, [loading, location.hash])

    const handleSelect = async (message) => {
        setSelected(message.id)
        if (!message.is_read) {
            try {
                await api.put(`/notifications/${message.id}/read`)
                setMessages(prev => prev.map(m => m.id === message.id ? { ...m, is_read: true } : m))
                decreaseUnread()
            } catch {}
        }
    }

    const unreadCount = messages.filter(m => !m.is_read).length
    const selectedMessage = messages.find(m => m.id === selected)

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{t('messages.title')}</h1>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 transition-colors duration-200">
                    {unreadCount > 0 ? `${unreadCount} ${t('notifications.unread')}` : t('messages.all_read')}
                </p>
            </div>

            {loading && <Spinner />}

            {!loading && messages.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-5xl mb-4">✉️</p>
                    <p className="text-gray-400 dark:text-gray-500 text-lg transition-colors duration-200">{t('messages.empty')}</p>
                </div>
            )}

            {!loading && messages.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: '70vh' }}>

                    {/* Lista de mensajes */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-y-auto transition-colors duration-200">
                        {messages.map(message => (
                            <div
                                key={message.id}
                                ref={el => messageRefs.current[message.id] = el}
                                onClick={() => handleSelect(message)}
                                className={`p-4 border-b border-gray-50 dark:border-gray-700/50 cursor-pointer transition-colors duration-200
                                    ${selected === message.id
                                        ? 'bg-gray-50 dark:bg-gray-700 border-l-4 border-l-gray-800 dark:border-l-gray-300'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                                    ${!message.is_read ? 'bg-blue-50 hover:bg-blue-50/70 dark:bg-blue-900/20 dark:hover:bg-blue-900/40' : ''}`}>

                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 dark:bg-gray-600 flex items-center justify-center text-white text-xs font-bold shrink-0 transition-colors duration-200">
                                        {message.sender?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm truncate transition-colors duration-200 ${!message.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                                {message.sender?.name}
                                            </p>
                                            {!message.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0 ml-2 transition-colors duration-200"></span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate transition-colors duration-200">{message.sender?.email}</p>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 pl-11 transition-colors duration-200">
                                    {message.body}
                                </p>

                                <p className="text-xs text-gray-300 dark:text-gray-500 mt-1 pl-11 transition-colors duration-200">
                                    {new Date(message.created_at).toLocaleDateString('es-ES', {
                                        day: 'numeric', month: 'short',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Detalle del mensaje */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden transition-colors duration-200">
                        {!selectedMessage ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-4xl mb-3">✉️</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors duration-200">{t('messages.select')}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">

                        {/* Cabecera del mensaje */}
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 transition-colors duration-200">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-600 flex items-center justify-center text-white text-sm font-bold shrink-0 transition-colors duration-200">
                                        {selectedMessage.sender?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white transition-colors duration-200">{selectedMessage.sender?.name}</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors duration-200">{selectedMessage.sender?.email}</p>
                                    </div>
                                </div>

                                {/* Botón eliminar */}
                                <button
                                    onClick={async () => {
                                        if (!confirm(t('messages.confirm_delete'))) return
                                        try {
                                            await api.delete(`/notifications/${selectedMessage.id}`)
                                            setMessages(prev => prev.filter(m => m.id !== selectedMessage.id))
                                            setSelected(null)
                                            if (!selectedMessage.is_read) decreaseUnread()
                                        } catch {}
                                    }}
                                    className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                                    title={t('messages.delete')}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                            {selectedMessage.property && (
                                <Link
                                    to={`/properties/${selectedMessage.property.id}`}
                                    className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 px-3 py-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-300 font-medium">
                                    🏠 {selectedMessage.property.title} →
                                </Link>
                            )}

                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 transition-colors duration-200">
                                {new Date(selectedMessage.created_at).toLocaleDateString('es-ES', {
                                    weekday: 'long', day: 'numeric', month: 'long',
                                    year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>

                                {/* Cuerpo del mensaje */}
                                <div className="flex-1 p-5 overflow-y-auto">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line wrap-break-word transition-colors duration-200">
                                        {selectedMessage.body}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    )
}