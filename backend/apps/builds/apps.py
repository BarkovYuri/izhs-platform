from django.apps import AppConfig


class BuildsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.builds'

    def ready(self):
        from . import signals  # noqa: F401