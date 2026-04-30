from django.db import models


class Lead(models.Model):
    STATUS_NEW = "new"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_DONE = "done"
    STATUS_SPAM = "spam"

    STATUS_CHOICES = (
        (STATUS_NEW, "Новая"),
        (STATUS_IN_PROGRESS, "В работе"),
        (STATUS_DONE, "Закрыта"),
        (STATUS_SPAM, "Спам"),
    )

    SOURCE_HOMEPAGE = "homepage"
    SOURCE_PROJECT = "project"
    SOURCE_CONTACTS = "contacts"
    SOURCE_CATALOG = "catalog"
    SOURCE_OTHER = "other"

    SOURCE_CHOICES = (
        (SOURCE_HOMEPAGE, "Главная"),
        (SOURCE_PROJECT, "Карточка проекта"),
        (SOURCE_CONTACTS, "Страница контактов"),
        (SOURCE_CATALOG, "Каталог"),
        (SOURCE_OTHER, "Другое"),
    )

    name = models.CharField("Имя", max_length=120)
    phone = models.CharField("Телефон", max_length=30)
    email = models.EmailField("Email", blank=True)
    message = models.TextField("Сообщение", blank=True)

    build = models.ForeignKey(
        "builds.Build", verbose_name="Проект", on_delete=models.SET_NULL,
        related_name="leads", null=True, blank=True,
    )

    source = models.CharField("Источник", max_length=20, choices=SOURCE_CHOICES, default=SOURCE_OTHER)
    page_url = models.URLField("URL страницы", blank=True)

    utm_source = models.CharField("utm_source", max_length=120, blank=True)
    utm_medium = models.CharField("utm_medium", max_length=120, blank=True)
    utm_campaign = models.CharField("utm_campaign", max_length=120, blank=True)

    ip = models.GenericIPAddressField("IP", null=True, blank=True)
    user_agent = models.CharField("User-Agent", max_length=300, blank=True)

    status = models.CharField("Статус", max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    notes = models.TextField("Заметки менеджера", blank=True)

    created_at = models.DateTimeField("Создана", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлена", auto_now=True)

    class Meta:
        verbose_name = "Заявка"
        verbose_name_plural = "Заявки"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} — {self.phone} ({self.get_status_display()})"
