import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Index from "./pages/Index";
import SOSPage from "./pages/SOSPage";
import ContactsPage from "./pages/ContactsPage";
import SafetyPage from "./pages/SafetyPage";
import ZonesPage from "./pages/ZonesPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import IncidentReportPage from "./pages/IncidentReportPage";
import IncidentFeedPage from "./pages/IncidentFeedPage";
import CameraScanPage from "./pages/CameraScanPage";
import AISafetyChatPage from "./pages/AISafetyChatPage";
import ProfilePage from "./pages/ProfilePage";

// Extend window object for TypeScript
declare global {
  interface Window {
    chtlConfig?: { chatbotId: string };
    Chatling?: {
      sendMessage: (message: string) => void;
    };
  }
}

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
};

// App routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<Index />} />
      <Route path="/sos" element={<SOSPage />} />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <ContactsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/safety" element={<SafetyPage />} />
      <Route path="/zones" element={<ZonesPage />} />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/report-incident" element={<IncidentReportPage />} />
      <Route path="/incident-feed" element={<IncidentFeedPage />} />
      <Route path="/camera-scan" element={<CameraScanPage />} />
      <Route path="/ai-assistant" element={<AISafetyChatPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App
const App = () => {
  useEffect(() => {
    if (document.getElementById("chatling-embed-script")) return;

    // Setup Chatling config
    window.chtlConfig = {
      chatbotId: "3843596487",
    };

    // Inject Chatling script
    const script = document.createElement("script");
    script.src = "https://chatling.ai/js/embed.js";
    script.async = true;
    script.setAttribute("data-id", "3843596487");
    script.id = "chatling-embed-script";
    document.body.appendChild(script);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
