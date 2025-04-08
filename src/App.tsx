
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';
import SOSPage from './pages/SOSPage';
import ZonesPage from './pages/ZonesPage';
import SafetyPage from './pages/SafetyPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import IncidentFeedPage from './pages/IncidentFeedPage';
import IncidentReportPage from './pages/IncidentReportPage';
import CameraScanPage from './pages/CameraScanPage';
import AISafetyChatPage from './pages/AISafetyChatPage';
import ContactsPage from './pages/ContactsPage';
import EmergencyContactsPage from './pages/EmergencyContactsPage';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css';

const queryClient = new QueryClient();

export default function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Index />,
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/auth',
      element: <AuthPage />,
    },
    {
      path: '/sos',
      element: <SOSPage />,
    },
    {
      path: '/zones',
      element: <ZonesPage />,
    },
    {
      path: '/safety',
      element: <SafetyPage />,
    },
    {
      path: '/profile',
      element: <ProfilePage />,
    },
    {
      path: '/settings',
      element: <SettingsPage />,
    },
    {
      path: '/feed',
      element: <IncidentFeedPage />,
    },
    {
      path: '/report',
      element: <IncidentReportPage />,
    },
    {
      path: '/scan',
      element: <CameraScanPage />,
    },
    {
      path: '/chat',
      element: <AISafetyChatPage />,
    },
    {
      path: '/contacts',
      element: <ContactsPage />,
    },
    {
      path: '/emergency-contacts',
      element: <EmergencyContactsPage />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
