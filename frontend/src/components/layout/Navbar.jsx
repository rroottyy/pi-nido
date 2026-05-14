import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../hooks/useTheme'

export default function Navbar() {
    const { user, logout, unreadCount, pendingCount } = useAuth()
    const navigate    = useNavigate()
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)
    const location    = useLocation()
    const { t, i18n } = useTranslation()
    const [langOpen, setLangOpen] = useState(false)
    const langRef = useRef(null)
    
    const { theme, toggleTheme } = useTheme()

    const LANGUAGES = [
        { code: 'es', label: 'ES' },
        { code: 'ca', label: 'CA' },
        { code: 'en', label: 'EN' },
    ]

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false)
            }
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        await logout()
        navigate('/')
        setOpen(false)
    }

    const handleNavigate = (path) => {
        navigate(path)
        setOpen(false)
    }

    const initials = user?.name
        ?.split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">

                    {/* Logo (Visible en móvil y web) */}
                    <Link 
                        to="/properties" 
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
                    >
                        <span className="text-2xl">🏠</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-500">Nido</span>
                    </Link>

                    {/* Links */}
                    <div className="flex items-center gap-2 sm:gap-4">

                        {/* Inmuebles */}
                        {!location.pathname.startsWith('/properties') && (
                            <Link to="/properties"
                                className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                                {t('nav.properties')}
                            </Link>
                        )}

                        {/* Selector de idioma */}
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => setLangOpen(prev => !prev)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors text-xs font-semibold text-gray-600 dark:text-gray-300">
                                {LANGUAGES.find(l => i18n.language?.startsWith(l.code))?.label || 'ES'}
                                <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {langOpen && (
                                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50 min-w-20">
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false) }}
                                            className={`w-full px-4 py-2 text-xs text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700
                                                ${i18n.language?.startsWith(lang.code)
                                                    ? 'font-bold text-gray-900 dark:text-white'
                                                    : 'text-gray-600 dark:text-gray-400'}`}>
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Botón Modo Oscuro */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors text-base"
                            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

                        {user ? (
                            <>
                                {/* Publicar */}
                                {(user.role === 'seller' || user.role === 'admin') && location.pathname !== '/properties/create' && (
                                    <Link to="/properties/create"
                                        className="text-xs sm:text-sm bg-gray-800 dark:bg-gray-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium">
                                        <span >{t('nav.publish')}</span>
                                    </Link>
                                )}

                                {/* Panel Admin */}
                                {user.role === 'admin' && (
                                    <Link to="/admin"
                                        className="relative text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors hidden sm:block">
                                        {t('nav.admin_panel')}
                                        {pendingCount > 0 && (
                                            <span className="absolute -top-2 -right-3 bg-yellow-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                                                {pendingCount > 9 ? '9+' : pendingCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* Panel Admin móvil — solo icono */}
                                {user.role === 'admin' && (
                                    <Link to="/admin"
                                        className="relative sm:hidden w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                        ⚙️
                                        {pendingCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                                                {pendingCount > 9 ? '9' : pendingCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setOpen(prev => !prev)}
                                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">

                                        {/* Avatar */}
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-800 dark:bg-gray-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {user.avatar
                                                ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                                : initials
                                            }
                                        </div>

                                        {/* Nombre */}
                                        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-30 truncate">
                                            {user.name}
                                        </span>

                                        {/* Burbuja notificaciones */}
                                        {unreadCount > 0 && user.role !== 'buyer' && (
                                            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center leading-none">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}

                                        {/* Chevrón */}
                                        <svg
                                            className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Dropdown menu */}
                                    {open && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">

                                            <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700 mb-1">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.name}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                                            </div>

                                            <button onClick={() => handleNavigate('/dashboard')}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-3">
                                                <span>🏠</span> {t('nav.my_account')}
                                            </button>

                                            {user.role !== 'buyer' && (
                                                <button onClick={() => handleNavigate('/notifications')}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-between">
                                                    <span className="flex items-center gap-3">
                                                        <span>🔔</span> {t('nav.notifications')}
                                                    </span>
                                                    {unreadCount > 0 && (
                                                        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                                            {unreadCount > 9 ? '9+' : unreadCount}
                                                        </span>
                                                    )}
                                                </button>
                                            )}

                                            {user.role !== 'buyer' && (
                                                <button onClick={() => handleNavigate('/messages')}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-3">
                                                    <span>✉️</span> {t('nav.messages')}
                                                </button>
                                            )}

                                            <button onClick={() => handleNavigate('/favorites')}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-3">
                                                <span>❤️</span> {t('nav.favorites')}
                                            </button>

                                            {user.role !== 'buyer' && (
                                                <button onClick={() => handleNavigate('/my-properties')}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-3">
                                                    <span>📋</span> {t('nav.my_properties')}
                                                </button>
                                            )}

                                            {user.role === 'admin' && (
                                                <button onClick={() => handleNavigate('/admin')}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-between sm:hidden">
                                                    <span className="flex items-center gap-3">
                                                        <span>⚙️</span> {t('nav.admin_panel')}
                                                    </span>
                                                    {pendingCount > 0 && (
                                                        <span className="bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                                            {pendingCount}
                                                        </span>
                                                    )}
                                                </button>
                                            )}

                                            {!location.pathname.startsWith('/properties') && (
                                                <button onClick={() => handleNavigate('/properties')}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-3 sm:hidden">
                                                    <span>🏘️</span> Inmuebles
                                                </button>
                                            )}

                                            <div className="border-t border-gray-50 dark:border-gray-700 mt-1 pt-1">
                                                <button onClick={() => handleNavigate('/profile')}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-3">
                                                    <span>⚙️</span> {t('nav.profile')}
                                                </button>
                                                <button onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors flex items-center gap-3">
                                                    <span>🚪</span> {t('nav.logout')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Link to="/login"
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                                    {t('nav.login')}
                                </Link>
                                <Link to="/register"
                                    className="text-xs sm:text-sm bg-gray-800 dark:bg-white text-white dark:text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors font-medium">
                                    {t('nav.register')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}