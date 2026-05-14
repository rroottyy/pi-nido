import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import api from '../../services/api'
import ImageUploader from '../../components/ui/ImageUploader'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
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

const EMPTY_FORM = {
    title:              '',
    description:        '',
    type:               'apartment',
    operation:          'sale',
    price:              '',
    address:            '',
    city:               '',
    province:           '',
    postal_code:        '',
    bedrooms:           '',
    bathrooms:          '',
    area:               '',
    has_garage:         false,
    has_elevator:       false,
    has_pool:           false,
    has_garden:         false,
    is_furnished:       false,
    construction_year:  '',
    energy_certificate: '',
}

export default function PropertyForm() {
    const { id }       = useParams()
    const navigate     = useNavigate()
    useRequireAuth()
    const { t }        = useTranslation()
    const isEditing    = Boolean(id)
    const location     = useLocation()
    const fromCreate   = location.state?.fromCreate === true

    const TYPES = [
        { value: 'apartment',  label: t('properties.type.apartment') },
        { value: 'house',      label: t('properties.type.house') },
        { value: 'land',       label: t('properties.type.land') },
        { value: 'commercial', label: t('properties.type.commercial') },
        { value: 'garage',     label: t('properties.type.garage') },
    ]

    const OPERATIONS = [
        { value: 'sale', label: t('form.for_sale') },
        { value: 'rent', label: t('form.for_rent') },
    ]

    const [form, setForm]           = useState(EMPTY_FORM)
    const [errors, setErrors]       = useState({})
    const [loading, setLoading]     = useState(false)
    const [canceling, setCanceling] = useState(false)
    const [fetching, setFetching]   = useState(isEditing)
    const [images, setImages]       = useState([])

    useEffect(() => {
        if (!isEditing) return
        const fetchProperty = async () => {
            try {
                const { data } = await api.get(`/properties/${id}`)
                const p = data.data
                setForm({
                    title:              p.title,
                    description:        p.description,
                    type:               p.type,
                    operation:          p.operation,
                    price:              p.price,
                    address:            p.address,
                    city:               p.city,
                    province:           p.province,
                    postal_code:        p.postal_code,
                    bedrooms:           p.bedrooms,
                    bathrooms:          p.bathrooms,
                    area:               p.area,
                    has_garage:         p.has_garage,
                    has_elevator:       p.has_elevator,
                    has_pool:           p.has_pool,
                    has_garden:         p.has_garden,
                    is_furnished:       p.is_furnished,
                    construction_year:  p.construction_year || '',
                    energy_certificate: p.energy_certificate || '',
                })
                setImages(p.images || [])
            } catch {
                navigate('/properties')
            } finally {
                setFetching(false)
            }
        }
        fetchProperty()
    }, [id, navigate])

    const handleChange = e => {
        const { name, value, type, checked } = e.target
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
        setErrors(err => ({ ...err, [name]: null }))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        try {
            if (isEditing && !fromCreate) {
                await api.put(`/properties/${id}`, form)
                navigate(`/properties/${id}`)
            } else if (isEditing && fromCreate) {
                await api.put(`/properties/${id}`, form)
                navigate(`/properties/${id}/photos`)
            } else {
                const { data } = await api.post('/properties', form)
                navigate(`/properties/${data.data.id}/photos`)
            }
        } catch (err) {
            const data = err.response?.data
            if (data?.errors) {
                setErrors(data.errors)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
                setErrors({ title: data?.message || t('common.error') })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async () => {
        if (isEditing && fromCreate) {
            setCanceling(true)
            try {
                await api.delete(`/properties/${id}`)
                navigate('/my-properties')
            } catch {
                navigate('/my-properties')
            } finally {
                setCanceling(false)
            }
        } else {
            navigate(-1)
        }
    }

    if (fetching) return <Layout><Spinner /></Layout>

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">

                {/* Cabecera */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                        {isEditing ? t('form.edit') : t('form.publish')}
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 transition-colors duration-200">
                        {isEditing ? t('form.edit_subtitle') : t('form.publish_subtitle')}
                    </p>
                </div>

                {/* Aviso edición */}
                {isEditing && !fromCreate && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-2xl px-5 py-4 flex items-start gap-3 mb-6 transition-colors duration-200">
                        <span className="text-xl shrink-0">⚠️</span>
                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                            <span className="font-semibold">{t('form.attention')} </span>
                            {t('form.warning_edit')}
                        </p>
                    </div>
                )}

                {/* Aviso crear */}
                {(!isEditing || fromCreate) && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl px-5 py-4 flex items-start gap-3 mb-6 transition-colors duration-200">
                        <span className="text-xl shrink-0">📷</span>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                            {t('form.step1')}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Sección 1 — Información básica */}
                    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5">{t('form.basic_info')}</h2>
                        <div className="flex flex-col gap-4">
                            <Input
                                label={t('form.title')}
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                error={errors.title}
                                placeholder={t('form.title_placeholder')}
                                maxLength={60}
                                required
                            />
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">
                                    {t('form.description')} <span className="text-red-400 dark:text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={5}
                                    maxLength={2000}
                                    placeholder={t('form.description_placeholder')}
                                    className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none resize-none transition-colors duration-200 dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                                        ${errors.description
                                            ? 'border-red-300 focus:border-red-400 bg-red-50 dark:border-red-500/50 dark:focus:border-red-500 dark:bg-red-900/20'
                                            : 'border-gray-200 focus:border-gray-400 dark:border-gray-700 dark:focus:border-gray-500'}`}
                                />
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-right transition-colors duration-200">
                                    {form.description.length}/2000
                                </p>
                                {errors.description && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">
                                        {t('form.type')}
                                    </label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200">
                                        {TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">
                                        {t('form.operation')}
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {OPERATIONS.map(op => (
                                            <button
                                                key={op.value}
                                                type="button"
                                                onClick={() => {
                                                    setForm(f => ({ ...f, operation: op.value }))
                                                    setErrors(err => ({ ...err, operation: null }))
                                                }}
                                                className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors duration-200
                                                    ${form.operation === op.value
                                                        ? 'border-gray-800 bg-gray-800 text-white dark:border-gray-600 dark:bg-gray-700'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700/50'}`}>
                                                {op.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sección 2 — Precio y superficie */}
                    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5">{t('form.price_area')}</h2>
                        <div className={`grid grid-cols-2 ${form.type !== 'garage' ? 'sm:grid-cols-4' : ''} gap-4`}>
                            <Input
                                label={t('form.price')}
                                name="price"
                                type="number"
                                value={form.price}
                                onChange={handleChange}
                                error={errors.price}
                                placeholder="250000"
                                required
                            />
                            <Input
                                label={t('form.area')}
                                name="area"
                                type="number"
                                value={form.area}
                                onChange={handleChange}
                                error={errors.area}
                                placeholder="90"
                                required
                            />
                            {form.type !== 'garage' && (
                                <>
                                    <Input
                                        label={t('form.bedrooms')}
                                        name="bedrooms"
                                        type="number"
                                        value={form.bedrooms}
                                        onChange={handleChange}
                                        error={errors.bedrooms}
                                        placeholder="3"
                                    />
                                    <Input
                                        label={t('form.bathrooms')}
                                        name="bathrooms"
                                        type="number"
                                        value={form.bathrooms}
                                        onChange={handleChange}
                                        error={errors.bathrooms}
                                        placeholder="2"
                                    />
                                </>
                            )}
                        </div>
                    </section>

                    {/* Sección 3 — Ubicación */}
                    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5">{t('form.location')}</h2>
                        <div className="flex flex-col gap-4">
                            <Input
                                label={t('form.address')}
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                error={errors.address}
                                placeholder={t('form.address_placeholder')}
                                maxLength={60}
                                required
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <Input
                                    label={t('form.city')}
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    error={errors.city}
                                    placeholder="Reus"
                                    maxLength={30}
                                    required
                                />
                                <Input
                                    label={t('form.province')}
                                    name="province"
                                    value={form.province}
                                    onChange={handleChange}
                                    error={errors.province}
                                    placeholder="Tarragona"
                                    maxLength={30}
                                    required
                                />
                                <Input
                                    label={t('form.postal_code')}
                                    name="postal_code"
                                    value={form.postal_code}
                                    onChange={handleChange}
                                    error={errors.postal_code}
                                    placeholder="43201"
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Sección 4 — Extras y Detalles (solo aparece si estamos editando) */}
                    {isEditing && !fromCreate && form.type !== 'garage' && (
                        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5">{t('form.extras')} y {t('form.more_details')}</h2>
                            
                            {/* Checkboxes de extras */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                                {EXTRAS.map(extra => (
                                    <label key={extra.key} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-200
                                            ${form[extra.key]
                                                ? 'border-gray-800 bg-gray-800 dark:border-gray-200 dark:bg-gray-200'
                                                : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 group-hover:border-gray-400 dark:group-hover:border-gray-500'}`}>
                                            {form[extra.key] && (
                                                <svg className="w-3 h-3 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            name={extra.key}
                                            checked={form[extra.key]}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                            {t(`form.extras_list.${extra.tKey}`)}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Año de construcción */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">
                                        {t('form.construction_year')}
                                    </label>
                                    <input
                                        type="number"
                                        name="construction_year"
                                        value={form.construction_year}
                                        onChange={handleChange}
                                        placeholder={t('form.construction_year_placeholder')}
                                        min="1000"
                                        max={new Date().getFullYear()}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200"
                                    />
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
                                                onClick={() => setForm(f => ({
                                                    ...f,
                                                    energy_certificate: f.energy_certificate === label ? '' : label
                                                }))}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors duration-200
                                                    ${form.energy_certificate === label
                                                        ? `${ENERGY_COLORS[label]} text-white`
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Sección 5 — Imágenes (solo al editar un anuncio publicado) */}
                    {isEditing && !fromCreate && (
                        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('form.images')}</h2>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mb-5 transition-colors duration-200">
                                {images.length === 0 ? t('form.images_empty') : t('form.images_hint')}
                            </p>
                            <ImageUploader
                                propertyId={id}
                                images={images}
                                onChange={setImages}
                            />
                        </section>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pb-8">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCancel}
                            disabled={loading || canceling}>
                            {canceling ? t('common.loading') : t('form.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={canceling}
                            size="lg">
                            {isEditing && !fromCreate ? t('form.save') : t('form.next')}
                        </Button>
                    </div>

                </form>
            </div>
        </Layout>
    )
}