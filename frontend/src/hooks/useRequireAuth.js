import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function useRequireAuth(redirectTo = '/login') {
    const { user, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && !user) {
            navigate(redirectTo)
        }
    }, [user, loading])

    return { user, loading }
}