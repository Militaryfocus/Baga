# Аутентификация в Baga

## Обзор

Система аутентификации в Baga использует JWT (JSON Web Tokens) с механизмом refresh токенов для обеспечения безопасного и удобного доступа пользователей.

## Основные компоненты

### Токены

1. **Access Token**
   - Короткое время жизни (15 минут)
   - Используется для авторизации API запросов
   - Передается в заголовке `Authorization: Bearer <token>`

2. **Refresh Token**
   - Длительное время жизни (7 дней)
   - Используется для получения нового access token
   - Хранится в безопасных http-only cookies

### Сессии

Каждый вход пользователя создает новую сессию, которая содержит:
- ID пользователя
- Refresh token
- Дата создания
- Дата последнего использования
- IP адрес
- User agent

## Процесс аутентификации

### 1. Регистрация
```typescript
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "username"
}
```

### 2. Вход
```typescript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Возвращает:
- Access token в теле ответа
- Refresh token в http-only cookie
- Информацию о пользователе

### 3. Обновление токена

При истечении access token:
```typescript
POST /api/auth/refresh
```
- Использует refresh token из cookies
- Возвращает новый access token
- Обновляет refresh token

### 4. Выход
```typescript
POST /api/auth/logout
```
- Инвалидирует текущую сессию
- Удаляет refresh token cookie

## Безопасность

1. **Хранение паролей**
   - Пароли хешируются с использованием Argon2
   - Используется уникальная соль для каждого пароля

2. **Защита токенов**
   - Access tokens не хранятся на сервере
   - Refresh tokens хранятся в зашифрованном виде
   - Используются secure и http-only cookies

3. **Сессии**
   - Каждый refresh token привязан к конкретной сессии
   - Сессии можно просматривать и отзывать
   - Автоматическая очистка неактивных сессий

## Двухфакторная аутентификация (2FA)

1. **Включение 2FA**
```typescript
POST /api/auth/2fa/enable
```
- Генерирует QR код для приложения аутентификатора
- Создает резервные коды восстановления

2. **Подтверждение 2FA**
```typescript
POST /api/auth/2fa/verify
{
  "code": "123456"
}
```

## Интеграция с WebSocket

WebSocket соединения также требуют аутентификации:
- Access token передается при установке соединения
- Автоматическое переподключение при истечении токена

## Обработка ошибок

- `401 Unauthorized`: Невалидный или истекший access token
- `403 Forbidden`: Недостаточно прав для действия
- `400 Bad Request`: Некорректные данные в запросе

## Примеры использования

### Frontend (React + TypeScript)

```typescript
// Авторизация запроса
api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка истекшего токена
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        await refreshTokens();
        return api(error.config);
      } catch {
        // Перенаправление на страницу входа
      }
    }
    return Promise.reject(error);
  }
);
```

### Backend (Node.js + TypeScript)

```typescript
// Middleware проверки токена
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const payload = await verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
};
```