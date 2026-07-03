// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const MainSite = () => (
  <div>
    <Navbar />
    <Hero />
    <Skills />
    <Projects />
    {/* <Experience /> */}
    <Contact />
    <Footer />
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <div className="ambient-bg" aria-hidden="true">
        <span className="ambient-blob ambient-blob-1" />
        <span className="ambient-blob ambient-blob-2" />
      </div>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;