import React, { useState } from 'react'
import AuthPage from './component/register/AuthPage'
import Home from './component/main/Home'
import './App.css'

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      {!user ? (
        <AuthPage onLoginSuccess={(userData) => handleLoginSuccess(userData)} />
      ) : (
        <Home user={user} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App