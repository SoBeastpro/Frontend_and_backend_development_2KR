const express = require('express');
const app = express();
const port = 3000;

// Middleware для работы с JSON в теле запроса [cite: 60, 105]
app.use(express.json());

// Исходные данные (список товаров) [cite: 145, 146]
let products = [
  { id: 1, name: 'Смартфон', price: 50000 },
  { id: 2, name: 'Ноутбук', price: 100000 },
  { id: 3, name: 'Наушники', price: 15000 }
];

app.get('/', (req,res) =>{
    res.send("Главная страница")
})

// 1. Получение всех товаров (Read) [cite: 121, 145]
app.get('/products', (req, res) => {
  res.json(products);
});

// 2. Получение товара по id (Read) [cite: 124, 145]
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(444).send('Товар не найден');
  }
});

// 3. Добавление нового товара (Create) [cite: 111, 145]
app.post('/products', (req, res) => {
  const { name, price } = req.body; // Извлекаем данные из тела запроса [cite: 112]
  const newProduct = {
    id: Date.now(), // Генерация уникального id [cite: 115]
    name,
    price
  };
  products.push(newProduct);
  res.status(201).json(newProduct); // Возвращаем созданный объект [cite: 119]
});

// 4. Редактирование товара по id (Update) [cite: 127, 145]
app.patch('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  const { name, price } = req.body;

  if (product) {
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    res.json(product);
  } else {
    res.status(404).send('Товар для обновления не найден');
  }
});

// 5. Удаление товара по id (Delete) [cite: 136, 145]
app.delete('/products/:id', (req, res) => {
  const initialLength = products.length;
  products = products.filter(p => p.id != req.params.id);
  
  if (products.length < initialLength) {
    res.send('Товар успешно удален');
  } else {
    res.status(404).send('Товар не найден');
  }
});

// Запуск сервера [cite: 140]
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});