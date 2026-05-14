import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useTranslation } from 'react-i18next'

export default function Register() {
    const { register } = useAuth()
    const navigate     = useNavigate()
    const { t }        = useTranslation()

    const [form, setForm] = useState({
        name:                  '',
        email:                 '',
        phone:                 '',
        role:                  'buyer',
        password:              '',
        password_confirmation: '',
    })
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
            await register(form)
            navigate('/')
        } catch (err) {
            const data = err.response?.data
            if (data?.errors) {
                setErrors(data.errors)
            } else {
                setErrors({ name: data?.message || t('auth.register_error', 'Error al registrarse.') })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-[70vh] flex items-center justify-center py-10">
                <div className="w-full max-w-md">

                    {/* Cabecera */}
                    <div className="text-center mb-8">
                        <span className="text-4xl">🏠</span>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3 transition-colors duration-200">
                            {t('auth.register_title')}
                        </h1>
                    </div>

                    {/* Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-200">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                            <Input
                                label={t('auth.name')}
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                error={errors.name}
                                placeholder={t('auth.name_placeholder', 'Juan García')}
                                required
                            />

                            <Input
                                label={t('auth.email')}
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                error={errors.email}
                                placeholder={t('auth.email_placeholder', 'tu@email.com')}
                                required
                            />

                            <Input
                                label={t('auth.phone')}
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                error={errors.phone}
                                placeholder={t('profile.phone_placeholder', '+34 600 000 000')}
                            />

                            {/* Rol */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">
                                    {t('auth.role_question', 'Quiero')} <span className="text-red-400 dark:text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'buyer',  label: t('auth.role_buyer_desc', 'Comprar o alquilar') },
                                        { value: 'seller', label: t('auth.role_seller_desc', 'Vender o alquilar') },
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, role: option.value })}
                                            className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors duration-200 text-left
                                                ${form.role === option.value
                                                    ? 'border-gray-800 dark:border-gray-600 bg-gray-800 dark:bg-gray-700 text-white'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Input
                                label={t('auth.password')}
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                error={errors.password}
                                placeholder={t('profile.password_min')}
                                required
                            />

                            <Input
                                label={t('auth.confirm_password')}
                                name="password_confirmation"
                                type="password"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                error={errors.password_confirmation}
                                placeholder={t('profile.confirm_password_placeholder')}
                                required
                            />

                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full mt-2"
                                size="lg"
                            >
                                {t('auth.register_title')}
                            </Button>

                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6 transition-colors duration-200">
                        {t('auth.have_account')}{' '}
                        <Link to="/login" className="text-gray-800 dark:text-white font-medium hover:underline transition-colors duration-200">
                            {t('auth.login_link')}
                        </Link>
                    </p>

                </div>
            </div>
        </Layout>
    )
}