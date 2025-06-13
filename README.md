TOOLGRAD

## Начало работы

Чтобы начать работу нужно:

Скачать и запустить Docker Desktop

После запуска докера следует открыть проект в VSCode и прописать команду

```bash
npm install
```

Далее необходимо написать команду

```bash
npx prisma generate
```

```bash
npx prisma migrate
```

После установки миграций необходимо запустить docker командой

```bash
docker compose up
```

После выполнения каждого из этих пунктов необходимо написать

```bash
npm run dev
```

Для запуска базы данных

```bash
mpx prisma studio
```
