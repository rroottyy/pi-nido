import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { useProperty } from '../../hooks/useProperties'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import PropertyMap from '../../components/ui/PropertyMap'
import { useTranslation } from 'react-i18next'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'

const ALL_EXTRAS = [
    { key: 'has_garage',   tKey: 'garage' },
    { key: 'has_elevator', tKey: 'elevator' },
    { key: 'has_pool',     tKey: 'pool' },
    { key: 'has_garden',   tKey: 'garden' },
    { key: 'is_furnished', tKey: 'furnished' },
]

export default function PropertyDetail() {
    const { id }       = useParams()
    const { user }     = useAuth()
    const navigate     = useNavigate()
    const { property, loading, error } = useProperty(id)
    const { t } = useTranslation()

    const [thumbsSwiper, setThumbsSwiper]   = useState(null)
    const [msgBody, setMsgBody]             = useState('')
    const [msgSent, setMsgSent]             = useState(false)
    const [msgLoading, setMsgLoading]       = useState(false)
    const [favSaved, setFavSaved]           = useState(false)
    const [lightboxOpen, setLightboxOpen]   = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(0)
    const mapRef = useRef(null)
    const [showTooltip, setShowTooltip] = useState(false)
    const tooltipRef = useRef(null)

    useEffect(() => {
        if (lightboxOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [lightboxOpen])

    useEffect(() => {
    if (!user || !property) return
    api.get(`/favorites/${id}`)
        .then(({ data }) => setFavSaved(data.is_favorite))
        .catch(() => {})
    }, [user, property])

    useEffect(() => {
    const handleClickOutside = (event) => {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
            setShowTooltip(false)
        }
    }

    if (showTooltip) {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
    }
    }, [showTooltip])

    const openLightbox = (index) => {
        setLightboxIndex(index)
        setLightboxOpen(true)
    }

    const handleSendMessage = async e => {
        e.preventDefault()
        if (!msgBody.trim()) return
        setMsgLoading(true)
        try {
            await api.post(`/properties/${id}/messages`, { body: msgBody })
            setMsgSent(true)
            setMsgBody('')
        } catch {
            alert('Error al enviar el mensaje.')
        } finally {
            setMsgLoading(false)
        }
    }

    const handleFavorite = async () => {
        if (!user) { navigate('/login'); return }
        try {
            if (favSaved) {
                await api.delete(`/favorites/${id}`)
                setFavSaved(false)
            } else {
                await api.post(`/favorites/${id}`)
                setFavSaved(true)
            }
        } catch {
            alert('Error al gestionar favorito.')
        }
    }

    if (loading) return <Layout><Spinner /></Layout>

    if (error) return (
        <Layout>
            <div className="text-center py-20">
                <p className="text-5xl mb-4">🏚️</p>
                <p className="text-gray-400 dark:text-gray-500">{error}</p>
                <Link to="/properties" className="text-gray-800 dark:text-white font-medium mt-4 inline-block transition-colors">
                    {t('properties.back_to_list')}
                </Link>
            </div>
        </Layout>
    )

    const images       = property.images || []
    const isOwner      = user && user.id === property.seller?.id
    const activeExtras = ALL_EXTRAS.filter(e => property[e.key])

    return (
        <Layout>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-2xl text-gray-400 dark:text-gray-500 mb-6 transition-colors">
                <Link to="/properties" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">{t('properties.back')}</Link>
                <span>/</span>
                <span className="text-gray-600 dark:text-gray-300 truncate">{property.title}</span>
            </div>

            {/* Título + Precio */}
            <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full transition-colors
                            ${property.operation === 'sale'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                            {property.operation === 'sale' ? t('properties.for_sale') : t('properties.for_rent')}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{t(`properties.type.${property.type}`)}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white wrap-break-word transition-colors">{property.title}</h1>
                    <p className="text-2xl text-gray-400 dark:text-gray-500 mt-1 wrap-break-word transition-colors">
                        {property.address} · {property.city}, {property.province}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
                        {property.formatted_price}
                    </p>
                    {property.operation === 'rent' && (
                        <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors">{t('common.per_month')}</p>
                    )}
                </div>
            </div>

            {/* Galería + Card contacto*/}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                {/* Galería */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 transition-colors">
                        {images.length > 0 ? (
                            <>
                                <Swiper
                                    modules={[Navigation, Thumbs, Pagination]}
                                    navigation
                                    pagination={{ clickable: true }}
                                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                    className="aspect-video"
                                    style={{
                                        '--swiper-navigation-color': '#fff',
                                        '--swiper-pagination-color': '#fff',
                                    }}>
                                    {images.map((img, i) => (
                                        <SwiperSlide key={img.id}>
                                            <img
                                                src={img.url}
                                                alt={property.title}
                                                className="w-full h-full object-cover cursor-pointer"
                                                onClick={() => openLightbox(i)}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {images.length > 1 && (
                                    <Swiper
                                        onSwiper={setThumbsSwiper}
                                        modules={[Thumbs]}
                                        spaceBetween={8}
                                        slidesPerView={Math.min(images.length, 6)}
                                        watchSlidesProgress
                                        className="p-3 bg-white dark:bg-gray-800 transition-colors">
                                        {images.map((img, i) => (
                                            <SwiperSlide key={img.id} className="cursor-pointer" onClick={() => openLightbox(i)}>
                                                <div className="aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-800 dark:hover:border-gray-300 transition-colors">
                                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                )}
                            </>
                        ) : (
                            <div className="aspect-video flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 text-6xl text-gray-200 dark:text-gray-600 transition-colors">
                                🏠
                            </div>
                        )}
                    </div>
                </div>

                {/* Card contacto */}
                <div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sticky top-20 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-600 flex items-center justify-center text-sm font-bold text-white shrink-0 transition-colors">
                                {property.seller?.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-gray-800 dark:text-white text-sm truncate transition-colors">{property.seller?.name}</p>
                                {property.seller?.phone && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate transition-colors">{property.seller.phone}</p>
                                )}
                            </div>
                        </div>

                        {isOwner ? (
                            <Link to={`/properties/${id}/edit`}>
                                <Button className="w-full" size="sm">{t('properties.edit_property')}</Button>
                            </Link>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {/* Mensaje */}
                                {msgSent ? (
                                    <div className="text-center py-3 bg-green-50 dark:bg-green-900/20 rounded-xl transition-colors">
                                        <p className="text-xs text-green-700 dark:text-green-400 font-medium">{t('properties.message_sent')}</p>
                                        <button
                                            onClick={() => setMsgSent(false)}
                                            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mt-1 transition-colors">
                                            {t('properties.send_another')}
                                        </button>
                                    </div>
                                ) : user ? (
                                    <>
                                       {/* Tooltip de información */}
                                <div className="flex justify-end mb-1">
                                    <div className="relative flex items-center" ref={tooltipRef}>
                                        <button
                                            type="button"
                                            onClick={() => setShowTooltip(!showTooltip)}
                                            onMouseEnter={() => setShowTooltip(true)}
                                            onMouseLeave={() => setShowTooltip(false)}
                                            className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-400 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors outline-none"
                                        >
                                            i
                                        </button>
                                        <div 
                                            className={`absolute bottom-full right-0 mb-2 w-56 p-2 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg transition-all z-10 text-center pointer-events-none
                                            ${showTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                                        >
                                            {t('properties.email_visibility_info')}
                                            <div className="absolute top-full right-1 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                        </div>
                                    </div>
                                </div>

                                        <textarea
                                            value={msgBody}
                                            onChange={e => setMsgBody(e.target.value)}
                                            rows={3}
                                            maxLength={1000}
                                            placeholder={t('properties.message_placeholder')}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:border-gray-400 dark:focus:border-gray-500 resize-none transition-colors"
                                        />
                                        <p className="text-xs text-gray-400 dark:text-gray-500 text-right transition-colors">{msgBody.length}/1000</p>
                                        <Button
                                            type="button"
                                            onClick={handleSendMessage}
                                            loading={msgLoading}
                                            size="sm"
                                            className="w-full">
                                            {t('properties.send_message')}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-1 transition-colors">
                                            {t('properties.login_to_contact')}
                                        </p>
                                        <Link to="/login">
                                            <Button className="w-full" size="sm">{t('properties.login')}</Button>
                                        </Link>
                                    </>
                                )}

                                {/* Favoritos */}
                                <button
                                    onClick={handleFavorite}
                                    className={`w-full py-2 px-3 rounded-xl border text-xs font-medium transition-colors
                                        ${favSaved
                                            ? 'border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                            : 'border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                    {favSaved ? t('properties.saved_favorite') : t('properties.save_favorite')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Descripción */}
            <div className="mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 transition-colors">{t('properties.description')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line wrap-break-word transition-colors">
                        {property.description}
                    </p>
                </div>
            </div>

            {/* Características + Mapa */}
            <div ref={mapRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Características */}
                <div className="flex flex-col gap-4">

                    {/* Datos principales */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 transition-colors">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm transition-colors">{t('properties.data')}</h2>
                        <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-700/50 transition-colors">
                            {property.bedrooms > 0 && (
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-400 dark:text-gray-500">{t('properties.bedrooms')}</span>
                                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{property.bedrooms}</span>
                                </div>
                            )}
                            {property.bathrooms > 0 && (
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-400 dark:text-gray-500">{t('properties.bathrooms')}</span>
                                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{property.bathrooms}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-400 dark:text-gray-500">{t('properties.area')}</span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-white">{property.area} m²</span>
                            </div>
                        </div>
                    </div>

                    {/* Extras */}
                    {activeExtras.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 transition-colors">
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm transition-colors">{t('properties.features')}</h2>
                            <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-700/50 transition-colors">
                                {activeExtras.map(feat => (
                                    <div key={feat.key} className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t(`form.extras_list.${feat.tKey}`)}</span>
                                        <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full transition-colors">{t('common.yes')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detalles adicionales */}
                    {(property.construction_year || property.energy_certificate) && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 transition-colors">
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm transition-colors">{t('properties.details')}</h2>
                            <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-700/50 transition-colors">
                                {property.construction_year && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-400 dark:text-gray-500">{t('properties.construction_year')}</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{property.construction_year}</span>
                                    </div>
                                )}
                                {property.energy_certificate && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-400 dark:text-gray-500">{t('properties.certificate')}</span>
                                        <span className={`text-xs font-bold text-white px-2.5 py-0.5 rounded-full
                                            ${property.energy_certificate === 'A' ? 'bg-green-500 dark:bg-green-600'
                                            : property.energy_certificate === 'B' ? 'bg-green-400 dark:bg-green-500'
                                            : property.energy_certificate === 'C' ? 'bg-yellow-400 dark:bg-yellow-500'
                                            : property.energy_certificate === 'D' ? 'bg-yellow-500 dark:bg-yellow-600'
                                            : property.energy_certificate === 'E' ? 'bg-orange-400 dark:bg-orange-500'
                                            : property.energy_certificate === 'F' ? 'bg-orange-500 dark:bg-orange-600'
                                            : 'bg-red-500 dark:bg-red-600'}`}>
                                            {property.energy_certificate}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Mapa */}
                <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-colors" style={{ height: '400px' }}>
                    <PropertyMap
                        address={property.address}
                        city={property.city}
                        province={property.province}
                        title={property.title}
                    />
                </div>

            </div>

            {/* Lightbox fullscreen */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center">
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 text-white text-xl z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        ✕
                    </button>
                    <div className="absolute top-4 left-4 text-white/70 text-sm z-10">
                        {lightboxIndex + 1} / {images.length}
                    </div>
                    <Swiper
                        modules={[Navigation, Pagination]}
                        navigation
                        pagination={{ clickable: true }}
                        initialSlide={lightboxIndex}
                        onSlideChange={(swiper) => setLightboxIndex(swiper.activeIndex)}
                        className="w-full h-full"
                        style={{
                            '--swiper-navigation-color': '#fff',
                            '--swiper-pagination-color': '#fff',
                            height: '100vh',
                        }}>
                        {images.map(img => (
                            <SwiperSlide key={img.id} className="h-full">
                                <div className="flex items-center justify-center w-full h-full">
                                    <img
                                        src={img.url}
                                        alt=""
                                        className="object-contain"
                                        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div
                        className="absolute inset-0 -z-10"
                        onClick={() => setLightboxOpen(false)}
                    />
                </div>
            )}

        </Layout>
    )
}