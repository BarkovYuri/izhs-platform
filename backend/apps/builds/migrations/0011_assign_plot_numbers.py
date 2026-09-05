from django.db import migrations

# Реальные закреплённые участки в ЖК «Красная смородина» под конкретные
# типовые проекты — нужны, чтобы фид "Недвижимость" для Яндекс.Вебмастера
# описывал идентифицируемые объекты (с конкретным участком), а не просто
# предложение о строительстве по типовому проекту (см. apps/builds/feeds.py).
PLOT_BY_SLUG = {
    "odnoetazhnyj-dom-euro-86b": "8",
    "odnoetazhnyj-euro86": "6",
    "dvuhetazhnyj-dom-euro-136b-s-balkonom": "4",
    "dvuhetazhnyj-dom-euro-144-s-terrasoj": "2",
    "dvuhetazhnyj-dom-euro-168b-s-balkonom": "14",
    "trehetazhnyj-euro-200b-c-bolshim-garazhom": "16",
}


def assign_plots(apps, schema_editor):
    Build = apps.get_model("builds", "Build")
    for slug, plot in PLOT_BY_SLUG.items():
        Build.objects.filter(slug=slug, plot_number="").update(plot_number=plot)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("builds", "0010_seed_estimates"),
    ]

    operations = [
        migrations.RunPython(assign_plots, noop_reverse),
    ]
