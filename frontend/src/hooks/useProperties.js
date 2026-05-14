import { useState, useEffect } from 'react'
import api from '../services/api'

export function useProperties(filters = {}) {
    const [properties, setProperties] = useState([])
    const [meta, setMeta]             = useState(null)
    const [loading, setLoading]       = useState(true)
    const [error, setError]           = useState(null)

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true)
            setError(null)
            try {
                const params = new URLSearchParams()
                Object.entries(filters).forEach(([key, val]) => {
                    if (Array.isArray(val)) {
                        val.forEach(v => params.append(`${key}[]`, v))
                    } else if (val !== '' && val !== null && val !== undefined) {
                        params.append(key, val)
                    }
                })
                const { data } = await api.get(`/properties?${params.toString()}`)
                setProperties(data.data)
                setMeta(data.meta)
            } catch (err) {
                setError('Error al cargar los inmuebles.')
            } finally {
                setLoading(false)
            }
        }

        fetchProperties()
    }, [JSON.stringify(filters)])

    return { properties, meta, loading, error }
}

export function useProperty(id) {
    const [property, setProperty] = useState(null)
    const [loading, setLoading]   = useState(true)
    const [error, setError]       = useState(null)

    useEffect(() => {
        if (!id) return
        const fetchProperty = async () => {
            setLoading(true)
            try {
                const { data } = await api.get(`/properties/${id}`)
                setProperty(data.data)
            } catch (err) {
                setError('Inmueble no encontrado.')
            } finally {
                setLoading(false)
            }
        }
        fetchProperty()
    }, [id])

    return { property, loading, error }
}