"""Сигналы common для IndexNow.

При обновлении PageContent / BuildFilterContent — уведомляем
Яндекс об изменении соответствующей страницы.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .indexnow import notify
from .models import BuildFilterContent, PageContent


PAGE_URLS = {
    "home": "/",
    "builds": "/builds",
    "portfolio": "/portfolio",
    "settlement": "/settlement",
    "about": "/about",
    "contacts": "/contacts",
    "faq": "/faq",
}


@receiver(post_save, sender=PageContent)
def page_content_saved(sender, instance: PageContent, **kwargs):
    url = PAGE_URLS.get(instance.slug)
    if url:
        notify(url)


@receiver(post_save, sender=BuildFilterContent)
def build_filter_content_saved(sender, instance: BuildFilterContent, **kwargs):
    notify(f"/builds/filtr/{instance.slug}")
