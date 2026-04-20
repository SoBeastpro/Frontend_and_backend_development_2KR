import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { useAuth } from '../utils/AuthContext';
import './ProductDetail.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/products/${id}`);
      setProduct(response.data);
      setFormData(response.data);
      setError('');
    } catch (err) {
      setError('Товар не найден');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/products/${id}`, formData);
      setProduct(response.data);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Ошибка при обновлении товара');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container">Загрузка...</div>;
  }

  if (error && !product) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <Link to="/" className="btn btn-primary">
          Вернуться к товарам
        </Link>
      </div>
    );
  }

  if (!product) {
    return <div className="container">Товар не найден</div>;
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">
        ← Назад к товарам
      </Link>

      {error && <div className="error-message">{error}</div>}

      <div className="product-detail">
        <div className="product-info">
          <h1>{product.title}</h1>
          <span className="category-badge">{product.category}</span>

          <div className="product-price-large">{product.price}₽</div>

          <p className="product-description-large">{product.description}</p>

          {!isEditing ? (
            <div className="product-actions-detail">
              {user && (user.role === 'seller' || user.role === 'admin') && (
                <button onClick={() => setIsEditing(true) } className="btn btn-primary">
                Редактировать
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="btn btn-danger"
              >
                Назад
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="title">Название:</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Категория:</label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  required
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Цена (₽):</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price || 0}
                  onChange={handleChange}
                  required
                  step="0.01"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(product);
                  }}
                  className="btn btn-secondary"
                >
                  Отменить
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
