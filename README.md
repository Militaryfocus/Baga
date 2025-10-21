# Mobile Legends Fan Community

Полноценное фан-сообщество для игры Mobile Legends с разделением на стабильную и продакшен версии. Все файлы полностью рабочие без заглушек, наполнены реальным кодом и готовы к немедленному запуску.

## 🚀 Особенности

### Полная реализация без заглушек:
- ✅ **База данных** с миграциями и seed данными реальных героев Mobile Legends
- ✅ **Аутентификация** с JWT токенами и bcrypt
- ✅ **API endpoints** для всех функций сообщества
- ✅ **React компоненты** с реальной логикой и стилями
- ✅ **Конфигурационные файлы** настроены и рабочие

### Функциональность:
- 👥 **Система пользователей** с ролями (user, moderator, admin)
- 📝 **Система постов** с CRUD операциями, лайками, комментариями
- 🦸 **База героев** с реальными данными Mobile Legends
- 🛡️ **Модерация** контента с интерфейсом
- 🔍 **Поиск** по постам и героям
- 📊 **Статистика** сообщества
- 🎨 **Современный UI** с Tailwind CSS

## 🛠 Технологический стек

### Backend:
- **Node.js** + **Express.js** + **TypeScript**
- **Prisma ORM** с PostgreSQL
- **Redis** для кэширования
- **JWT** аутентификация
- **Swagger** документация API
- **Docker** контейнеризация

### Frontend:
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** для стилизации
- **Redux Toolkit** для state management
- **React Router** для навигации
- **React Hook Form** для форм
- **Framer Motion** для анимаций

### Инфраструктура:
- **Docker** + **Docker Compose**
- **Nginx** reverse proxy
- **PostgreSQL** база данных
- **Redis** кэш

## 🚀 Быстрый старт

### Для VDS (Production):
```bash
# Автоматическая установка
sudo ./install-vds.sh

# Обновление
sudo ./update-vds.sh
```

### Для разработки (Development):

#### 1. Клонирование и настройка
```bash
git clone <repository-url>
cd mobile-legends-fan-community
```

#### 2. Настройка переменных окружения
```bash
# Скопируйте файлы окружения
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### 3. Запуск в режиме разработки
```bash
# Запуск всех сервисов
docker-compose up --build

# Или запуск отдельных сервисов
npm run dev
```

#### 4. Инициализация базы данных
```bash
# Миграции
npm run db:migrate

# Заполнение данными
npm run db:seed
```

#### 5. Доступ к приложению
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api-docs
- **Database**: localhost:5432

> 📖 **Подробные инструкции**: См. [INSTALL_VDS.md](INSTALL_VDS.md) для установки на VDS или [QUICK_COMMANDS.md](QUICK_COMMANDS.md) для быстрых команд

## 📋 Тестовые пользователи

После запуска seed данных доступны:

- **Admin**: admin@mobilelegends.com / admin123
- **User**: test@mobilelegends.com / admin123

## 🏗 Структура проекта

```
mobile-legends-fan-community/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/     # Контроллеры
│   │   ├── services/        # Бизнес-логика
│   │   ├── middleware/      # Middleware
│   │   ├── routes/          # Маршруты
│   │   ├── types/           # TypeScript типы
│   │   └── utils/           # Утилиты
│   ├── prisma/              # Prisma схема и миграции
│   └── Dockerfile           # Docker конфигурация
├── frontend/                # React приложение
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── pages/           # Страницы
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Redux store
│   │   ├── services/        # API сервисы
│   │   └── utils/           # Утилиты
│   └── Dockerfile           # Docker конфигурация
├── nginx/                   # Nginx конфигурация
├── docker-compose.yml       # Docker Compose для разработки
├── docker-compose.prod.yml  # Docker Compose для продакшена
└── README.md               # Документация
```

## 🎮 Герои Mobile Legends

В базе данных уже загружены реальные герои:
- **Layla** (Marksman) - Легкий
- **Miya** (Marksman) - Средний
- **Alucard** (Fighter) - Сложный
- **Eudora** (Mage) - Средний
- **Tigreal** (Tank) - Средний
- **Saber** (Assassin) - Очень сложный
- **Rafaela** (Support) - Легкий
- **Franco** (Tank) - Сложный
- **Balmond** (Fighter) - Средний
- **Nana** (Support) - Сложный

Каждый герой включает:
- Полные характеристики
- Способности с описанием
- Роли и теги
- Сложность (1-5 звезд)

## 🔧 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Профиль пользователя
- `PUT /api/auth/profile` - Обновление профиля
- `PUT /api/auth/change-password` - Смена пароля
- `POST /api/auth/logout` - Выход

### Посты
- `GET /api/posts` - Список постов
- `GET /api/posts/:id` - Детали поста
- `POST /api/posts` - Создание поста
- `PUT /api/posts/:id` - Обновление поста
- `DELETE /api/posts/:id` - Удаление поста
- `POST /api/posts/:id/like` - Лайк поста
- `GET /api/posts/trending` - Популярные посты

### Герои
- `GET /api/heroes` - Список героев
- `GET /api/heroes/:id` - Детали героя
- `GET /api/heroes/slug/:slug` - Герой по slug
- `GET /api/heroes/search` - Поиск героев
- `GET /api/heroes/roles` - Роли героев
- `GET /api/heroes/difficulties` - Сложности
- `GET /api/heroes/popular` - Популярные герои

## 🐳 Docker команды

### Быстрые команды
```bash
# Установка на VDS
sudo ./install-vds.sh

# Обновление приложения
sudo ./update-vds.sh
```

### Разработка
```bash
# Запуск всех сервисов
docker-compose up --build

# Запуск в фоне
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Продакшен
```bash
# Запуск продакшен версии
docker-compose -f docker-compose.prod.yml up -d --build

# Обновление без остановки
docker-compose -f docker-compose.prod.yml up -d --build --no-deps backend frontend

# Остановка
docker-compose -f docker-compose.prod.yml down
```

> 💡 **Больше команд**: См. [QUICK_COMMANDS.md](QUICK_COMMANDS.md)

## 🗄 База данных

### Миграции
```bash
# Создание миграции
cd backend && npx prisma migrate dev --name migration_name

# Применение миграций
cd backend && npx prisma migrate deploy

# Сброс базы данных
cd backend && npx prisma migrate reset
```

### Seed данные
```bash
# Заполнение данными
cd backend && npx prisma db seed

# Просмотр базы данных
cd backend && npx prisma studio
```

## 🔒 Безопасность

- **JWT токены** для аутентификации
- **bcrypt** для хеширования паролей
- **Rate limiting** для защиты от атак
- **CORS** настройки
- **Helmet** для заголовков безопасности
- **Валидация** данных на всех уровнях

## 📱 Адаптивность

Приложение полностью адаптивно и работает на:
- 📱 Мобильных устройствах
- 📱 Планшетах
- 💻 Десктопах
- 🖥 Больших экранах

## 🎨 UI/UX

- **Современный дизайн** с Tailwind CSS
- **Темная/светлая тема**
- **Анимации** с Framer Motion
- **Интуитивная навигация**
- **Быстрая загрузка**
- **Оптимизированные изображения**

## 🚀 Деплой на VDS

### Автоматическая установка
```bash
# 1. Скачайте скрипт установки
wget https://your-repo-url/install-vds.sh
chmod +x install-vds.sh

# 2. Запустите установку
sudo ./install-vds.sh

# 3. Следуйте инструкциям на экране
```

### Обновление на VDS
```bash
cd /opt/mobile-legends-community
sudo ./update-vds.sh
```

### Ручная установка
См. полное руководство: [INSTALL_VDS.md](INSTALL_VDS.md)

### Staging (локально)
```bash
docker-compose up --build
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для фичи (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [Issues](../../issues)
2. Создайте новый Issue
3. Опишите проблему подробно

## 🎯 Roadmap

- [ ] Система уведомлений в реальном времени
- [ ] Чат между пользователями
- [ ] Турниры и соревнования
- [ ] Мобильное приложение
- [ ] Интеграция с Twitch/YouTube
- [ ] Система достижений
- [ ] Рейтинговая система

---

**Создано с ❤️ для сообщества Mobile Legends**