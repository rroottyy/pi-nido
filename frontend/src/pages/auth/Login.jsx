import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useTranslation } from 'react-i18next'


export default function Login() {
    const { login } = useAuth()
    const navigate  = useNavigate()
    const { t }     = useTranslation()


    const [form, setForm]       = useState({ email: '', password: '' })
    const [errors, setErrors]   = useState({})
    const [loading, setLoading] = useState(false)

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setErrors({ ...errors, [e.target.name]: null })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const user = await login(form.email, form.password)
            if (user.role === 'admin' || user.role === 'seller') {
                navigate('/profile')
            } else {
                navigate('/properties')
            }
        } catch (err) {
            const data = err.response?.data
            if (data?.errors) {
                setErrors(data.errors)
            } else {
                setErrors({ email: data?.message || 'Error al iniciar sesión.' })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="w-full max-w-md">

                    {/* Cabecera */}
                    <div className="text-center mb-8">
                        <span className="text-4xl">🏠</span>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3 transition-colors duration-200">
                            {t('auth.login_title')}
                        </h1>
                        <p className="text-gray-400 dark:text-gray-400 text-sm mt-1 transition-colors duration-200">
                            {t('auth.login_subtitle')}
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-200">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                            <Input
                                label={t('auth.email')}
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                error={errors.email}
                                placeholder="tu@email.com"
                                required
                            />

                            <Input
                                label={t('auth.password')}
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                error={errors.password}
                                placeholder="••••••••"
                                required
                            />

                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full mt-2"
                                size="lg"
                            >
                                {t('auth.login')}
                            </Button>

                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6 transition-colors duration-200">
                        {t('auth.no_account')}{' '}
                        <Link to="/register" className="text-gray-800 dark:text-white font-medium hover:underline transition-colors duration-200">
                            {t('auth.register_link')}
                        </Link>
                    </p>

                </div>
            </div>
        </Layout>
    )
}