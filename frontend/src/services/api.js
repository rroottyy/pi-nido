import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
})

// Añade el token automáticamente a cada petición
api.interceptors.request.use(config => {
    const token = localStorage.getItem('nido_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    // Idioma del navegador
    const lang = navigator.language?.substring(0, 2) || 'es'
    config.headers['Accept-Language'] = ['es', 'ca', 'en'].includes(lang) ? lang : 'es'
    return config
    })

// Si el token expira redirige al login
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('nido_token')
            localStorage.removeItem('nido_user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api