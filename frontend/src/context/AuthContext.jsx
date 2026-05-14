import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser]               = useState(null)
    const [loading, setLoading]         = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const [pendingCount, setPendingCount] = useState(0)

    useEffect(() => {
        const stored = localStorage.getItem('nido_user')
        const token  = localStorage.getItem('nido_token')
        if (stored && token) {
            setUser(JSON.parse(stored))
        }
        setLoading(false)
    }, [])

    const fetchUnreadCount = useCallback(async () => {
        if (!localStorage.getItem('nido_token')) return
        try {
            const { data } = await api.get('/notifications/unread-count')
            setUnreadCount(data.count)
        } catch {}
    }, [])

    const fetchPendingCount = useCallback(async (currentUser) => {
        if (!currentUser || currentUser.role !== 'admin') return
        try {
            const { data } = await api.get('/admin/pending-count')
            setPendingCount(data.count)
        } catch {}
    }, [])

    useEffect(() => {
        if (!user) { setUnreadCount(0); setPendingCount(0); return }
        fetchUnreadCount()
        fetchPendingCount(user)
        const interval = setInterval(() => {
            fetchUnreadCount()
            fetchPendingCount(user)
        }, 30000)
        return () => clearInterval(interval)
    }, [user, fetchUnreadCount, fetchPendingCount])

    const login = async (email, password) => {
        const { data } = await api.post('/login', { email, password })
        localStorage.setItem('nido_token', data.token)
        localStorage.setItem('nido_user', JSON.stringify(data.user))
        setUser(data.user)
        return data.user
    }

    const register = async (formData) => {
        const { data } = await api.post('/register', formData)
        localStorage.setItem('nido_token', data.token)
        localStorage.setItem('nido_user', JSON.stringify(data.user))
        setUser(data.user)
        return data.user
    }

    const logout = async () => {
        try { await api.post('/logout') } catch {}
        localStorage.removeItem('nido_token')
        localStorage.removeItem('nido_user')
        setUser(null)
        setUnreadCount(0)
        setPendingCount(0)
    }

    const decreaseUnread  = () => setUnreadCount(prev => Math.max(0, prev - 1))
    const resetUnread     = () => setUnreadCount(0)
    const decreasePending = () => setPendingCount(prev => Math.max(0, prev - 1))

    return (
        <AuthContext.Provider value={{
            user, loading, login, register, logout,
            unreadCount, decreaseUnread, resetUnread,
            pendingCount, decreasePending
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}