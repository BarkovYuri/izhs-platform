from django.core.management.base import BaseCommand
from django.db import transaction

from apps.builds.models import (
    Build, SpecKey, EstimateStage, BuildSpecValue, BuildEstimateValue,
)
from apps.common.models import SiteSettings


SPEC_KEYS = [
    # Основные характеристики
    (SpecKey.SECTION_MAIN, "Площадь дома, м²"),
    (SpecKey.SECTION_MAIN, "Площадь застройки, м²"),
    (SpecKey.SECTION_MAIN, "Этажность"),
    (SpecKey.SECTION_MAIN, "Высота потолков, м"),
    (SpecKey.SECTION_MAIN, "Количество спален"),
    (SpecKey.SECTION_MAIN, "Количество санузлов"),
    (SpecKey.SECTION_MAIN, "Размер участка, соток"),
    (SpecKey.SECTION_MAIN, "Срок строительства"),

    # Подключение к сетям
    (SpecKey.SECTION_NETWORKS, "Электроснабжение"),
    (SpecKey.SECTION_NETWORKS, "Водоснабжение"),
    (SpecKey.SECTION_NETWORKS, "Канализация"),
    (SpecKey.SECTION_NETWORKS, "Отопление"),
    (SpecKey.SECTION_NETWORKS, "Газоснабжение"),
    (SpecKey.SECTION_NETWORKS, "Интернет"),

    # Объёмно-планировочные решения
    (SpecKey.SECTION_LAYOUT, "Гостиная"),
    (SpecKey.SECTION_LAYOUT, "Кухня"),
    (SpecKey.SECTION_LAYOUT, "Спальни"),
    (SpecKey.SECTION_LAYOUT, "Санузлы"),
    (SpecKey.SECTION_LAYOUT, "Котельная"),
    (SpecKey.SECTION_LAYOUT, "Гараж"),
    (SpecKey.SECTION_LAYOUT, "Терраса"),
    (SpecKey.SECTION_LAYOUT, "Балкон"),

    # Конструктивные решения
    (SpecKey.SECTION_STRUCT, "Фундамент"),
    (SpecKey.SECTION_STRUCT, "Наружные стены"),
    (SpecKey.SECTION_STRUCT, "Внутренние стены"),
    (SpecKey.SECTION_STRUCT, "Перекрытия"),
    (SpecKey.SECTION_STRUCT, "Кровля"),
    (SpecKey.SECTION_STRUCT, "Утепление фасада"),
    (SpecKey.SECTION_STRUCT, "Окна"),
    (SpecKey.SECTION_STRUCT, "Входная дверь"),
]

ESTIMATE_STAGES = [
    "Земляные работы",
    "Фундамент",
    "Наружные стены (кирпич)",
    "Внутренние перегородки",
    "Перекрытия",
    "Стропильная система",
    "Кровля",
    "Окна и витражи",
    "Входные двери",
    "Скважина",
    "Септик",
    "Электромонтаж (черновой)",
]

SETTINGS_DEFAULTS = {
    "site_name": "Ремстрой",
    "tagline": "Кирпичные дома в посёлке Красная смородина",
    "phone": "+7 909 543 58 85",
    "settlement_name": "Красная смородина",
    "settlement_location": "д. Кисловка, Томский район",
    "legal_name": "ИП Барков Юрий Михайлович",
    "inn": "701716191942",
    "about_short": (
        "Строим кирпичные дома в посёлке Красная смородина (Кисловка) "
        "и на участках клиентов по Томской области. 6 типовых проектов "
        "с возможностью доработки или индивидуальный проект под клиента."
    ),
    "seo_title_default": "Ремстрой — кирпичные дома в Кисловке и Томске",
    "seo_description_default": (
        "Строительство кирпичных домов в посёлке Красная смородина "
        "(д. Кисловка) и на участках клиентов. Скважина, септик в комплекте."
    ),
}


class Command(BaseCommand):
    help = "Заполняет SpecKey, EstimateStage и SiteSettings дефолтным набором (идемпотентно)."

    @transaction.atomic
    def handle(self, *args, **options):
        # SiteSettings — заполняем только пустые поля, чтобы не перетирать ввод пользователя
        s = SiteSettings.load()
        updated_settings = []
        for field, value in SETTINGS_DEFAULTS.items():
            if not getattr(s, field):
                setattr(s, field, value)
                updated_settings.append(field)
        if updated_settings:
            s.save()
            self.stdout.write(f"SiteSettings: заполнено {len(updated_settings)} пустых полей: {', '.join(updated_settings)}")
        else:
            self.stdout.write("SiteSettings: все поля уже заполнены, ничего не меняем")

        # SpecKey — get_or_create, не перетираем существующие
        created_keys = 0
        for idx, (section, title) in enumerate(SPEC_KEYS):
            _, was_created = SpecKey.objects.get_or_create(
                section=section, title=title,
                defaults={"order": idx},
            )
            if was_created:
                created_keys += 1
        self.stdout.write(f"SpecKey: создано {created_keys} новых полей (всего шаблон: {len(SPEC_KEYS)})")

        # EstimateStage — get_or_create
        created_stages = 0
        for idx, title in enumerate(ESTIMATE_STAGES):
            _, was_created = EstimateStage.objects.get_or_create(
                title=title, defaults={"order": idx},
            )
            if was_created:
                created_stages += 1
        self.stdout.write(f"EstimateStage: создано {created_stages} новых этапов (всего шаблон: {len(ESTIMATE_STAGES)})")

        # Для уже существующих Build досоздаём недостающие spec_values / estimate_values
        builds = Build.objects.all()
        all_keys = list(SpecKey.objects.all())
        all_stages = list(EstimateStage.objects.all())
        spec_added = 0
        est_added = 0
        for b in builds:
            existing_key_ids = set(b.spec_values.values_list("key_id", flat=True))
            for k in all_keys:
                if k.id not in existing_key_ids:
                    BuildSpecValue.objects.create(build=b, key=k, value="")
                    spec_added += 1
            existing_stage_ids = set(b.estimate_values.values_list("stage_id", flat=True))
            for st in all_stages:
                if st.id not in existing_stage_ids:
                    BuildEstimateValue.objects.create(build=b, stage=st, materials_cost=0, works_cost=0)
                    est_added += 1
        if builds.exists():
            self.stdout.write(f"Существующие Build: добавлено spec-строк {spec_added}, estimate-строк {est_added}")

        self.stdout.write(self.style.SUCCESS("Готово."))
