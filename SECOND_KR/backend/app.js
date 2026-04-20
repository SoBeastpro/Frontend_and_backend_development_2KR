const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Секреты для JWT
const ACCESS_SECRET = "access_secret_key_12345";
const REFRESH_SECRET = "refresh_secret_key_67890";

// Время жизни токенов
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// Разрешить CORS для фронтенда
app.use(cors());
app.use(express.json());

// Хранилище данных (в памяти)
const users = [];
const products = [
  {
    id: "prod1",
    title: "iPhone 15 Pro",
    category: "Смартфоны",
    description: "Процессор A17 Pro и титановый корпус.",
    price: 120000,
    created_by: "system",
  },
  {
    id: "prod2",
    title: "MacBook Air M2",
    category: "Ноутбуки",
    description: "Тонкий и мощный ноутбук для работы.",
    price: 110000,
    created_by: "system",
  },
  {
    id: "prod3",
    title: "Sony WH-1000XM5",
    category: "Аудио",
    description: "Лучшее шумоподавление в своем классе.",
    price: 35000,
    created_by: "system",
  },
  {
    id: "prod4",
    title: "Samsung Odyssey G7",
    category: "Мониторы",
    description: "Изогнутый игровой монитор 240Гц.",
    price: 55000,
    created_by: "system",
  },
  {
    id: "prod5",
    title: "iPad Pro 12.9",
    category: "Планшеты",
    description: "Дисплей Liquid Retina XDR и чип M2.",
    price: 130000,
    created_by: "system",
  },
  {
    id: "prod6",
    title: "PlayStation 5",
    category: "Игры",
    description: "Игровая консоль нового поколения.",
    price: 65000,
    created_by: "system",
  },
  {
    id: "prod7",
    title: "Keychron K2",
    category: "Периферия",
    description: "Механическая беспроводная клавиатура.",
    price: 9000,
    created_by: "system",
  },
  {
    id: "prod8",
    title: "GoPro HERO 12",
    category: "Фото и видео",
    description: "Экшн-камера с улучшенной стабилизацией.",
    price: 45000,
    created_by: "system",
  },
  {
    id: "prod9",
    title: "Apple Watch Series 9",
    category: "Смарт-часы",
    description: "Ваш идеальный спутник для здоровья.",
    price: 42000,
    created_by: "system",
  },
  {
    id: "prod10",
    title: "Xiaomi Mi Box S 2nd Gen",
    category: "ТВ-приставки",
    description: "Медиаплеер с поддержкой 4K Ultra HD.",
    price: 6000,
    created_by: "system",
  },
];
const refreshTokens = new Set();

// ==================== УТИЛИТЫ ====================

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
    ACCESS_SECRET,
    {
      expiresIn: ACCESS_EXPIRES_IN,
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    REFRESH_SECRET,
    {
      expiresIn: REFRESH_EXPIRES_IN,
    }
  );
}

// ==================== MIDDLEWARE ====================

// Логирование запросов
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(
      `[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`
    );
    if (
      req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "PATCH"
    ) {
      console.log("Body:", JSON.stringify(req.body, null, 2));
    }
  });
  next();
});

// Middleware для проверки аутентификации
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Missing or invalid Authorization header",
    });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

// Middleware для проверки ролей
function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Доступ запрещен: недостаточно прав",
      });
    }
    next();
  };
}

// ==================== МАРШРУТЫ АУТЕНТИФИКАЦИИ ====================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 */
app.post("/api/auth/register", async (req, res) => {
  const { email, first_name, last_name, password, role } = req.body;

  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({
      error: "Заполните все поля",
    });
  }

  const exists = users.some((u) => u.email === email);
  if (exists) {
    return res.status(409).json({
      error: "Пользователь с таким email уже существует",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: nanoid(),
    email,
    first_name,
    last_name,
    passwordHash,
    role: role || "user",
    is_blocked: false,
  };

  users.push(newUser);

  res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    first_name: newUser.first_name,
    last_name: newUser.last_name,
    role: newUser.role,
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Введите email и пароль",
    });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({
      error: "Неверные учетные данные",
    });
  }

  if (user.is_blocked) {
    return res.status(403).json({
      error: "Этот аккаунт заблокирован. Обратитесь к администратору.",
    });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  refreshTokens.add(refreshToken);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
  });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление токенов
 */
app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: "refreshToken is required",
    });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({
      error: "Invalid refresh token",
    });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);

    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Ротация токенов
    refreshTokens.delete(refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.add(newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired refresh token",
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.user.sub);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  });
});

// ==================== МАРШРУТЫ ТОВАРОВ ====================

/**
 * Получить список всех товаров
 */
app.get("/api/products", (req, res) => {
  res.json(products);
});

/**
 * Получить товар по ID
 */
app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  res.json(product);
});

/**
 * Создать новый товар (доступно продавцу)
 */
app.post(
  "/api/products",
  authMiddleware,
  roleMiddleware(["seller", "admin"]),
  (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || !price) {
      return res.status(400).json({
        error: "title, category, description, and price are required",
      });
    }

    const newProduct = {
      id: nanoid(),
      title,
      category,
      description,
      price,
      created_by: req.user.sub,
    };

    products.push(newProduct);

    res.status(201).json(newProduct);
  }
);

/**
 * Обновить товар (доступно продавцу)
 */
app.put(
  "/api/products/:id",
  authMiddleware,
  roleMiddleware(["seller", "admin"]),
  (req, res) => {
    const product = products.find((p) => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const { title, category, description, price } = req.body;

    if (title) product.title = title;
    if (category) product.category = category;
    if (description) product.description = description;
    if (price) product.price = price;

    res.json(product);
  }
);

/**
 * Удалить товар (доступно администратору)
 */
app.delete(
  "/api/products/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const deletedProduct = products.splice(index, 1);

    res.json({
      message: "Product deleted successfully",
      product: deletedProduct[0],
    });
  }
);

// ==================== МАРШРУТЫ ПОЛЬЗОВАТЕЛЕЙ ====================

/**
 * Получить список всех пользователей (только админ)
 */
app.get(
  "/api/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    const usersList = users.map((u) => ({
      id: u.id,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      is_blocked: u.is_blocked,
    }));

    res.json(usersList);
  }
);

/**
 * Получить пользователя по ID (только админ)
 */
app.get(
  "/api/users/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_blocked: user.is_blocked,
    });
  }
);

/**
 * Обновить информацию пользователя (только админ)
 */
app.put(
  "/api/users/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const { first_name, last_name, role, password } = req.body;

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (role) user.role = role;
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_blocked: user.is_blocked,
    });
  }
);

/**
 * Заблокировать пользователя (только админ)
 */
app.delete(
  "/api/users/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    user.is_blocked = !user.is_blocked;

    res.json({
      message: user.is_blocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      user: {
        id: user.id,
        email: user.email,
        is_blocked: user.is_blocked,
      },
    });
  }
);

// ==================== ЗАПУСК СЕРВЕРА ====================

app.listen(PORT, () => {
  console.log(`✓ Сервер запущен на http://localhost:${PORT}`);
  console.log(`✓ Access secret: ${ACCESS_SECRET}`);
  console.log(`✓ Refresh secret: ${REFRESH_SECRET}`);
});
