"""Модели для блога — статьи и категории.

Цель — SEO-охват по узким долгохвостным запросам через статьи о
строительстве, ипотеке, материалах и т.п. Категории дают
дополнительные landing-страницы (/blog/category/<slug>/).
"""

from django.db import models
from django.utils import timezone


class Category(models.Model):
    """Категория статей блога.

    Несколько фиксированных категорий: стройка, материалы, финансы и
    оформление. Можно добавлять новые в админке, но без фанатизма —
    каждая пустая категория = слабая SEO-страница.
    """

    name = models.CharField(
        "Название",
        max_length=80,
        help_text='Например: «Стройка», «Материалы», «Финансы и ипотека».',
    )
    slug = models.SlugField(
        "Слаг (для URL)",
        max_length=80,
        unique=True,
        help_text=(
            "Идентификатор для URL: /blog/category/<slug>/. "
            "Латиница, цифры, дефисы. Например: stroyka, finansy."
        ),
    )
    description = models.TextField(
        "Описание категории",
        blank=True,
        help_text=(
            "Короткое описание для страницы категории (1–3 предложения). "
            "Видно над списком статей и используется в meta-description."
        ),
    )
    order = models.PositiveSmallIntegerField(
        "Порядок",
        default=0,
        help_text="Меньшее число — выше в списке.",
    )
    is_published = models.BooleanField(
        "Опубликована",
        default=True,
        help_text="Сними галку, чтобы временно скрыть категорию.",
    )

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ("order", "name")

    def __str__(self) -> str:
        return self.name


class Article(models.Model):
    """Статья блога — основная сущность для SEO-охвата.

    Тело пишется в формате «markdown-lite»: заголовки ## ###, абзацы
    через пустую строку, списки через `-` или `•`, ссылки [текст](url),
    выделение **жирным** или *курсивом*, цитаты `> ...`.
    """

    title = models.CharField(
        "Заголовок (H1)",
        max_length=200,
        help_text=(
            "Главный заголовок статьи. Используется также в title в "
            "выдаче поисковика если не задан отдельный meta_title."
        ),
    )
    slug = models.SlugField(
        "Слаг (для URL)",
        max_length=200,
        unique=True,
        help_text=(
            "Идентификатор для URL: /blog/<slug>/. Латиница, цифры, "
            "дефисы. Если оставить пустым — сгенерируется из заголовка."
        ),
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name="articles",
        null=True,
        blank=True,
        verbose_name="Категория",
        help_text="Можно оставить пустым, тогда статья без категории.",
    )
    excerpt = models.TextField(
        "Краткий анонс",
        max_length=400,
        blank=True,
        help_text=(
            "1–2 предложения для превью статьи в списках. "
            "Если пусто — берутся первые 200 символов из body."
        ),
    )
    body = models.TextField(
        "Текст статьи",
        help_text=(
            "Поддерживается markdown-lite: ## H2, ### H3, **жирный**, "
            "*курсив*, [текст](url), - или • списки, > цитаты. "
            "Между абзацами оставляйте пустую строку."
        ),
    )
    cover = models.ImageField(
        "Обложка статьи",
        upload_to="blog/",
        blank=True,
        null=True,
        help_text=(
            "Главное изображение статьи: показывается в карточке в "
            "списке и сверху страницы. Желательно 1600×900 или больше. "
            "Большие фото сожмутся автоматически до 1920px."
        ),
    )

    is_published = models.BooleanField(
        "Опубликована",
        default=True,
        help_text="Сними галку, чтобы спрятать статью с сайта.",
    )
    published_at = models.DateTimeField(
        "Дата публикации",
        default=timezone.now,
        help_text=(
            "Дата, которая показывается читателю и используется в "
            "ItemList / sitemap. По умолчанию — сейчас."
        ),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # SEO-поля — необязательные. Если пусто — генерируется из title/excerpt.
    meta_title = models.CharField(
        "SEO Title",
        max_length=200,
        blank=True,
        help_text="Если пусто — будет использован title.",
    )
    meta_description = models.CharField(
        "SEO Description",
        max_length=300,
        blank=True,
        help_text="Если пусто — будет использован excerpt.",
    )
    keywords = models.CharField(
        "Ключевые слова",
        max_length=300,
        blank=True,
        help_text=(
            "Через запятую: «эскроу, ипотека, ИЖС, Томск». "
            "Прим.: Google игнорирует meta keywords, Яндекс тоже "
            "не использует их для ранжирования. Поле — больше для "
            "учёта копирайтера, чем для SEO."
        ),
    )

    class Meta:
        verbose_name = "Статья"
        verbose_name_plural = "Статьи"
        ordering = ("-published_at",)
        indexes = [
            models.Index(fields=["-published_at"]),
            models.Index(fields=["category", "-published_at"]),
        ]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Авто-сжатие обложки, как в Build/Portfolio.
        from apps.builds.models import _compress_imagefield

        if _compress_imagefield(self.cover):
            super().save(update_fields=["cover"])


class ArticleImage(models.Model):
    """Изображения для вставки внутрь тела статьи.

    Админ загружает фото инлайн-блоком к статье, копирует готовый
    шорткод вида «![Подпись](/media/blog/foo.jpg)» и вставляет в body
    в нужное место. Парсер на фронте превратит это в <figure> с
    подписью под картинкой.
    """

    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name="inline_images",
        verbose_name="Статья",
    )
    image = models.ImageField(
        "Изображение",
        upload_to="blog/inline/",
        help_text="Большие фото сожмутся автоматически до 1920px.",
    )
    alt = models.CharField(
        "Подпись (alt-текст)",
        max_length=200,
        blank=True,
        help_text=(
            "Подпись под картинкой и alt-текст для поисковика и "
            "скринридеров. Желательно — описательный, без «фото»."
        ),
    )
    order = models.PositiveSmallIntegerField(
        "Порядок",
        default=0,
        help_text="Меньшее число — выше в списке (для удобства админа).",
    )

    class Meta:
        verbose_name = "Изображение в статье"
        verbose_name_plural = "Изображения в статьях"
        ordering = ("order", "id")

    def __str__(self) -> str:
        return f"{self.article.slug} #{self.order}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        from apps.builds.models import _compress_imagefield

        if _compress_imagefield(self.image):
            super().save(update_fields=["image"])
