import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { useAuth } from '../utils/AuthContext';
import './Products.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products');
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Ошибка при загрузке товаров');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await apiClient.delete(`/products/${id}`);
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        setError('Ошибка при удалении товара');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="container">Загрузка товаров...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Товары</h1>
        {user && (user.role === 'seller' || user.role === 'admin') && (
          <Link to="/products/new" className="btn btn-primary">
            Добавить товар
          </Link>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <p>Товары не найдены</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3>{product.title}</h3>
                <span className="product-category">{product.category}</span>
              </div>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <div className="product-price">{product.price}₽</div>
                <div className="product-actions">
                  <Link to={`/products/${product.id}`} className="btn btn-secondary-blue">
                    Подробнее
                  </Link>
                  {user && (user.role === 'seller' || user.role === 'admin') && (
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="btn btn-secondary"
                    >
                    Редактировать
                    </Link>
                  )}
                  {user && user.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-danger"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
