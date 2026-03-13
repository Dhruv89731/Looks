import { useState, useEffect } from 'react';
import './index.css';
import ConversationDashboard from './pages/ConversationDashboard';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists on mount
    const token = localStorage.getItem('looks_auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem('looks_auth_token', data.token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('looks_auth_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <ConversationDashboard onLogout={handleLogout} />;
}

export default App;
