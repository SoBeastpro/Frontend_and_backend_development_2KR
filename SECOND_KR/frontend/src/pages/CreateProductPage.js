import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import './ProductForm.css';

const CreateProductPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/products', formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании товара');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Link to="/" className="back-link">
        ← Назад к товарам
      </Link>

      <div className="form-container">
        <h1>Создать новый товар</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="title">Название товара:</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Введите название товара"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Категория:</label>
            <input
              id="category"
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="Например: Электроника, Одежда"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Подробное описание товара"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Цена (₽):</label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Создание...' : 'Создать товар'}
            </button>
            <button type="reset" className="btn btn-secondary">
              Очистить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;
