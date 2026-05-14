import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import PropertyCard from '../../components/ui/PropertyCard'
import PropertyFilters from '../../components/ui/PropertyFilters'
import Spinner from '../../components/ui/Spinner'
import { useProperties } from '../../hooks/useProperties'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

function PropertyListCard({ property }) {
    const { t } = useTranslation()

    return (
        <Link
            to={`/properties/${property.id}`}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200 flex h-48">
            <div className="w-64 shrink-0 bg-gray-100 dark:bg-gray-700/50 relative overflow-hidden transition-colors duration-200">
                {property.main_image ? (
                    <img
                        src={property.main_image.url}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200 dark:text-gray-600 transition-colors duration-200">🏠</div>
                )}
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors duration-200
                    ${property.operation === 'sale'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                    {property.operation === 'sale' ? t('properties.sale') : t('properties.rent')}
                </span>
            </div>
            <div className="flex-1 p-5 flex flex-col justify-between min-w-0 overflow-hidden transition-colors duration-200">
                <div className="min-w-0">
                    <p className="text-xs text-gray-400 dark:text-gray-400 mb-1 truncate">
                        {t(`properties.type.${property.type}`)} · {property.city}
                    </p>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base mb-2 truncate">
                        {property.title}
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-400/80 leading-relaxed line-clamp-3">
                        {property.description}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-3 shrink-0">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {property.formatted_price}
                        {property.operation === 'rent' && (
                            <span className="text-sm font-normal text-gray-400 dark:text-gray-500"> {t('common.per_month')}</span>
                        )}
                    </span>
                    <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-400">
                        {property.bedrooms > 0 && <span>{property.bedrooms} {t('properties.bedrooms')}</span>}
                        {property.bathrooms > 0 && <span>{property.bathrooms} {t('properties.bathrooms')}</span>}
                        <span>{property.area} m²</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default function PropertyList() {
    const [searchParams]      = useSearchParams()
    const [view, setView] = useState(() => {
        return sessionStorage.getItem('property_view') || 'grid'})
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const { t } = useTranslation()

    const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem('property_filters')
        return saved ? JSON.parse(saved) : {
            operation: searchParams.get('operation') || '',
            type:      '',
            city:      '',
            min_price: '',
            max_price: '',
            bedrooms:  [],
            bathrooms: [],
            min_area:  '',
            page:      1,
        }
    })

    const handleFilter = newFilters => {
        const updated = { ...newFilters, page: 1 }
        setFilters(updated)
        sessionStorage.setItem('property_filters', JSON.stringify(updated))
    }

    useEffect(() => {
        const savedScroll = sessionStorage.getItem('scroll_position')
        if (savedScroll) {
            setTimeout(() => {
                window.scrollTo({ top: parseInt(savedScroll), behavior: 'instant' })
                sessionStorage.removeItem('scroll_position')
            }, 100)
        }
    }, [])

    const { properties, meta, loading, error } = useProperties(filters)

    const handlePage = page => {
        setFilters(f => ({ ...f, page }))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    useEffect(() => {
        document.body.style.overflow = mobileFiltersOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileFiltersOpen])

    const activeFiltersCount = Object.entries(filters)
        .filter(([k, v]) => k !== 'page' && (Array.isArray(v) ? v.length > 0 : v !== ''))
        .length

    return (
        <Layout>

            {/* Cabecera */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{t('properties.title')}</h1>
                    {meta && (
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 transition-colors duration-200">
                            {meta.total} {meta.total === 1 ? t('properties.results') : t('properties.results_plural')}
                        </p>
                    )}
                </div>

                {/* Toggle vista — solo desktop */}
                <div className="hidden sm:flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-colors duration-200">
                    <button
                           onClick={() => { setView('grid'); sessionStorage.setItem('property_view', 'grid') }}
                        className={`px-3 py-2 transition-colors ${view === 'grid' ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                        title='Vista en cuadrícula'>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button
                           onClick={() => { setView('list'); sessionStorage.setItem('property_view', 'list') }}
                        className={`px-3 py-2 transition-colors ${view === 'list' ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                        title={t('properties.list_view', 'Vista en lista')}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Layout: Sidebar + Grid */}
            <div className="flex gap-6 pb-24 lg:pb-0">

                {/* Sidebar filtros — solo desktop */}
                <aside className="w-72 shrink-0 hidden lg:block">
                    <div className="sticky top-20">
                        <PropertyFilters
                            onFilter={handleFilter}
                            initialFilters={filters}
                            initialOperation={searchParams.get('operation') || ''}
                            autoApply={true}
                        />
                    </div>
                </aside>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                    {loading && <Spinner />}
                    {error && <div className="text-center py-20 text-red-400 dark:text-red-500 transition-colors duration-200">{error}</div>}

                    {!loading && !error && properties.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-5xl mb-4">🏚️</p>
                            <p className="text-gray-400 dark:text-gray-500 text-lg transition-colors duration-200">{t('properties.no_results')}</p>
                        </div>
                    )}

                    {!loading && properties.length > 0 && (
                        <>
                            {view === 'list' && window.innerWidth >= 640 ? (
                                <div className="flex flex-col gap-4">
                                    {properties.map(property => (
                                        <PropertyListCard key={property.id} property={property} />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {properties.map(property => (
                                        <PropertyCard key={property.id} property={property} />
                                    ))}
                                </div>
                            )}

                            {meta && meta.last_page > 1 && (
                                <div className="flex justify-center gap-2 mt-10">
                                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePage(page)}
                                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors
                                                ${meta.current_page === page
                                                    ? 'bg-gray-800 dark:bg-gray-700 text-white'
                                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Barra inferior móvil — botón filtros fijo */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg lg:hidden z-40 transition-colors duration-200">
                <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 dark:bg-gray-700 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    {t('filters.title', 'Filtros')}
                    {activeFiltersCount > 0 && (
                        <span className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center transition-colors">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Modal filtros móvil */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setMobileFiltersOpen(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 rounded-t-3xl max-h-[90vh] overflow-y-auto transition-colors duration-200">
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors" />
                        </div>
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
                            <h2 className="font-semibold text-gray-900 dark:text-white">{t('filters.title', 'Filtros')}</h2>
                            <button
                                onClick={() => setMobileFiltersOpen(false)}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl w-8 h-8 flex items-center justify-center transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="p-4">
                            <PropertyFilters
                                onFilter={handleFilter}
                                initialOperation={searchParams.get('operation') || ''}
                                autoApply={false}
                                onClose={() => setMobileFiltersOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

        </Layout>
    )
}