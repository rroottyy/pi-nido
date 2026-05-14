import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth()
    const navigate         = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Sidebar */}
            <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
                <div className="p-5 border-b border-gray-700">
                    <p className="text-lg font-bold">Nido Admin</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                    <Link to="/"
                        className="text-xs text-gray-400 hover:text-white transition-colors mt-2 block">
                        ← Ir a Nido
                    </Link>
                </div>

                <nav className="flex-1 p-3">
                    <Link
                        to="/admin"
                        className="px-3 py-2.5 rounded-lg text-sm font-medium bg-gray-700 text-white block">
                        📊 Dashboard
                    </Link>
                </nav>

                <div className="p-3 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-left">
                        🚪 Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenido */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>

        </div>
    )
}