import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import ImageUploader from '../../components/ui/ImageUploader'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'

const EXTRAS = [
    { key: 'has_garage',   tKey: 'garage' },
    { key: 'has_elevator', tKey: 'elevator' },
    { key: 'has_pool',     tKey: 'pool' },
    { key: 'has_garden',   tKey: 'garden' },
    { key: 'is_furnished', tKey: 'furnished' },
]

const ENERGY_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
const ENERGY_COLORS = {
    A: 'bg-green-500 dark:bg-green-600',
    B: 'bg-green-400 dark:bg-green-500',
    C: 'bg-yellow-400 dark:bg-yellow-500',
    D: 'bg-yellow-500 dark:bg-yellow-600',
    E: 'bg-orange-400 dark:bg-orange-500',
    F: 'bg-orange-500 dark:bg-orange-600',
    G: 'bg-red-500 dark:bg-red-600',
}

const EMPTY_DETAILS = {
    has_garage:         false,
    has_elevator:       false,
    has_pool:           false,
    has_garden:         false,
    is_furnished:       false,
    construction_year:  '',
    energy_certificate: '',
}

export default function PropertyPhotos() {
    const { id }   = useParams()
    const navigate = useNavigate()
    useRequireAuth()
    const { t }    = useTranslation()

    const [details, setDetails]       = useState(EMPTY_DETAILS)
    const [images, setImages]         = useState([])
    const [saving, setSaving]         = useState(false)
    const [error, setError]           = useState(null)
    const [yearError, setYearError]   = useState(null)
    const [propertyType, setPropertyType] = useState(null)

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const { data } = await api.get(`/properties/${id}`)
                const p = data.data
                setPropertyType(p.type)
                setDetails({
                    has_garage:         p.has_garage,
                    has_elevator:       p.has_elevator,
                    has_pool:           p.has_pool,
                    has_garden:         p.has_garden,
                    is_furnished:       p.is_furnished,
                    construction_year:  p.construction_year || '',
                    energy_certificate: p.energy_certificate || '',
                })
            } catch (err) {
                console.error(err)
            }
        }
        fetchProperty()
    }, [id])

    const handleChange = e => {
        const { name, value, type, checked } = e.target
        setDetails(d => ({ ...d, [name]: type === 'checkbox' ? checked : value }))

        if (name === 'construction_year') {
            const year = parseInt(value)
            const currentYear = new Date().getFullYear()
            if (value && year > currentYear) {
                setYearError(t('form.year_error'))
            } else {
                setYearError(null)
            }
        }
    }

    const handleFinish = async () => {
        if (yearError) return
        setSaving(true)
        setError(null)
        try {
            await api.put(`/properties/${id}/details`, details)
            navigate(`/properties/${id}`)
        } catch {
            setError(t('common.error'))
            setSaving(false)
        }
    }

    const isGarage = propertyType === 'garage'

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">

                {/* Cabecera */}
                <div className="mb-6">
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-1 transition-colors duration-200">Paso 2 de 2</p>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{t('form.step2_title')}</h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 transition-colors duration-200">
                        {t('form.step2_subtitle')}
                    </p>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-8 transition-colors duration-200">
                    <div className="bg-gray-800 dark:bg-gray-200 h-1.5 rounded-full w-full transition-all duration-200"></div>
                </div>

                <div className="flex flex-col gap-6">

                    {/* Extras */}
                    {!isGarage && (
                        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5 transition-colors duration-200">{t('form.extras')}</h2>
                            <div className="flex flex-col gap-3">
                                {EXTRAS.map(extra => (
                                    <label
                                        key={extra.key}
                                        className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-200
                                            ${details[extra.key]
                                                ? 'border-gray-800 bg-gray-800 dark:border-gray-200 dark:bg-gray-200'
                                                : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 group-hover:border-gray-400 dark:group-hover:border-gray-500'}`}>
                                            {details[extra.key] && (
                                                <svg className="w-3 h-3 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            name={extra.key}
                                            checked={details[extra.key]}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{t(`form.extras_list.${extra.tKey}`)}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Más detalles */}
                    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5 transition-colors duration-200">{t('form.more_details')}</h2>
                        <div className="grid grid-cols-2 gap-6">

                            {/* Año */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">
                                    {t('form.construction_year')}
                                </label>
                                <input
                                    type="number"
                                    name="construction_year"
                                    value={details.construction_year}
                                    onChange={handleChange}
                                    placeholder={t('form.construction_year_placeholder')}
                                    min="1000"
                                    max={new Date().getFullYear()}
                                    className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200
                                        ${yearError 
                                            ? 'border-red-300 bg-red-50 dark:border-red-500/50 dark:bg-red-900/20' 
                                            : 'border-gray-200 dark:border-gray-700'}`}
                                />
                                {yearError && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 transition-colors duration-200">{yearError}</p>
                                )}
                            </div>

                            {/* Certificado energético */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">
                                    {t('form.energy_certificate')}
                                </label>
                                <div className="flex gap-1.5">
                                    {ENERGY_LABELS.map(label => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => setDetails(d => ({
                                                ...d,
                                                energy_certificate: d.energy_certificate === label ? '' : label
                                            }))}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors duration-200
                                                ${details.energy_certificate === label
                                                    ? `${ENERGY_COLORS[label]} text-white`
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Fotos */}
                    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200">{t('form.photos')}</h2>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-5 transition-colors duration-200">
                            {t('form.photos_subtitle')}
                        </p>
                        <ImageUploader
                            propertyId={id}
                            images={images}
                            onChange={setImages}
                        />
                    </section>

                    {error && <p className="text-sm text-red-500 dark:text-red-400 transition-colors duration-200">{error}</p>}

                    {/* Botones */}
                    <div className="flex justify-between pb-8">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(`/properties/${id}/edit`, { state: { fromCreate: true } })}>
                            {t('form.back_edit')}
                        </Button>
                        <Button
                            onClick={handleFinish}
                            loading={saving}
                            disabled={!!yearError}
                            size="lg">
                            {t('form.finish')}
                        </Button>
                    </div>

                </div>
            </div>
        </Layout>
    )
}