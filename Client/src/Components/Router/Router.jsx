import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../Layout/Layout';
import Home from '../../pages/Home/Home';
import Login from '../../pages/Login/Login';
import Register from '../../pages/Register/Register';
import QuestionDetail from '../../pages/QuestionDetail/QuestionDetail';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import AskQuestion from '../../pages/AskQuestion/AskQuestion';
import Settings from '../Settings/Settings';
import HowItWorks from '../../pages/HowItWorks/HowItWorks';
import MyQuestions from '../../pages/MyQuestions/MyQuestions';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        
        {/* PUBLIC ROUTES: Anyone can browse these without logging in */}
        <Route index element={<Home />} />
        <Route path="/question/:id" element={<QuestionDetail />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ACTIONS/PAGES PROTECTED: User MUST be logged in to enter these */}
        <Route element={<ProtectedRoute />}>
          <Route path="/ask" element={<AskQuestion />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-questions" element={<MyQuestions />} />
        </Route>

      </Route>
      
      {/* Fallback for 404 - Cleaned up format */}
      <Route path="*" element={
        <div style={{ padding: '60px text-align center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: '#1a202c', marginBottom: '8px' }}>404 - Page Not Found</h2>
          <p style={{ color: '#718096' }}>The page you are looking for does not exist or has been moved.</p>
        </div>
      } />
    </Routes>
  );
}

export default Router;