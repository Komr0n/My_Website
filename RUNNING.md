# Запуск проекта: подробно

Этот документ описывает **правильный запуск проекта** в двух режимах:
1. С Docker (PostgreSQL в контейнере, Node.js на хосте).
2. Без Docker (PostgreSQL установлен локально).

## 1. Что нужно заранее

- Node.js 18+ (рекомендуется LTS).
- npm 9+.
- PostgreSQL 14+.
- Docker Desktop (только для Docker-варианта).

Проверка версий:

```powershell
node --version
npm --version
docker --version
```

## 2. Первый запуск (общие шаги)

Из корня проекта:

```powershell
npm install
```

Создай файл `.env` на основе `.env.example`:

```powershell
Copy-Item .env.example .env
```

Минимальный `.env`:

```env
NODE_ENV=development
PORT=3000
SESSION_SECRET=change-me-please-use-long-random-string-32+

DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_website
DB_USER=postgres
DB_PASS=postgres
DB_SSL=false
```

Важно:
- В production `SESSION_SECRET` должен быть длинным (минимум 32 символа).
- Можно использовать `DATABASE_URL` вместо отдельных `DB_*` переменных.

## 3. Вариант A: запуск с Docker (рекомендуется)

В этом режиме Docker поднимает только PostgreSQL, приложение Node.js запускается обычной командой на твоей машине.

### 3.1 Поднять БД

```powershell
npm run db:up
```

Проверить логи БД:

```powershell
npm run db:logs
```

### 3.2 Применить миграции

```powershell
npm run migrate:blog
```

### 3.3 Запустить приложение

```powershell
npm start
```

Для разработки с авто-перезапуском:

```powershell
npm run dev
```

### 3.4 Открыть в браузере

- Сайт: `http://localhost:3000`
- Админка (вход): `http://localhost:3000/auth/admin/login`

## 4. Вариант B: запуск без Docker (локальный PostgreSQL)

### 4.1 Создать базу

```powershell
createdb -U postgres my_website
```

Если `createdb` недоступна в PATH, создай БД через pgAdmin или psql:

```sql
CREATE DATABASE my_website;
```

### 4.2 Настроить `.env`

Проверь правильные значения:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_website
DB_USER=postgres
DB_PASS=твой_пароль
```

### 4.3 Миграции и запуск

```powershell
npm run migrate:blog
npm start
```

## 5. Создание первого администратора

Сейчас проект **не создает admin по умолчанию** автоматически.

Если база новая, создай первого администратора командой из корня проекта:

```powershell
node -e "const bcrypt=require('bcrypt');const {sequelize}=require('./config/database');const {User}=require('./models');(async()=>{await sequelize.authenticate();const username='admin';const password='ChangeMe123!';const exists=await User.findOne({where:{username}});if(exists){console.log('User already exists');process.exit(0);}const hash=await bcrypt.hash(password,10);await User.create({username,password:hash,role:'admin'});console.log('Admin created:',username,'/',password);process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});"
```

После входа создай остальных пользователей через интерфейс:
- `/admin/users`

## 6. Полезные команды

### Docker

```powershell
npm run db:up      # поднять PostgreSQL в контейнере
npm run db:down    # остановить контейнер
npm run db:reset   # остановить + удалить volume (все данные БД)
npm run db:logs    # логи PostgreSQL
```

### Приложение

```powershell
npm run migrate:blog
npm start
npm run dev
```

## 7. Частые ошибки и как исправить

### Ошибка: `SequelizeConnectionRefusedError` / `ECONNREFUSED`

Причина: приложение не может подключиться к PostgreSQL.

Проверь:
1. База реально запущена (`npm run db:up` или сервис PostgreSQL активен).
2. Порт/хост/логин/пароль в `.env`.
3. Нет конфликта порта 5432.

Если локальный PostgreSQL конфликтует с Docker, поменяй порт в `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```

И в `.env` укажи:

```env
DB_PORT=5433
```

### Ошибка: `database "my_website" does not exist`

Создай базу вручную:

```powershell
createdb -U postgres my_website
```

Или через SQL:

```sql
CREATE DATABASE my_website;
```

### Ошибка входа в админку

- Проверь URL: `http://localhost:3000/auth/admin/login`
- Убедись, что пользователь создан и пароль захеширован (через команду из раздела 5).

## 8. Порядок запуска (кратко)

### Docker-режим

```powershell
npm install
Copy-Item .env.example .env
npm run db:up
npm run migrate:blog
npm start
```

### Без Docker

```powershell
npm install
Copy-Item .env.example .env
# Создать БД my_website
npm run migrate:blog
npm start
```

## 9. Завершение работы

- Остановить Node.js: `Ctrl + C` в терминале.
- Остановить Docker-БД (если использовалась):

```powershell
npm run db:down
```
