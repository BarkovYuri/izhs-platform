"""Сигналы builds для IndexNow.

При сохранении Build, BuildFAQ, BuildSpecValue, BuildEstimateValue
— уведомляем Яндекс об изменении страницы проекта.

Регистрируется в apps.py через AppConfig.ready().
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.common.indexnow import notify

from .models import (
    Build,
    BuildEstimateValue,
    BuildFAQ,
    BuildSpecValue,
)


@receiver(post_save, sender=Build)
def build_saved(sender, instance: Build, created: bool, **kwargs):
    if not instance.is_published:
        return
    notify(f"/builds/{instance.slug}")
    if created:
        notify("/builds")  # каталог получил новый проект


@receiver(post_save, sender=BuildFAQ)
def build_faq_saved(sender, instance: BuildFAQ, **kwargs):
    if not instance.is_published:
        return
    try:
        slug = instance.build.slug
        notify(f"/builds/{slug}")
    except Exception:
        pass


@receiver(post_save, sender=BuildSpecValue)
def build_spec_saved(sender, instance: BuildSpecValue, **kwargs):
    try:
        slug = instance.build.slug
        if instance.build.is_published:
            notify(f"/builds/{slug}")
    except Exception:
        pass


@receiver(post_save, sender=BuildEstimateValue)
def build_estimate_saved(sender, instance: BuildEstimateValue, **kwargs):
    try:
        slug = instance.build.slug
        if instance.build.is_published:
            notify(f"/builds/{slug}")
    except Exception:
        pass
