import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthGuard } from './components/layout/AuthGuard'
import { Header } from './components/layout/Header'
import { Nav } from './components/layout/Nav'
import { Footer } from './components/layout/Footer'
import { LoginPage } from './pages/Login/LoginPage'
import { HomePage } from './pages/Home/HomePage'
import { BankAccountPage } from './pages/BankAccount/BankAccountPage'
import { CasesPage } from './pages/Cases/CasesPage'
import { RecipientsPage } from './pages/Recipients/RecipientsPage'
import { PaymentsPage } from './pages/Payments/PaymentsPage'
import { MessagesPage } from './pages/Messages/MessagesPage'
import { ProfilePage } from './pages/Profile/ProfilePage'
import { SettingsPage } from './pages/Settings/SettingsPage'
import { NotFoundPage } from './pages/NotFound/NotFoundPage'

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <Nav />
      {children}
      <Footer />
    </AuthGuard>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthenticatedLayout>
              <HomePage />
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/bank-accounts"
          element={
            <AuthenticatedLayout>
              <BankAccountPage />
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/cases"
          element={
            <AuthenticatedLayout>
              <CasesPage />
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/recipients"
          element={
            <AuthenticatedLayout>
              <RecipientsPage />
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/payments"
          element={
            <AuthenticatedLayout>
              <PaymentsPage />
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/messages"
          element={
            <AuthenticatedLayout>
              <MessagesPage />
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthenticatedLayout>
              <ProfilePage />
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthenticatedLayout>
              <SettingsPage />
            </AuthenticatedLayout>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
