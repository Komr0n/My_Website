Русский / English

---

# Русский

Современный персональный сайт-портфолио с админ-панелью и блогом.

## Возможности

### Публичная часть
- Главная страница, разделы «Обо мне», «Проекты», «Сертификаты», «Контакты».
- Блог со списком постов и страницей поста.

### Админ-панель
- Авторизация и защищенные сессии.
- Управление разделами сайта (About/Projects/Certificates).
- Блог: шаблон постов с секциями и WYSIWYG-редактором.
- Media Library: загрузка изображений и вставка в текст.
- Задачи (To-Do): добавление/редактирование/удаление и чекбокс выполнения.

## Быстрый старт (Docker + PostgreSQL)

Требуется: Docker Desktop.

1) Запуск базы:
```
npm run db:up
```

2) Установка зависимостей:
```
npm install
```

3) Миграция (создает таблицы/поля для блога/медиа/задач):
```
npm run migrate:blog
```

4) Запуск:
```
npm start
```

Админ-панель: http://localhost:3000/auth/admin/login
Логин/пароль по умолчанию: `admin / admin123`

## Запуск без Docker (локальный PostgreSQL)

Требуется: установленный PostgreSQL и созданная база.

1) Создай базу:
```
createdb my_website
```

2) Запуск приложения:
```
npm install
npm run migrate:blog
npm start
```

## Переменные окружения (опционально)

Проект может работать без `.env`, но для продакшена лучше задать переменные.
Пример: `.env.example`.

### Вариант 1: DATABASE_URL
```
DATABASE_URL=postgres://user:password@localhost:5432/my_website
```

### Вариант 2: отдельные поля
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_website
DB_USER=postgres
DB_PASS=postgres
DB_SSL=false
```

## Если ошибка "database does not exist"

Значит приложение подключается не к той базе (например, к локальному Postgres вместо Docker).

Проверь базы в контейнере:
```
docker compose exec db psql -U postgres -c "\\l"
```

Если используешь Docker и локальный Postgres мешает, поменяй порт в `docker-compose.yml`:
```
ports:
  - "5433:5432"
```
И запускай с портом 5433:
```
$env:DB_PORT="5433"; npm run migrate:blog
$env:DB_PORT="5433"; npm start
```

## Скрипты npm

- `npm run db:up` - поднять PostgreSQL (Docker)
- `npm run db:down` - остановить контейнер
- `npm run db:reset` - удалить контейнер и данные (volume)
- `npm run db:logs` - логи базы
- `npm run migrate:blog` - миграции для блога/медиа/задач

## Блог: шаблон поста

Обязательное:
- Заголовок
- Обложка (cover image)
- Первая секция с контентом

Опционально:
- Подзаголовок
- Дополнительные секции
- Excerpt
- Дата публикации

Картинки вставляются через Media Library (кнопка Insert в активную секцию).

## Структура проекта (основные файлы)

```
server.js
config/database.js
routes/
controllers/
models/
views/
public/
migrations/
docker-compose.yml
```

## Бэкап/перенос данных PostgreSQL

Экспорт:
```
pg_dump -Fc -U postgres -d my_website > backup.dump
```
Импорт:
```
pg_restore -U postgres -d my_website backup.dump
```

## Лицензия

ISC

---

# English

Modern personal portfolio site with admin panel and blog.

## Features

### Public pages
- Home, About, Projects, Certificates, Contact.
- Blog list and single post page.

### Admin panel
- Auth and protected sessions.
- Manage site sections (About/Projects/Certificates).
- Blog: structured template with sections and WYSIWYG editor.
- Media Library: upload images and insert into content.
- Tasks (To-Do): add/edit/delete with completion checkbox.

## Quick start (Docker + PostgreSQL)

Requires: Docker Desktop.

1) Start database:
```
npm run db:up
```

2) Install dependencies:
```
npm install
```

3) Run migration (creates blog/media/tasks tables/fields):
```
npm run migrate:blog
```

4) Start app:
```
npm start
```

Admin panel: http://localhost:3000/auth/admin/login
Default credentials: `admin / admin123`

## Run without Docker (local PostgreSQL)

Requires: PostgreSQL installed and database created.

1) Create database:
```
createdb my_website
```

2) Run app:
```
npm install
npm run migrate:blog
npm start
```

## Environment variables (optional)

Project can run without `.env`, but for production use variables.
Example: `.env.example`.

### Option 1: DATABASE_URL
```
DATABASE_URL=postgres://user:password@localhost:5432/my_website
```

### Option 2: separate fields
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_website
DB_USER=postgres
DB_PASS=postgres
DB_SSL=false
```

## If error "database does not exist"

It means the app connects to the wrong database (e.g. local Postgres instead of Docker).

Check databases inside container:
```
docker compose exec db psql -U postgres -c "\\l"
```

If local Postgres conflicts with Docker, change port in `docker-compose.yml`:
```
ports:
  - "5433:5432"
```
Then run with port 5433:
```
$env:DB_PORT="5433"; npm run migrate:blog
$env:DB_PORT="5433"; npm start
```

## npm scripts

- `npm run db:up` - start PostgreSQL (Docker)
- `npm run db:down` - stop container
- `npm run db:reset` - remove container and data (volume)
- `npm run db:logs` - database logs
- `npm run migrate:blog` - migrations for blog/media/tasks

## Blog post template

Required:
- Title
- Cover image
- First section with content

Optional:
- Subtitle
- Additional sections
- Excerpt
- Publish date

Images are inserted via Media Library (Insert button in active section).

## Project structure (main files)

```
server.js
config/database.js
routes/
controllers/
models/
views/
public/
migrations/
docker-compose.yml
```

## PostgreSQL backup/restore

Export:
```
pg_dump -Fc -U postgres -d my_website > backup.dump
```
Import:
```
pg_restore -U postgres -d my_website backup.dump
```

## License

ISC
Что еще можно добавить в проект:

SEO-панель в админке (meta title/description/OG image для каждой страницы).
Черновики и отложенная публикация постов по дате/времени.
Загрузка файлов через drag-and-drop + оптимизация изображений (webp/avif).
Роли пользователей (admin/editor) и аудит действий в админке.
Редактор навигации (меню хедера) тоже через админку.
Мультиязычность (RU/EN) с переключателем и отдельными полями контента.
Бэкапы из админки (экспорт/импорт настроек и контента).

Давай к следующему
Но давай я уточню про Мультиязычность куда стоить добавлять а куда нет
Допустим в админку Мультиязычность вообще не надо добавлять и для постов тоже не надо добавлять мультиязычность
но вот в админке надо сделать так чтобы при редоктирование или добавление что нибудь другого например если добавлю что-то новое в о себе то я должен обезательно добавить англиский вариант и тд.
