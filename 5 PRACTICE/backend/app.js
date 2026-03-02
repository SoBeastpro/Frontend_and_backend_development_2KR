const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");

// Подключаем Swagger
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let products = [
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

// ----------------------
// SWAGGER
// ----------------------
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API интернет-магазина",
      version: "1.0.0",
      description: "CRUD API для управления товарами",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Локальный сервер",
      },
    ],
  },
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *         name:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория
 *         desc:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: number
 *           description: Цена
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *         rating:
 *           type: number
 *           description: Рейтинг товара
 *       example:
 *         id: "abc123"
 *         name: "Ноутбук ASUS"
 *         category: "Электроника"
 *         desc: "Мощный ноутбук для работы и игр"
 *         price: 75000
 *         stock: 5
 *         rating: 4.8
 */

// ----------------------
// CRUD
// ----------------------

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар создан
 */
app.post("/api/products", (req, res) => {
  const newProduct = {
    id: nanoid(6),
    ...req.body,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Товар обновлён
 *       404:
 *         description: Товар не найден
 */
app.patch("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  Object.assign(product, req.body);
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удалён
 *       404:
 *         description: Товар не найден
 */
app.delete("/api/products/:id", (req, res) => {
  const exists = products.some(p => p.id == req.params.id);
  if (!exists) return res.status(404).json({ error: "Product not found" });

  products = products.filter(p => p.id != req.params.id);
  res.status(204).send();
});

// ----------------------
// START
// ----------------------
app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});
