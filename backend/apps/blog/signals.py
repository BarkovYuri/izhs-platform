"""Сигналы блога для IndexNow.

Когда статья сохраняется (создаётся или редактируется), отправляем
её URL в IndexNow. Это уведомляет Яндекс об изменении, обход
происходит быстрее обычного.

Регистрируется в apps.py через AppConfig.ready().
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.common.indexnow import notify

from .models import Article


@receiver(post_save, sender=Article)
def article_saved(sender, instance: Article, created: bool, **kwargs):
    if not instance.is_published:
        return
    # Notify URL статьи + главную блога (изменился список).
    notify(f"/blog/{instance.slug}")
    if created:
        notify("/blog")
        if instance.category_id:
            try:
                cat_slug = instance.category.slug  # type: ignore[union-attr]
                notify(f"/blog/category/{cat_slug}")
            except Exception:
                pass
