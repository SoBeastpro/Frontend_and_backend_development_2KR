import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import './UsersPage.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleEditSubmit = async (userId) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, editFormData);
      setUsers(users.map((u) => (u.id === userId ? response.data : u)));
      setEditingId(null);
      setEditFormData({});
    } catch (err) {
      setError('Ошибка при обновлении пользователя');
      console.error(err);
    }
  };

  const handleBlock = async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      setUsers(users.map((u) => (u.id === userId ? response.data.user : u)));
    } catch (err) {
      setError('Ошибка при блокировке пользователя');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container">Загрузка...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>👥 Управление пользователями</h1>
        <Link to="/" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={user.is_blocked ? 'blocked-user' : ''}
              >
                <td>{user.email}</td>
                <td>
                  {editingId === user.id ? (
                    <input
                      type="text"
                      name="first_name"
                      value={editFormData.first_name || user.first_name}
                      onChange={handleEditChange}
                      className="inline-input"
                    />
                  ) : (
                    user.first_name
                  )}
                </td>
                <td>
                  {editingId === user.id ? (
                    <input
                      type="text"
                      name="last_name"
                      value={editFormData.last_name || user.last_name}
                      onChange={handleEditChange}
                      className="inline-input"
                    />
                  ) : (
                    user.last_name
                  )}
                </td>
                <td>
                  {editingId === user.id ? (
                    <select
                      name="role"
                      value={editFormData.role || user.role}
                      onChange={handleEditChange}
                      className="inline-input"
                    >
                      <option value="user">user</option>
                      <option value="seller">seller</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    <span className="role-badge">{user.role}</span>
                  )}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      user.is_blocked ? 'blocked' : 'active'
                    }`}
                  >
                    {user.is_blocked ? '🔒 Заблокирован' : '✓ Активен'}
                  </span>
                </td>
                <td className="actions-cell">
                  {editingId === user.id ? (
                    <>
                      <button
                        onClick={() => handleEditSubmit(user.id)}
                        className="btn btn-primary btn-sm"
                      >
                        ✓ Сохранить
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn btn-secondary btn-sm"
                      >
                        ✕ Отменить
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(user.id);
                          setEditFormData(user);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        ✏️ Редактировать
                      </button>
                      <button
                        onClick={() => handleBlock(user.id)}
                        className={`btn btn-sm ${
                          user.is_blocked ? 'btn-success' : 'btn-danger'
                        }`}
                      >
                        {user.is_blocked ? '🔓 Разблокировать' : '🔒 Заблокировать'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
