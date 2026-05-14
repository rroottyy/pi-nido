import { useState, useEffect } from 'react'

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        // Miramos si hay una preferencia guardada o si el SO está en oscuro
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme')
        }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark'
        }
        return 'light'
    })

    useEffect(() => {
        const root = window.document.documentElement
        
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        // Guardamos la preferencia
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
    }

    return { theme, toggleTheme }
}