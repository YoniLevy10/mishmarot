import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthGate } from './AuthGate'
import { AppLayout } from './AppLayout'
import { HomePage } from '../pages/HomePage'
import { SummaryPage } from '../pages/SummaryPage'
import { SettingsPage } from '../pages/SettingsPage'
import { LoginPage } from '../pages/LoginPage'
import { DevJournalPage } from '../pages/DevJournalPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGate />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/dev-journal" element={<DevJournalPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

