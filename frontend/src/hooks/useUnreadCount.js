import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export function useUnreadCount() {
    const { user }          = useAuth()
    const [count, setCount] = useState(0)

    const fetchCount = useCallback(async () => {
        if (!user) return
        try {
            const { data } = await api.get('/notifications/unread-count')
            setCount(data.count)
        } catch {
            // error silencioso
        }
    }, [user])

    useEffect(() => {
        fetchCount()
        const interval = setInterval(fetchCount, 30000)
        return () => clearInterval(interval)
    }, [fetchCount])

    const resetCount  = () => setCount(0)
    const decreaseCount = () => setCount(prev => Math.max(0, prev - 1))

    return { count, resetCount, decreaseCount }
}