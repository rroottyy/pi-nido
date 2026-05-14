import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from './Spinner'

export default function GuestRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) return <Spinner />
    if (user) return <Navigate to="/" replace />

    return children
}