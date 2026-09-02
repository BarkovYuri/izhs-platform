"""Сигналы promotions для IndexNow.

При сохранении Promotion / PromotionBuild уведомляем Яндекс о
странице акции (и списке /akcii при создании новой), а также о
странице дома — на ней меняется бейдж и цена.

Регистрируется в apps.py через AppConfig.ready().
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.common.indexnow import notify

from .models import Promotion, PromotionBuild


@receiver(post_save, sender=Promotion)
def promotion_saved(sender, instance: Promotion, created: bool, **kwargs):
    if not instance.is_published:
        return
    notify(f"/akcii/{instance.slug}")
    if created:
        notify("/akcii")


@receiver(post_save, sender=PromotionBuild)
def promotion_build_saved(sender, instance: PromotionBuild, **kwargs):
    try:
        promotion = instance.promotion
        build = instance.build
    except Exception:
        return
    if promotion.is_published:
        notify(f"/akcii/{promotion.slug}")
    if build.is_published:
        notify(f"/builds/{build.slug}")
