# Production deploy — Timeweb Cloud

Полное развёртывание `remstroy70.ru` с нуля. Один раз делается руками — потом всё через `git push`.

## 0. Что должно быть готово

- VPS на Timeweb Cloud: Ubuntu 22.04 / Debian 12, минимум 2 vCPU / 4 GB RAM / 60 GB NVMe.
- Домен `remstroy70.ru`: A-запись на IP VPS, `www` тоже A-запись на тот же IP.
- Бакет в Timeweb S3 (Object Storage) — записать access key / secret key.
- Yandex 360: пароль приложения для SMTP (если не сделан раньше).
- (опц.) Sentry / GlitchTip — DSN.

## 1. Подготовка VPS

Залогиниться по SSH под root, создать обычного пользователя:

```bash
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```

Дальше — под `deploy`. Установить Docker:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker deploy
# перелогиниться, чтобы группа применилась
```

Установить базовые утилиты, настроить firewall:

```bash
sudo apt-get update && sudo apt-get install -y ufw fail2ban
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443
sudo ufw enable
sudo systemctl enable --now fail2ban
```

## 2. Каталог приложения

```bash
sudo mkdir -p /opt/izhs && sudo chown deploy:deploy /opt/izhs
cd /opt/izhs

# скачиваем prod-конфиги одним архивом из git (для первого раза)
git clone https://github.com/USER/izhs-platform.git tmp
cp -r tmp/docker-compose.prod.yml tmp/.env.prod.example tmp/infra .
rm -rf tmp
```

## 3. .env.prod

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Заполнить:
- `DJANGO_SECRET_KEY` — `python -c "import secrets; print(secrets.token_urlsafe(50))"` локально, скопировать
- `POSTGRES_PASSWORD` — сильный пароль
- `EMAIL_HOST_PASSWORD` — пароль приложения Yandex
- `S3_BUCKET_NAME`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` — из панели Timeweb
- `BACKEND_IMAGE` / `FRONTEND_IMAGE` — `ghcr.io/USER/izhs-platform-backend:latest` (и frontend), `USER` в нижнем регистре
- (опц.) `SENTRY_DSN`

```bash
chmod 600 .env.prod
```

## 4. SSL: Let's Encrypt

Сначала временный nginx без SSL для http-01 challenge:

```bash
# временный конфиг — комментируем https-блоки в infra/nginx/conf.d/remstroy.conf,
# оставляем только http-блок с .well-known + 200 OK на /
# (или используем минимальный certbot-конфиг)
```

Проще — запустить только nginx + certbot:

```bash
docker run -it --rm \
  -v $(pwd)/certbot-www:/var/www/certbot \
  -v $(pwd)/certbot-conf:/etc/letsencrypt \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email YOUR@EMAIL \
  --agree-tos --no-eff-email \
  -d remstroy70.ru -d www.remstroy70.ru
```

Сертификаты лягут в volume `certbot-conf`. Дальше docker-compose будет их монтировать в nginx + автообновлять каждые 12 часов через сервис `certbot`.

## 5. Залогиниться в GHCR

Pull образов из GitHub Container Registry требует токен. Создать на GitHub:
`Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate`,
scope `read:packages`. Скопировать токен.

```bash
echo "GHCR_TOKEN" | docker login ghcr.io -u GITHUB_USERNAME --password-stdin
```

## 6. Первый запуск

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
docker compose -f docker-compose.prod.yml logs -f backend
```

Должны увидеть `Booting worker with pid …` от gunicorn. Открыть `https://remstroy70.ru` — главная страница.

Создать суперпользователя:

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

Зайти на `https://remstroy70.ru/admin/`, заполнить SiteSettings.

## 7. GitHub Actions: secrets

В репозитории `Settings → Secrets and variables → Actions → New repository secret`:

| Имя | Значение |
|---|---|
| `SSH_HOST` | IP VPS |
| `SSH_USER` | `deploy` |
| `SSH_PORT` | `22` (если не меняли) |
| `SSH_KEY` | приватный SSH-ключ (содержимое `~/.ssh/id_ed25519`), можно создать отдельный для деплоя |
| `NEXT_PUBLIC_API_BASE_URL` | `https://remstroy70.ru` |

(`GITHUB_TOKEN` доступен автоматически.)

После этого `git push origin main` → GitHub Actions соберёт образы → задеплоит.

## 8. Бэкапы Postgres

Настроить cron на VPS:

```bash
sudo crontab -e
# каждые сутки в 3:00 — дамп в /var/backups + пуш в S3
0 3 * * * cd /opt/izhs && docker compose -f docker-compose.prod.yml exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > /var/backups/izhs-$(date +\%F).sql.gz
0 4 * * 0 find /var/backups -name "izhs-*.sql.gz" -mtime +30 -delete
```

(Опционально: `aws s3 cp` через boto или `s3cmd` для отгрузки в Timeweb S3.)

## 9. Cloudflare (рекомендуется)

Добавить домен в Cloudflare → переключить ns-серверы у регистратора → в DNS Cloudflare A-запись на IP VPS, режим **«Proxied»** (оранжевое облачко). Это даст бесплатный SSL у edge, DDoS-защиту, кэш статики и спрячет реальный IP сервера.

В этом случае Let's Encrypt всё равно нужен на VPS (Cloudflare-Origin-cert тоже подойдёт).

## 10. Health-check & rollback

Проверить статус:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 backend
docker compose -f docker-compose.prod.yml logs --tail=100 nginx
```

Откат на предыдущий образ:
```bash
# в ghcr.io находим предыдущий тег по SHA, вставляем в .env.prod
# затем:
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```
