import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
    const { t } = useTranslation()

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-auto transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    {/* Marca y Copyright */}
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-200">
                            <span className="text-blue-600 dark:text-blue-500">Nido</span>
                        </span>
                        <span className="text-gray-300 dark:text-gray-700 hidden md:inline transition-colors duration-200">|</span>
                        <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors duration-200">
                            © {new Date().getFullYear()}. {t('footer.all_rights')}.
                        </p>
                    </div>

                    {/* Enlaces Legales */}
                    <div className="flex items-center gap-6">
                        <Link to="/terms" className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
                            {t('footer.terms')}
                        </Link>
                        <Link to="/privacy" className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
                            {t('footer.privacy')}
                        </Link>
                        <Link to="/contact" className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
                            {t('footer.contact')}
                        </Link>
                    </div>

                    {/* Autor */}
                    <div className="text-sm text-gray-400 dark:text-gray-500 transition-colors duration-200">
                        {t('footer.developed_by')} <span className="font-medium text-gray-500 dark:text-gray-400">Héctor Torres</span>
                    </div>

                </div>
            </div>
        </footer>
    )
}