const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const products = [
  { id: 1, name: "iPhone 15 Pro", category: "Смартфоны", desc: "Процессор A17 Pro и титановый корпус.", price: 120000, stock: 15, rating: 4.9 },
  { id: 2, name: "MacBook Air M2", category: "Ноутбуки", desc: "Тонкий и мощный ноутбук для работы.", price: 110000, stock: 8, rating: 4.8 },
  { id: 3, name: "Sony WH-1000XM5", category: "Аудио", desc: "Лучшее шумоподавление в своем классе.", price: 35000, stock: 12, rating: 4.7 },
  { id: 4, name: "Samsung Odyssey G7", category: "Мониторы", desc: "Изогнутый игровой монитор 240Гц.", price: 55000, stock: 5, rating: 4.6 },
  { id: 5, name: "iPad Pro 12.9", category: "Планшеты", desc: "Дисплей Liquid Retina XDR и чип M2.", price: 130000, stock: 7, rating: 4.9 },
  { id: 6, name: "PlayStation 5", category: "Игры", desc: "Игровая консоль нового поколения.", price: 65000, stock: 20, rating: 5.0 },
  { id: 7, name: "Keychron K2", category: "Периферия", desc: "Механическая беспроводная клавиатура.", price: 9000, stock: 25, rating: 4.5 },
  { id: 8, name: "GoPro HERO 12", category: "Фото и видео", desc: "Экшн-камера с улучшенной стабилизацией.", price: 45000, stock: 10, rating: 4.7 },
  { id: 9, name: "Apple Watch Series 9", category: "Смарт-часы", desc: "Ваш идеальный спутник для здоровья.", price: 42000, stock: 18, rating: 4.8 },
  { id: 10, name: "Xiaomi Mi Box S 2nd Gen", category: "ТВ-приставки", desc: "Медиаплеер с поддержкой 4K Ultra HD.", price: 6000, stock: 30, rating: 4.4 }
];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.listen(port, () => {
  console.log(`Сервер электроники запущен на http://localhost:${port}`);
});