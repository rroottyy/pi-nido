import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'

export default function NotFound() {
    return (
        <Layout>
            <div className="text-center py-24">
                <p className="text-8xl mb-6">🏚️</p>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Página no encontrada
                </h1>
                <p className="text-gray-400 mb-10">
                    Esta dirección no existe o fue eliminada.
                </p>
                <Link
                    to="/"
                    className="bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors">
                    Volver al inicio
                </Link>
            </div>
        </Layout>
    )
}