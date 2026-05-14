import { useState, useRef } from 'react'
import api from '../../services/api'
import Spinner from './Spinner'
import { useTranslation } from 'react-i18next'

const MAX_IMAGES = 20

export default function ImageUploader({ propertyId, images = [], onChange }) {
    const { t } = useTranslation()
    const [uploading, setUploading] = useState(false)
    const [error, setError]         = useState(null)
    const [pending, setPending]     = useState({})
    const [saving, setSaving]       = useState(false)
    const [saved, setSaved]         = useState(false)
    const inputRef                  = useRef()

    const previewImages = images
        .filter(img => pending[img.id] !== 'delete')
        .map(img => ({
            ...img,
            is_main: pending[img.id] === 'main'
                ? true
                : Object.values(pending).includes('main')
                    ? false
                    : img.is_main
        }))

    const remainingSlots = MAX_IMAGES - previewImages.length

    const BATCH_SIZE = 5

    const handleFiles = async (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) return

        if (files.length > remainingSlots) {
            setError(t('image_uploader.limit_exceeded', { remaining: remainingSlots, max: MAX_IMAGES }))
            inputRef.current.value = null
            return
        }

        setUploading(true)
        setError(null)

        let allUploaded = []

        try {
            for (let i = 0; i < files.length; i += BATCH_SIZE) {
                const batch = files.slice(i, i + BATCH_SIZE)
                const formData = new FormData()
                batch.forEach(f => formData.append('images[]', f))

                const { data } = await api.post(
                    `/properties/${propertyId}/images`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                allUploaded = [...allUploaded, ...data.data]
            }
            onChange([...images, ...allUploaded])
        } catch (err) {
            const msg = err.response?.data?.message
            setError(msg || t('image_uploader.upload_error'))
            if (allUploaded.length > 0) {
                onChange([...images, ...allUploaded])
            }
        } finally {
            setUploading(false)
            inputRef.current.value = null
        }
    }
    
    const markMain = (imageId) => {
        setPending(prev => {
            const next = { ...prev }
            Object.keys(next).forEach(k => {
                if (next[k] === 'main') delete next[k]
            })
            next[imageId] = 'main'
            return next
        })
    }

    const markDelete = (imageId) => {
        setPending(prev => ({ ...prev, [imageId]: 'delete' }))
    }

    const hasPending = Object.keys(pending).length > 0

    const handleSaveChanges = async () => {
        setSaving(true)
        setError(null)
        try {
            for (const [imageId, action] of Object.entries(pending)) {
                if (action === 'delete') {
                    await api.delete(`/properties/${propertyId}/images/${imageId}`)
                } else if (action === 'main') {
                    await api.put(`/properties/${propertyId}/images/${imageId}/set-main`)
                }
            }
            const newImages = images
                .filter(img => pending[img.id] !== 'delete')
                .map(img => ({
                    ...img,
                    is_main: pending[img.id] === 'main'
                        ? true
                        : Object.values(pending).includes('main')
                            ? false
                            : img.is_main
                }))
            onChange(newImages)
            setPending({})
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch {
            setError(t('image_uploader.save_error'))
        } finally {
            setSaving(false)
        }
    }

    const handleDiscardChanges = () => {
        setPending({})
    }

    const isLimitReached = previewImages.length >= MAX_IMAGES

    return (
        <div className="flex flex-col gap-4">

            {/* Zona de subida */}
            <div
                onClick={() => !isLimitReached && inputRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200
                    ${isLimitReached
                        ? 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                        : 'border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Spinner />
                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('image_uploader.uploading')}</p>
                    </div>
                ) : isLimitReached ? (
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🚫</span>
                        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                            {t('image_uploader.limit_reached', { max: MAX_IMAGES })}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📷</span>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('image_uploader.click_to_upload')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {t('image_uploader.upload_hints')}
                        </p>
                    </div>
                )}
            </div>

            {/* Contador */}
            <p className="text-xs text-gray-400 dark:text-gray-500 text-right transition-colors">
                {previewImages.length}/{MAX_IMAGES} {t('image_uploader.photos_count')}
            </p>

            {error && <p className="text-sm text-red-500 dark:text-red-400 transition-colors">{error}</p>}

            {/* Grid de imágenes */}
            {previewImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previewImages.map(img => (
                        <div
                            key={img.id}
                            className={`relative group rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-700 transition-all duration-200
                                ${pending[img.id] === 'main' ? 'ring-2 ring-gray-800 dark:ring-gray-200' : ''}`}>
                            <img
                                src={img.url}
                                alt=""
                                className="w-full h-full object-cover"
                            />

                            {img.is_main && (
                                <span className="absolute top-2 left-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-full transition-colors duration-200">
                                    {t('image_uploader.main')}
                                </span>
                            )}

                            {pending[img.id] === 'delete' && (
                                <div className="absolute inset-0 bg-red-500/60 dark:bg-red-900/70 flex items-center justify-center transition-colors duration-200">
                                    <span className="text-white font-semibold text-sm">{t('image_uploader.will_be_deleted')}</span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {!img.is_main && (
                                    <button
                                        type="button"
                                        onClick={() => markMain(img.id)}
                                        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                                        ⭐ {t('image_uploader.main')}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => markDelete(img.id)}
                                    className="bg-red-500 dark:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200">
                                    🗑️ {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Barra de cambios pendientes */}
            {hasPending && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-xl px-4 py-3 transition-colors duration-200">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium text-center sm:text-left">
                        {t('image_uploader.pending_changes')}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleDiscardChanges}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 transition-colors duration-200">
                            {t('image_uploader.discard')}
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="text-xs text-white font-medium px-3 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200">
                            {saving ? t('image_uploader.saving') : t('image_uploader.save_changes')}
                        </button>
                    </div>
                </div>
            )}

            {saved && (
                <p className="text-sm text-green-600 dark:text-green-400 transition-colors duration-200">
                    {t('image_uploader.saved_success')}
                </p>
            )}

        </div>
    )
}