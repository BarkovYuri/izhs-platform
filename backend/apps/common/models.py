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

    settlement_name = models.CharField("Название ЖК", max_length=120, default="Красная смородина")
    settlement_location = models.CharField("Расположение ЖК", max_length=200, default="д. Кисловка, Томская область")

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
        "Iframe Яндекс.Карты — ЖК «Красная смородина»",
        blank=True,
        help_text=(
            "Вставьте полный код «iframe» из Яндекс.Карт "
            "для страницы ЖК."
        ),
    )
    office_map_iframe = models.TextField(
        "Iframe Яндекс.Карты — офис компании",
        blank=True,
        help_text=(
            "Код «iframe» из Яндекс.Карт для страницы Контакты, "
            "если офис не в ЖК."
        ),
    )
    settlement_plan = models.ImageField(
        "Генплан ЖК (картинка)", upload_to="site/", blank=True, null=True,
        help_text="Изображение генплана с участками — отображается на странице ЖК",
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
        help_text='Например: "Пн-Пт 10:00-18:00, Сб 10:00-15:00"',
    )

    warranty_years = models.PositiveSmallIntegerField(
        "Гарантия (лет)",
        default=5,
        help_text=(
            "Сколько лет гарантии. Используется в Hero на главной "
            "(«Гарантия 5 лет»), в футере и в Schema.org."
        ),
    )
    warranty_subject = models.CharField(
        "На что распространяется гарантия",
        max_length=200,
        default="на конструктив",
        blank=True,
        help_text=(
            "Короткая фраза, что покрывает гарантия. "
            "Например: «на конструктив», «на коробку и кровлю»."
        ),
    )

    founded_year = models.PositiveSmallIntegerField(
        "Год основания / выхода на рынок",
        default=2016,
        help_text=(
            "Используется в Hero на главной: «На рынке с 2016 года». "
            "Также вычисляется стаж компании."
        ),
    )

    homes_built_total = models.PositiveSmallIntegerField(
        "Всего построено домов",
        default=30,
        help_text=(
            "Число в Hero на главной: «N построено». Учитываются все "
            "объекты, не только в ЖК. На сайте показывается со "
            "знаком «+» (например, «30+»)."
        ),
    )
    settlement_homes_built = models.PositiveSmallIntegerField(
        "Построено домов в ЖК",
        default=12,
        help_text=(
            "Сколько домов в ЖК «Красная смородина» уже сданы. "
            "Используется в блоке статистики ЖК."
        ),
    )
    settlement_homes_total = models.PositiveSmallIntegerField(
        "Всего домов в ЖК (план)",
        default=40,
        help_text=(
            "Сколько всего домов запланировано в ЖК. На сайте "
            "будет показано «N из M уже построены»."
        ),
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
        "О компании — про ЖК",
        blank=True,
        help_text="Параграф про собственный ЖК «Красная смородина»",
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
    PAGE_PORTFOLIO = "portfolio"
    PAGE_CHOICES = [
        (PAGE_HOME, "Главная (/)"),
        (PAGE_BUILDS, "Каталог проектов (/builds)"),
        (PAGE_PORTFOLIO, "Реализованные объекты (/portfolio)"),
        (PAGE_FAQ, "Вопросы и ответы (/faq)"),
        (PAGE_ABOUT, "О компании (/about)"),
        (PAGE_CONTACTS, "Контакты (/contacts)"),
        (PAGE_SETTLEMENT, "ЖК (/settlement)"),
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

    body = models.TextField(
        "Основной текст страницы",
        blank=True,
        help_text=(
            "Длинное описание для страницы (например, подробное описание "
            "ЖК на /settlement). Поддерживает абзацы (пустая строка = "
            "новый абзац) и маркеры списка (строка начинается с «-» или «•»). "
            "Видно только на странице, для которой включено в коде."
        ),
    )

    hero_lead = models.CharField(
        "Hero — заголовок, белая часть",
        max_length=120,
        blank=True,
        help_text=(
            "Только для главной (slug=home). Первая часть большого "
            "заголовка в Hero, отображается белым. "
            "Например: «Свой кирпичный дом»."
        ),
    )
    hero_accent = models.CharField(
        "Hero — заголовок, оранжевая часть",
        max_length=120,
        blank=True,
        help_text=(
            "Только для главной. Вторая часть заголовка, оранжевым "
            "акцентом. Например: «по цене квартиры»."
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


class PageContentImage(models.Model):
    """Фотографии для страницы — отображаются в галерее рядом с body.

    Сейчас используется только на /settlement, но модель универсальная
    (привязка по PageContent), чтобы в будущем можно было добавить
    галереи на /about, /portfolio и т.п. без новой модели.
    """

    page = models.ForeignKey(
        PageContent,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="Страница",
    )
    image = models.ImageField(
        "Фотография",
        upload_to="pages/",
        help_text="Большие фото автоматически сжимаются до 1920px.",
    )
    alt = models.CharField(
        "Подпись / альт-текст",
        max_length=200,
        blank=True,
        help_text=(
            "Короткое описание фото — пригодится для поиска картинок "
            "и для людей со скринридерами. Можно оставить пустым."
        ),
    )
    order = models.PositiveSmallIntegerField(
        "Порядок",
        default=0,
        help_text="Меньшее число — выше в галерее.",
    )

    class Meta:
        verbose_name = "Фото для страницы"
        verbose_name_plural = "Фотографии для страниц"
        ordering = ("order", "id")

    def __str__(self) -> str:
        return f"{self.page.slug} #{self.order}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Импорт здесь, чтобы не было циклической зависимости common ↔ builds.
        from apps.builds.models import _compress_imagefield

        if _compress_imagefield(self.image):
            super().save(update_fields=["image"])
