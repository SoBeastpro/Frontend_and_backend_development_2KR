import React, { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import './styles/main.scss';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка запроса:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="shop-container">
      <h1>ЭлектроМаркет</h1>
      {loading ? (
        <p style={{textAlign: 'center'}}>Загрузка товаров...</p>
      ) : (
        <div className="product-grid">
          {products.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;