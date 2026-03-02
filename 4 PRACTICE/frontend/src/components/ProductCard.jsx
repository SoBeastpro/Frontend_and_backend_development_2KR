import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product">
      <span className="product__category">{product.category}</span>
      <h3 className="product__title">{product.name}</h3>
      <p className="product__desc">{product.desc}</p>
      
      <div className="product__footer">
        <span className="product__price">{product.price.toLocaleString()} ₽</span>
        <div className="product__meta">
          <span>⭐ {product.rating}</span>
          <span>На складе: {product.stock} шт.</span>
        </div>
        <button className="btn">Купить</button>
      </div>
    </div>
  );
};

export default ProductCard;