import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import GuestRoute from './components/ui/GuestRoute'
import Home           from './pages/Home'
import NotFound       from './pages/NotFound'
import Login          from './pages/auth/Login'
import Register       from './pages/auth/Register'
import PropertyList   from './pages/properties/PropertyList'
import PropertyDetail from './pages/properties/PropertyDetail'
import PropertyForm   from './pages/properties/PropertyForm'
import Profile        from './pages/user/Profile'
import Favorites      from './pages/user/Favorites'
import AdminDashboard      from './pages/admin/AdminDashboard'
import AdminPropertyReview from './pages/admin/AdminPropertyReview'
import MyProperties  from './pages/user/MyProperties'
import Notifications from './pages/user/Notifications'
import Dashboard from './pages/user/Dashboard'
import PropertyPhotos from './pages/properties/PropertyPhotos'
import Messages from './pages/user/Messages'

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Públicas */}
                    <Route path="/"                    element={<Home />} />
                    <Route path="/login" element={
                        <GuestRoute><Login /></GuestRoute>
                    }/>
                    <Route path="/register" element={
                        <GuestRoute><Register /></GuestRoute>
                    }/>
                    <Route path="/properties"          element={<PropertyList />} />
                    <Route path="/properties/:id"      element={<PropertyDetail />} />

                    {/* Protegidas */}
                    <Route path="/properties/create" element={
                        <ProtectedRoute roles={['seller', 'admin']}>
                            <PropertyForm />
                        </ProtectedRoute>
                    }/>
                    <Route path="/properties/:id/edit" element={
                        <ProtectedRoute roles={['seller', 'admin']}>
                            <PropertyForm />
                        </ProtectedRoute>
                    }/>
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }/>
                    <Route path="/favorites" element={
                        <ProtectedRoute>
                            <Favorites />
                        </ProtectedRoute>
                    }/>
                    <Route path="/messages" element={
                        <ProtectedRoute>
                            <Messages />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin" element={
                        <ProtectedRoute roles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin/properties/:id" element={
                        <ProtectedRoute roles={['admin']}>
                            <AdminPropertyReview />
                        </ProtectedRoute>
                    }/>

                    <Route path="/my-properties" element={
                        <ProtectedRoute roles={['seller', 'admin']}>
                            <MyProperties />
                        </ProtectedRoute>
                    }/>
                    <Route path="/notifications" element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }/>

                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }/>

                    <Route path="/properties/:id/photos" element={
                        <ProtectedRoute roles={['seller', 'admin']}>
                            <PropertyPhotos />
                        </ProtectedRoute>
                    }/>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}