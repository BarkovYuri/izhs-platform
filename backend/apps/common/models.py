from django.core.exceptions import ValidationError
from django.db import models


class SiteSettings(models.Model):
    """Глобальные настройки сайта — синглтон.
    Редактируется только через админку. На фронт отдаётся через /api/settings/."""

    site_name = models.CharField("Название сайта", max_length=120, default="Ремстрой")
    tagline = models.CharField("Слоган (1 строка)", max_length=200, blank=True)

    phone = models.CharField("Телефон", max_length=30, blank=True)
    email = models.EmailField("Email для заявок", blank=True)
    address = models.CharField("Адрес офиса", max_length=300, blank=True)

    settlement_name = models.CharField("Название посёлка", max_length=120, default="Красная смородина")
    settlement_location = models.CharField("Расположение посёлка", max_length=200, default="д. Кисловка, Томская область")

    legal_name = models.CharField("Юр. наименование", max_length=200, blank=True)
    inn = models.CharField("ИНН", max_length=20, blank=True)
    ogrnip = models.CharField("ОГРНИП", max_length=20, blank=True)

    vk_url = models.URLField("ВКонтакте", blank=True)
    telegram_url = models.URLField("Telegram", blank=True)
    whatsapp_url = models.URLField("WhatsApp", blank=True)
    max_url = models.URLField(
        "MAX (мессенджер)", blank=True,
        help_text="Ссылка вида https://max.ru/u/USERNAME — российский мессенджер",
    )

    yandex_map_iframe = models.TextField(
        "Iframe Яндекс.Карты — посёлок Красная смородина",
        blank=True,
        help_text="Вставьте полный <iframe> из Яндекс.Карт для страницы посёлка",
    )
    office_map_iframe = models.TextField(
        "Iframe Яндекс.Карты — офис компании",
        blank=True,
        help_text="<iframe> для страницы Контакты, если офис не в посёлке",
    )
    settlement_plan = models.ImageField(
        "Генплан посёлка (картинка)", upload_to="site/", blank=True, null=True,
        help_text="Изображение генплана с участками — отображается на странице посёлка",
    )
    yandex_metrika_id = models.CharField("ID Яндекс.Метрики", max_length=20, blank=True)
    yandex_verification = models.CharField(
        "Yandex verification (для Яндекс.Вебмастера)", max_length=120, blank=True,
        help_text="Значение content из meta name='yandex-verification' для подтверждения сайта в Яндекс.Вебмастере",
    )
    google_verification = models.CharField(
        "Google verification (для Search Console)", max_length=120, blank=True,
        help_text="Значение content из meta name='google-site-verification'",
    )
    working_hours = models.CharField(
        "Часы работы офиса", max_length=120, blank=True,
        help_text='Например: "Пн-Пт 9:00-18:00, Сб 10:00-15:00"',
    )

    about_short = models.TextField("О компании (короткий текст для футера)", blank=True)

    # Расширенный блок «О компании» для страницы /about
    about_intro = models.TextField(
        "О компании — вступление",
        blank=True,
        help_text="Лид-абзац в начале страницы «О компании»",
    )
    about_escrow = models.TextField(
        "О компании — про эскроу и банки",
        blank=True,
        help_text="Параграф про эскроу-счета и банки-партнёры",
    )
    about_settlement = models.TextField(
        "О компании — про посёлок",
        blank=True,
        help_text="Параграф про собственный посёлок «Красная Смородина»",
    )
    about_outro = models.TextField(
        "О компании — заключение",
        blank=True,
        help_text="Финальный параграф (для кого подходит)",
    )
    directions_list = models.TextField(
        "Направления деятельности (по одному пункту в строке)",
        blank=True,
        help_text="Каждый пункт с новой строки",
    )
    advantages_list = models.TextField(
        "Преимущества (по одному пункту в строке)",
        blank=True,
    )
    partner_banks = models.CharField(
        "Банки-партнёры",
        max_length=300,
        blank=True,
        help_text="Через запятую: Сбербанк, Альфа-Банк, Левобережный, ДОМ.РФ",
    )

    seo_title_default = models.CharField("SEO Title по умолчанию", max_length=200, blank=True)
    seo_description_default = models.CharField("SEO Description по умолчанию", max_length=300, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Настройки сайта"
        verbose_name_plural = "Настройки сайта"

    def __str__(self) -> str:
        return self.site_name

    def clean(self):
        if not self.pk and SiteSettings.objects.exists():
            raise ValidationError("Может существовать только одна запись настроек сайта.")

    def save(self, *args, **kwargs):
        if not self.pk:
            existing = SiteSettings.objects.first()
            if existing:
                self.pk = existing.pk
        super().save(*args, **kwargs)

    @classmethod
    def load(cls) -> "SiteSettings":
        obj = cls.objects.first()
        if obj is None:
            obj = cls.objects.create()
        return obj


class PageContent(models.Model):
    """Тексты заголовков/подзаголовков для страниц сайта.

    Одна запись = одна страница. Поля редактируются в админке.
    Если поле пустое, фронт использует значение по умолчанию (хардкод).
    """

    PAGE_HOME = "home"
    PAGE_BUILDS = "builds"
    PAGE_FAQ = "faq"
    PAGE_ABOUT = "about"
    PAGE_CONTACTS = "contacts"
    PAGE_SETTLEMENT = "settlement"
    PAGE_CHOICES = [
        (PAGE_HOME, "Главная (/)"),
        (PAGE_BUILDS, "Каталог проектов (/builds)"),
        (PAGE_FAQ, "Вопросы и ответы (/faq)"),
        (PAGE_ABOUT, "О компании (/about)"),
        (PAGE_CONTACTS, "Контакты (/contacts)"),
        (PAGE_SETTLEMENT, "Посёлок (/settlement)"),
    ]

    slug = models.CharField(
        "Страница",
        max_length=20,
        choices=PAGE_CHOICES,
        unique=True,
        help_text="Какую именно страницу сайта редактируем",
    )

    kicker = models.CharField(
        "Мини-метка над заголовком",
        max_length=80,
        blank=True,
        help_text=(
            "Маленькая надпись над h1, обычно одно-два слова, "
            "например: «Каталог», «FAQ», «О компании»"
        ),
    )
    title = models.CharField(
        "Заголовок страницы (h1)",
        max_length=200,
        blank=True,
        help_text=(
            "Большой заголовок, который видит посетитель в самом верху страницы. "
            "Если оставить пустым — будет показан стандартный текст из кода."
        ),
    )
    subtitle = models.TextField(
        "Лид-абзац под заголовком",
        blank=True,
        help_text=(
            "Короткий пояснительный текст под h1 (1–3 предложения). "
            "Не виден напрямую если оставить пустым."
        ),
    )

    meta_title = models.CharField(
        "SEO Title (для Google/Яндекс)",
        max_length=200,
        blank=True,
        help_text=(
            "Заголовок страницы во вкладке браузера и в выдаче поисковика. "
            "Если пусто — берётся title."
        ),
    )
    meta_description = models.CharField(
        "SEO Description",
        max_length=300,
        blank=True,
        help_text=(
            "Описание страницы для поисковиков (до ~160 символов). "
            "Показывается в результатах поиска."
        ),
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Тексты страницы"
        verbose_name_plural = "Тексты страниц"
        ordering = ["slug"]

    def __str__(self) -> str:
        return dict(self.PAGE_CHOICES).get(self.slug, self.slug)
