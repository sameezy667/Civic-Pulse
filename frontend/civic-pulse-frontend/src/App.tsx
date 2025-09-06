import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { GlobalStyles, theme } from './styles/GlobalStyles';
import { AuthProvider } from './contexts/AuthContext';
import MainApp from './components/MainApp';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/AdminDashboard';
import { Helmet } from 'react-helmet';

const AppContainer = styled.div`
  font-family: 'Inter', sans-serif;
  background: 
    url('/background.png') center/cover no-repeat,
    linear-gradient(135deg, #000000 0%, #0a0a0a 30%, #1a1a1a 60%, #000000 100%);
  min-height: 100vh;
  overflow-x: hidden;
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Helmet>
          <link 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" 
            rel="stylesheet" 
          />
          <title>Civic Pulse - Smart City Issue Reporting</title>
          <meta name="description" content="Report and track urban vehicle issues in real time with Civic Pulse - your direct link to smart city infrastructure." />
        </Helmet>
        <GlobalStyles />
        <AppContainer>
          <Router>
            <Routes>
              {/* Main landing page with hero - preserves existing design */}
              <Route path="/" element={<MainApp />} />
              
              {/* Separate auth page for role selection and login */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Admin dashboard - protected route */}
              <Route path="/admin" element={<AdminDashboard onBackToMain={() => window.location.href = '/'} />} />
            </Routes>
          </Router>
        </AppContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
