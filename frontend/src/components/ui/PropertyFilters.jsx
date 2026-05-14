import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const SURFACE_VALUES = ['40','60','80','100','120','140','160','180','200','400','600']

export default function PropertyFilters({ onFilter, initialFilters = null, initialOperation = '', autoApply = true, onClose = null }) {
    const { t } = useTranslation()

    const PRICE_RANGES = [
        { value: '',        label: t('common.no_limit') },
        { value: '50000',   label: '50.000 €' },
        { value: '100000',  label: '100.000 €' },
        { value: '150000',  label: '150.000 €' },
        { value: '200000',  label: '200.000 €' },
        { value: '300000',  label: '300.000 €' },
        { value: '500000',  label: '500.000 €' },
        { value: '750000',  label: '750.000 €' },
        { value: '1000000', label: '1.000.000 €' },
    ]

    const TYPES = [
        { value: '',          label: t('filters.all_types') },
        { value: 'apartment', label: t('properties.type.apartment') },
        { value: 'house',     label: t('properties.type.house') },
        { value: 'land',      label: t('properties.type.land') },
        { value: 'commercial', label: t('properties.type.commercial') },
        { value: 'garage',    label: t('properties.type.garage') },
    ]

    const SURFACE_RANGES = [
        { value: '', label: t('filters.all_areas') },
        ...SURFACE_VALUES.map(v => ({ value: v, label: `${t('common.from')} ${v} m²` }))
    ]

    const [filters, setFilters] = useState(initialFilters ?? {
        city:       '',
        operation:  initialOperation,
        type:       '',
        min_price:  '',
        max_price:  '',
        bedrooms:   [],
        bathrooms:  [],
        min_area:   '',
    })

    const toggleArray = (name, value) => {
        setFilters(prev => {
            const current = prev[name]
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value]
            return { ...prev, [name]: next }
        })
    }

    const update = (name, value) => {
        setFilters(prev => {
            const next = { ...prev, [name]: value }
            if (name === 'type' && value === 'garage') {
                next.bedrooms  = []
                next.bathrooms = []
            }
            return next
        })
    }

    useEffect(() => {
        if (!autoApply) return
        const timeout = setTimeout(() => {
            onFilter(filters)
        }, 300)
        return () => clearTimeout(timeout)
    }, [filters, autoApply])

    const handleReset = () => {
        const empty = Object.fromEntries(
            Object.keys(filters).map(k => [k, Array.isArray(filters[k]) ? [] : ''])
        )
        setFilters(empty)
        if (autoApply) onFilter(empty)
    }

    const handleApply = () => {
        onFilter(filters)
        if (onClose) onClose()
    }

    const hasFilters = Object.values(filters).some(v =>
        Array.isArray(v) ? v.length > 0 : v !== ''
    )

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-6 transition-colors duration-200">

            {/* Operación */}
            <div>
                <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-colors duration-200">
                    {[
                        { value: '',     label: t('filters.all') },
                        { value: 'sale', label: t('filters.buy') },
                        { value: 'rent', label: t('filters.rent') },
                    ].map(op => (
                        <button
                            key={op.value}
                            type="button"
                            onClick={() => update('operation', op.value)}
                            className={`flex-1 py-2.5 text-sm font-medium transition-colors
                                ${filters.operation === op.value
                                    ? 'bg-gray-800 dark:bg-gray-700 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                            {op.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ciudad */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('filters.city')}</label>
                <input
                    value={filters.city}
                    onChange={e => update('city', e.target.value)}
                    placeholder={t('filters.city_placeholder')}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>

            {/* Tipo */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('filters.property_type')}</label>
                <select
                    value={filters.type}
                    onChange={e => update('type', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200">
                    {TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('filters.price')}</label>
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={filters.min_price}
                        onChange={e => update('min_price', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200">
                        <option value="">{t('filters.min')}</option>
                        {PRICE_RANGES.filter(p => p.value).map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                    <select
                        value={filters.max_price}
                        onChange={e => update('max_price', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200">
                        <option value="">{t('filters.max')}</option>
                        {PRICE_RANGES.filter(p => p.value).map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Habitaciones */}
            {filters.type !== 'garage' && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('filters.bedrooms')}</label>
                    <div className="flex gap-1">
                        {['1','2','3','4','5+'].map(b => (
                            <button
                                key={b}
                                type="button"
                                onClick={() => toggleArray('bedrooms', b)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border
                                    ${filters.bedrooms.includes(b)
                                        ? 'bg-gray-800 dark:bg-gray-700 text-white border-transparent'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                {b}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Baños */}
            {filters.type !== 'garage' && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('filters.bathrooms')}</label>
                    <div className="flex gap-1">
                        {['1','2','3+'].map(b => (
                            <button
                                key={b}
                                type="button"
                                onClick={() => toggleArray('bathrooms', b)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border
                                    ${filters.bathrooms.includes(b)
                                        ? 'bg-gray-800 dark:bg-gray-700 text-white border-transparent'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                {b}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Superficie */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('filters.area')}</label>
                <select
                    value={filters.min_area}
                    onChange={e => update('min_area', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200">
                    {SURFACE_RANGES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-2">
                {!autoApply && (
                    <button
                        type="button"
                        onClick={handleApply}
                        className="w-full py-3 bg-gray-800 dark:bg-gray-700 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200">
                        {t('filters.apply')}
                    </button>
                )}
                {hasFilters && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors text-center py-2">
                        {t('filters.clear')}
                    </button>
                )}
            </div>
        </div>
    )
}