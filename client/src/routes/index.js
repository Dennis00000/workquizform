import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import HomeLayout from '../layouts/HomeLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ProfilePage from '../pages/ProfilePage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute';
import NotFoundPage from '../pages/NotFoundPage';
import DashboardPage from '../pages/DashboardPage';
import AboutPage from '../pages/AboutPage';
import HelpPage from '../pages/HelpPage';
import PrivacyPage from '../pages/PrivacyPage';
import TermsPage from '../pages/TermsPage';
import TemplatesPage from '../pages/TemplatesPage';
import TemplateDetailPage from '../pages/templates/TemplateDetailPage';
import SearchPage from '../pages/SearchPage';
import AdminUtilityPage from '../pages/AdminUtilityPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

// Temporary placeholder for pages that haven't been created yet
const PlaceholderPage = ({ pageName }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <h1 className="text-2xl font-bold mb-4">Page Under Construction</h1>
    <p className="text-lg mb-8">The {pageName} page is coming soon!</p>
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
      <p>This is a placeholder for the {pageName} page.</p>
    </div>
  </div>
);

const TemplateEditPage = () => <PlaceholderPage pageName="Edit Template" />;
const CreateTemplatePage = () => <PlaceholderPage pageName="Create Template" />;
const UseTemplatePage = () => <PlaceholderPage pageName="Use Template" />;
const AdminPage = () => <PlaceholderPage pageName="Admin" />;
const SubmissionDetailPage = () => <PlaceholderPage pageName="Submission Detail" />;
const SubmissionsPage = () => <PlaceholderPage pageName="Submissions" />;

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      {/* Home page with its own layout (no sidebar) */}
      <Route path="/" element={<HomeLayout />}>
        <Route index element={isAuthenticated ? <DashboardPage /> : <HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* All other pages with the main layout (includes sidebar) */}
      <Route element={<MainLayout />}>
        <Route path="search" element={<SearchPage />} />
        
        {/* Protected routes */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Templates Routes */}
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="templates/create" element={
          <ProtectedRoute>
            <CreateTemplatePage />
          </ProtectedRoute>
        } />
        <Route path="templates/:id" element={<TemplateDetailPage />} />
        <Route path="templates/:id/edit" element={
          <ProtectedRoute>
            <TemplateEditPage />
          </ProtectedRoute>
        } />
        <Route path="templates/:id/use" element={<UseTemplatePage />} />
        
        {/* Submissions Routes */}
        <Route path="submissions" element={
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        } />
        <Route path="submissions/:id" element={
          <ProtectedRoute>
            <SubmissionDetailPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Utility Page */}
        <Route path="admin-utility" element={
          <AdminRoute>
            <AdminUtilityPage />
          </AdminRoute>
        } />
        
        <Route path="admin" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 