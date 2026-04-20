import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Магазинчик
        </Link>

        <div className="navbar-menu">
          {!user ? (
            <div className="nav-buttons">
              <Link to="/login" className="btn btn-secondary">
                Вход
              </Link>
              <Link to="/register" className="btn btn-primary">
                Регистрация
              </Link>
            </div>
          ) : (
            <div className="nav-authenticated">
              <div className="user-info">
                <span className="user-name">
                  {user.first_name} {user.last_name}
                </span>
                <span className="user-role">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary">
                Выход
              </button>
              {user.role === 'admin' && (
                <Link to="/users" className="btn btn-primary">
                  Пользователи
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
