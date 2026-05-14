import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function PropertyCard({ property, isFavorite = false }) {
    const { t } = useTranslation()
    const handleClick = () => {
        sessionStorage.setItem('scroll_position', window.scrollY)
    }

    return (
        <Link
            to={`/properties/${property.id}`}
            onClick={handleClick}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200 flex flex-col h-full"
        >
            {/* Imagen */}
            <div className="h-48 bg-gray-100 dark:bg-gray-700/50 relative overflow-hidden transition-colors duration-200 shrink-0">
                {property.main_image ? (
                    <img
                        src={property.main_image.url}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200 dark:text-gray-600 transition-colors duration-200">
                        🏠
                    </div>
                )}
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors duration-200
                    ${property.operation === 'sale'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-600 dark:text-white'}`}>
                    {property.operation === 'sale' ? t('properties.sale') : t('properties.rent')}
                </span>
                
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col grow transition-colors duration-200">
                <p className="text-xs text-gray-400 dark:text-gray-400 mb-1">
                    {t(`properties.type.${property.type}`)} · {property.city}
                </p>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-3 line-clamp-2 leading-snug">
                    {property.title}
                </h3>

                <div className="mt-auto flex flex-col gap-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {property.formatted_price}
                    </span>
                    
                    <div className="w-full h-px bg-gray-100 dark:bg-gray-700 my-1 transition-colors duration-200"></div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        {property.bedrooms > 0 && (
                            <span>{t('properties.bedrooms')}: {property.bedrooms}</span>
                        )}
                        {property.bathrooms > 0 && (
                            <span>{t('properties.bathrooms')}: {property.bathrooms}</span>
                        )}
                        <span>{t('properties.area')}: {property.area} m²</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}