"""Обновляет office_map_iframe на новый, с карточкой организации
из Яндекс.Бизнеса (oid=158357204901) вместо обычной точки на карте.

Идемпотентно: перетирает только если поле не пустое и содержит
старый iframe. Если админ вручную вписал свой вариант — не
трогаем.
"""

from django.db import migrations


NEW_IFRAME = (
    '<iframe src="https://yandex.ru/map-widget/v1/'
    '?z=12&ol=biz&oid=158357204901" width="560" height="400" '
    'frameborder="0"></iframe>'
)


def update_iframe(apps, schema_editor):
    SiteSettings = apps.get_model("common", "SiteSettings")
    s = SiteSettings.objects.first()
    if s is None:
        return
    # Перетираем только если: (а) поле пустое, или (б) там старая
    # точечная карта (без oid карточки бизнеса). Кастомные варианты
    # админа не трогаем.
    current = (s.office_map_iframe or "").strip()
    if current and "ol=biz" in current and "oid=158357204901" in current:
        return  # уже установлен новый — ничего не делаем
    s.office_map_iframe = NEW_IFRAME
    s.save(update_fields=["office_map_iframe", "updated_at"])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("common", "0016_buildfiltercontent"),
    ]

    operations = [
        migrations.RunPython(update_iframe, noop),
    ]
