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

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
           <Route index element={<Home />} />
           {/* This line is CRITICAL. It maps /question/1 to the detail page */}
           <Route path="/question/:id" element={<QuestionDetail />} />
           <Route path="/ask" element={<AskQuestion />} />
           <Route path="/settings" element={<Settings />} />
           
        </Route>

        {/* Public Routes */}
        <Route path="/how-it-works" element={<HowItWorks/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      {/* Fallback for 404 */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default Router;