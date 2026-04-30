from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(BASE_DIR.parent / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env("DJANGO_DEBUG")

ALLOWED_HOSTS = [h.strip() for h in env("DJANGO_ALLOWED_HOSTS").split(",") if h.strip()]

INSTALLED_APPS = [
    # Unfold — современная админка (должна быть ПЕРЕД django.contrib.admin)
    "unfold",
    "unfold.contrib.filters",
    "unfold.contrib.forms",
    "unfold.contrib.inlines",

    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",
    "drf_spectacular",

    # Local apps (AppConfig)
    "apps.common.apps.CommonConfig",
    "apps.builds.apps.BuildsConfig",
    "apps.faq.apps.FaqConfig",
    "apps.leads.apps.LeadsConfig",
]

SITE_NAME = "Ремстрой"

# ---- Email (SMTP Yandex по умолчанию, console-фолбэк если пароль не задан) ----
EMAIL_HOST = env("EMAIL_HOST", default="smtp.yandex.ru")
EMAIL_PORT = env.int("EMAIL_PORT", default=465)
EMAIL_USE_SSL = env.bool("EMAIL_USE_SSL", default=True)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=False)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")

DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default=EMAIL_HOST_USER or "noreply@remstroy70.ru")
LEADS_NOTIFY_EMAIL = env("LEADS_NOTIFY_EMAIL", default=EMAIL_HOST_USER)

# Если пароль приложения не задан — пишем в консоль вместо реальной отправки.
# Это позволяет не падать в dev и видеть содержимое писем в логах runserver.
_default_email_backend = (
    "django.core.mail.backends.smtp.EmailBackend"
    if EMAIL_HOST_PASSWORD
    else "django.core.mail.backends.console.EmailBackend"
)
EMAIL_BACKEND = env("EMAIL_BACKEND", default=_default_email_backend)

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # Запрет browser/proxy-кэша на /api/* — иначе Safari может кэшировать
    # ответы на часы и пользователь видит старые данные после правки в админке.
    "apps.common.middleware.NoCacheApiMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB"),
        "USER": env("POSTGRES_USER"),
        "PASSWORD": env("POSTGRES_PASSWORD"),
        "HOST": env("POSTGRES_HOST"),
        "PORT": env("POSTGRES_PORT"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "ru-ru"
TIME_ZONE = "Europe/Moscow"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = [s.strip() for s in env(
    "CORS_ALLOWED_ORIGINS",
    default="http://127.0.0.1:3000,http://localhost:3000",
).split(",") if s.strip()]
CSRF_TRUSTED_ORIGINS = [s.strip() for s in env(
    "CSRF_TRUSTED_ORIGINS",
    default="http://127.0.0.1:8000,http://localhost:8000",
).split(",") if s.strip()]

# ---- Production security headers ----
# Активируются только когда DEBUG=False (т.е. на проде).
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=31536000)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
    X_FRAME_OPTIONS = "DENY"

# ---- Object storage (Timeweb S3 / любой S3-совместимый) ----
USE_S3 = env.bool("USE_S3", default=False)
if USE_S3:
    AWS_S3_ENDPOINT_URL = env("S3_ENDPOINT_URL", default="https://s3.twcstorage.ru")
    AWS_STORAGE_BUCKET_NAME = env("S3_BUCKET_NAME")
    AWS_ACCESS_KEY_ID = env("S3_ACCESS_KEY")
    AWS_SECRET_ACCESS_KEY = env("S3_SECRET_KEY")
    AWS_S3_REGION_NAME = env("S3_REGION_NAME", default="ru-1")
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL = None
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}
    AWS_QUERYSTRING_AUTH = False
    AWS_S3_ADDRESSING_STYLE = "virtual"
    AWS_S3_SIGNATURE_VERSION = "s3v4"
    AWS_S3_CUSTOM_DOMAIN = env("S3_CUSTOM_DOMAIN", default="") or None
    STORAGES = {
        "default": {"BACKEND": "storages.backends.s3.S3Storage"},
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    }

# ---- Sentry (включается, если задан DSN) ----
SENTRY_DSN = env("SENTRY_DSN", default="")
if SENTRY_DSN and not DEBUG:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=env.float("SENTRY_TRACES_SAMPLE_RATE", default=0.1),
        send_default_pii=False,
        environment=env("SENTRY_ENV", default="production"),
    )

# ---- Logging (с учётом dev/prod) ----
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{asctime} {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "django.db.backends": {"level": "WARNING"},
        "django.security": {"level": "WARNING"},
    },
}

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "300/hour",   # общий лимит для анонимных GET-запросов
        "leads": "5/minute",  # форма заявки — защита от спама
    },
}

SPECTACULAR_SETTINGS = {
    "TITLE": "IZHS API",
    "VERSION": "0.1.0",
}

# ---- Django Unfold (admin) ----
UNFOLD = {
    "SITE_TITLE": "Ремстрой — админка",
    "SITE_HEADER": "Ремстрой",
    "SITE_SUBHEADER": "Управление сайтом",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "BORDER_RADIUS": "10px",
    "COLORS": {
        "primary": {
            "50":  "253 246 240",
            "100": "250 232 219",
            "200": "243 207 184",
            "300": "232 173 140",
            "400": "212 124 88",
            "500": "184 90 53",   # var(--rs-brand)
            "600": "156 71 41",
            "700": "124 56 32",
            "800": "92 41 22",
            "900": "61 27 14",
            "950": "31 14 7",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Контент сайта",
                "separator": True,
                "items": [
                    {"title": "Проекты домов", "icon": "home_work", "link": "/admin/builds/build/"},
                    {"title": "Заявки клиентов", "icon": "inbox", "link": "/admin/leads/lead/"},
                    {"title": "Вопросы и ответы", "icon": "help", "link": "/admin/faq/faqitem/"},
                    {"title": "Категории FAQ", "icon": "folder", "link": "/admin/faq/faqcategory/"},
                ],
            },
            {
                "title": "Шаблоны",
                "separator": True,
                "items": [
                    {"title": "Поля характеристик", "icon": "tune", "link": "/admin/builds/speckey/"},
                    {"title": "Этапы сметы", "icon": "list_alt", "link": "/admin/builds/estimatestage/"},
                ],
            },
            {
                "title": "Настройки",
                "separator": True,
                "items": [
                    {"title": "Настройки сайта", "icon": "settings", "link": "/admin/common/sitesettings/"},
                    {"title": "Пользователи", "icon": "person", "link": "/admin/auth/user/"},
                ],
            },
        ],
    },
}
