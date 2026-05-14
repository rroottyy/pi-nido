import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'

export default function Profile() {
    const { user, login } = useAuth()
    const { t } = useTranslation()

    const [form, setForm] = useState({
        name:  user?.name  || '',
        phone: user?.phone || '',
    })
    const [passForm, setPassForm] = useState({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    })
    const [errors, setErrors]       = useState({})
    const [passErrors, setPassErrors] = useState({})
    const [saving, setSaving]       = useState(false)
    const [savingPass, setSavingPass] = useState(false)
    const [saved, setSaved]         = useState(false)
    const [savedPass, setSavedPass] = useState(false)

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setErrors({ ...errors, [e.target.name]: null })
    }

    const handlePassChange = e => {
        setPassForm({ ...passForm, [e.target.name]: e.target.value })
        setPassErrors({ ...passErrors, [e.target.name]: null })
    }

    const handleSaveProfile = async e => {
        e.preventDefault()
        setSaving(true)
        setErrors({})
        try {
            await api.put('/me', form)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            setErrors(err.response?.data?.errors || {})
        } finally {
            setSaving(false)
        }
    }

    const handleSavePassword = async e => {
        e.preventDefault()
        setSavingPass(true)
        setPassErrors({})
        try {
            await api.put('/me/password', passForm)
            setPassForm({
                current_password:      '',
                password:              '',
                password_confirmation: '',
            })
            setSavedPass(true)
            setTimeout(() => setSavedPass(false), 3000)
        } catch (err) {
            setPassErrors(err.response?.data?.errors || {})
        } finally {
            setSavingPass(false)
        }
    }

    const ROLE_LABELS = {
        admin:  t('profile.roles.admin'),
        seller: t('profile.roles.seller'),
        buyer:  t('profile.roles.buyer'),
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">

                {/* Cabecera */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-gray-800 dark:bg-gray-600 flex items-center justify-center text-2xl font-bold text-white transition-colors duration-200">
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{user?.name}</h1>
                        <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors duration-200">
                            {ROLE_LABELS[user?.role]} · {user?.email}
                        </p>
                    </div>
                </div>

                {/* Datos personales */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6 transition-colors duration-200">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5 transition-colors duration-200">{t('profile.title')}</h2>
                    <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                        <Input
                            label={t('profile.name')}
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            error={errors.name}
                            required
                        />
                        <Input
                            label={t('profile.phone')}
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            placeholder="+34 600 000 000"
                        />
                        <div className="flex items-center justify-between pt-2">
                            {saved && (
                                <p className="text-sm text-green-600 dark:text-green-400 transition-colors duration-200">{t('profile.saved')}</p>
                            )}
                            <Button
                                type="submit"
                                loading={saving}
                                className="ml-auto">
                                {t('profile.save')}
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Cambiar contraseña */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5 transition-colors duration-200">{t('profile.change_password')}</h2>
                    <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
                        <Input
                            label={t('profile.current_password')}
                            name="current_password"
                            type="password"
                            value={passForm.current_password}
                            onChange={handlePassChange}
                            error={passErrors.current_password}
                            required
                        />
                        <Input
                            label={t('profile.new_password')}
                            name="password"
                            type="password"
                            value={passForm.password}
                            onChange={handlePassChange}
                            error={passErrors.password}
                            placeholder="Mínimo 8 caracteres"
                            required
                        />
                        <Input
                            label={t('profile.confirm_password')}
                            name="password_confirmation"
                            type="password"
                            value={passForm.password_confirmation}
                            onChange={handlePassChange}
                            error={passErrors.password_confirmation}
                            required
                        />
                        <div className="flex items-center justify-between pt-2">
                            {savedPass && (
                                <p className="text-sm text-green-600 dark:text-green-400 transition-colors duration-200">{t('profile.password_updated')}</p>
                            )}
                            <Button
                                type="submit"
                                loading={savingPass}
                                className="ml-auto">
                                {t('profile.change_password')}
                            </Button>
                        </div>
                    </form>
                </section>

            </div>
        </Layout>
    )
}