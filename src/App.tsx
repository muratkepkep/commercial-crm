import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { BottomNav } from "@/components/common/BottomNav"
import { FloatingCalculator } from "@/components/common/FloatingCalculator"
import ClientsPage from "@/pages/ClientsPage"
import PropertiesPage from "@/pages/PropertiesPage"
import PropertyDetailPage from "@/pages/PropertyDetailPage"
import AddPage from "@/pages/AddPage"
import TodosPage from "@/pages/TodosPage"
import NotesPage from "@/pages/NotesPage"
import PlansPage from "@/pages/PlansPage"
import ProfilePage from "@/pages/ProfilePage"
import LoginPage from "@/pages/LoginPage"
import { AuthProvider } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background font-sans antialiased">
          <div className="container mx-auto max-w-md p-4">
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route path="/" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
              <Route path="/properties" element={<ProtectedRoute><PropertiesPage /></ProtectedRoute>} />
              <Route path="/properties/:id" element={<ProtectedRoute><PropertyDetailPage /></ProtectedRoute>} />
              <Route path="/add" element={<ProtectedRoute><AddPage /></ProtectedRoute>} />
              <Route path="/todos" element={<ProtectedRoute><TodosPage /></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
              <Route path="/plans" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Redirect unknown routes to properties if logged in, or login if not */}
              <Route path="*" element={<Navigate to="/properties" replace />} />
            </Routes>
          </div>
          <BottomNav />
          <FloatingCalculator />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
