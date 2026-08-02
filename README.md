<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Планер — ежедневник задач

Веб-приложение-планер с поддержкой офлайн (PWA). Данные хранятся локально на устройстве.

## Локальный запуск

**Требования:** Node.js 20+

```bash
npm install
npm run dev
```

Откройте http://localhost:3000

## Сборка

```bash
npm run build
npm run preview
```

## Деплой на GitHub Pages

1. Создайте репозиторий на GitHub и загрузите проект:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПО.git
   git push -u origin main
   ```

2. В репозитории откройте **Settings → Pages**:
   - **Source:** GitHub Actions

3. После push в `main` workflow автоматически соберёт и опубликует сайт.

4. Адрес будет: `https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПО/`

### Установка на iPhone

1. Откройте сайт в **Safari**
2. Нажмите **Поделиться** → **На экран «Домой»**
3. Приложение будет работать офлайн после первого открытия с интернетом

## Офлайн (PWA)

- Service Worker кэширует приложение, шрифты и иконки
- Задачи и заметки хранятся в `localStorage` на устройстве
- Для обновления версии достаточно открыть приложение онлайн — обновление подтянется автоматически
