import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useTranslation } from 'react-i18next'

export default function Home() {
    const { t } = useTranslation()

    return (
        <Layout>
            {/* Hero */}
            <div className="text-center py-24">
                <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-200">
                    {t('home.title_part1')}<br />
                    <span className="text-blue-600 dark:text-blue-400">Nido</span> {t('home.title_part2')}
                </h1>
                <p className="text-xl text-gray-400 dark:text-gray-400 mb-10 max-w-lg mx-auto transition-colors duration-200">
                    {t('home.subtitle_extended')}
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        to="/properties?operation=sale"
                        className="bg-gray-800 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white transition-colors duration-200">
                        {t('home.view_sale')}
                    </Link>
                    <Link
                        to="/properties?operation=rent"
                        className="bg-white text-gray-800 border border-gray-200 px-8 py-3.5 rounded-xl font-medium hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors duration-200">
                        {t('home.view_rent')}
                    </Link>
                </div>
            </div>
        </Layout>
    )
}