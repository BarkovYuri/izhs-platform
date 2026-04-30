"""Пересоздаёт SpecKey и EstimateStage по утверждённому списку.

Запуск:
    python manage.py reseed_specs              # синхронизация структуры
    python manage.py reseed_specs --fill-empty # дополнительно заполнить пустые
                                                  значения у существующих Build
                                                  типовыми дефолтами

Поведение:
- SpecKey: добавляет недостающие, обновляет section/order/default_value
  у существующих по точному title, удаляет те, которых больше нет в списке.
- EstimateStage: то же самое.
- Связанные значения (BuildSpecValue / BuildEstimateValue) удаляются каскадом
  только для удалённых ключей; уже введённые значения для оставшихся
  ключей сохраняются.
- Для всех существующих Build досоздаются недостающие пустые BuildSpecValue
  и BuildEstimateValue со значением default_value.
- При --fill-empty: дополнительно заменяет пустые value у существующих
  BuildSpecValue на default_value. Непустые значения никогда не трогает.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.builds.models import (
    Build, SpecKey, EstimateStage,
    BuildSpecValue, BuildEstimateValue,
)


# (section, title, default_value)
SPEC_KEYS = [
    # --- Основные характеристики ---
    (SpecKey.SECTION_MAIN, "Площадь застройки", ""),
    (SpecKey.SECTION_MAIN, "Площадь дома", ""),
    (SpecKey.SECTION_MAIN, "Количество надземных этажей", ""),
    (SpecKey.SECTION_MAIN, "Количество подземных этажей", "0"),
    (SpecKey.SECTION_MAIN, "Высота дома", ""),
    (SpecKey.SECTION_MAIN, "Высота потолков", "3 м"),
    (SpecKey.SECTION_MAIN, "Объём надземной части", ""),
    (SpecKey.SECTION_MAIN, "Пригодность для постоянного проживания", "Да"),
    (SpecKey.SECTION_MAIN, "Архитектурный стиль", "Европейский"),
    (SpecKey.SECTION_MAIN, "Класс энергосбережения", ""),
    (SpecKey.SECTION_MAIN, "Класс энергоэффективности", ""),
    (SpecKey.SECTION_MAIN, "Показатель компактности здания", ""),
    (SpecKey.SECTION_MAIN, "Модульное строительство с конструкциями заводского изготовления", "Нет"),
    (SpecKey.SECTION_MAIN, "Тип отделки", "Черновая"),

    # --- Подключение к сетям ---
    (SpecKey.SECTION_NETWORKS, "Электроснабжение", "Не предусмотрено"),
    (SpecKey.SECTION_NETWORKS, "Газоснабжение", "Не предусмотрено"),
    (SpecKey.SECTION_NETWORKS, "Теплоснабжение", "Не предусмотрено"),
    (SpecKey.SECTION_NETWORKS, "Водоснабжение", "Индивидуальное"),
    (SpecKey.SECTION_NETWORKS, "Водоотведение", "Локальные очистные сооружения"),
    (SpecKey.SECTION_NETWORKS, "Отопление", "Не предусмотрено"),
    (SpecKey.SECTION_NETWORKS, "Вентиляция", "Естественная"),
    (SpecKey.SECTION_NETWORKS, "Противопожарная система", "Нет"),
    (SpecKey.SECTION_NETWORKS, "Улучшенные шумовые характеристики", "Нет"),
    (SpecKey.SECTION_NETWORKS, "Изоляция воздушного шума", "Нет"),
    (SpecKey.SECTION_NETWORKS, "Приборы учёта тепловой энергии", "Нет"),
    (SpecKey.SECTION_NETWORKS, "Автоматизированное регулирование параметров теплоносителя", "Нет"),
    (SpecKey.SECTION_NETWORKS, "Датчики протечки воды", "Нет"),

    # --- Объёмно-планировочные решения ---
    (SpecKey.SECTION_LAYOUT, "Спальни", ""),
    (SpecKey.SECTION_LAYOUT, "Санузлы", ""),
    (SpecKey.SECTION_LAYOUT, "Балконы", "Отсутствуют"),
    (SpecKey.SECTION_LAYOUT, "Лоджии", "Отсутствуют"),
    (SpecKey.SECTION_LAYOUT, "Совмещённая кухня-гостиная", "Да"),
    (SpecKey.SECTION_LAYOUT, "Камин", "Нет"),
    (SpecKey.SECTION_LAYOUT, "Веранда", "Нет"),
    (SpecKey.SECTION_LAYOUT, "Пристроенный гараж/крытая автостоянка", "Нет"),
    (SpecKey.SECTION_LAYOUT, "Чердачное помещение", "Нет"),
    (SpecKey.SECTION_LAYOUT, "Подвальное помещение", "Нет"),
    (SpecKey.SECTION_LAYOUT, "Терраса", "Нет"),

    # --- Конструктивные решения ---
    (SpecKey.SECTION_STRUCT, "Материал наружных стен и несущих конструкций", "Кирпич"),
    (SpecKey.SECTION_STRUCT, "Толщина наружных стен", "470 мм"),
    (SpecKey.SECTION_STRUCT, "Тип фундамента", "Плитный"),
    (SpecKey.SECTION_STRUCT, "Материал перекрытий", "Деревянные"),
    (SpecKey.SECTION_STRUCT, "Основной материал фасадов", "Облицовочный кирпич"),
    (SpecKey.SECTION_STRUCT, "Тип кровли", "Двускатная"),
    (SpecKey.SECTION_STRUCT, "Материал кровли", "Металлочерепица"),
    (SpecKey.SECTION_STRUCT, "Материал внутренних перегородок", "Кирпичные"),
    (SpecKey.SECTION_STRUCT, "Толщина внутренних перегородок", "120 мм"),
    (SpecKey.SECTION_STRUCT, "Эксплуатируемая или зелёная кровля", "Нет"),
]

ESTIMATE_STAGES = [
    "Устройство фундамента и котлована",
    "Устройство стен и перекрытий",
    "Устройство крыши и кровли",
    "Монтаж окон и подоконников, входных и межкомнатных дверей",
    "Внешние отделочные работы",
    "Монтаж систем водоснабжения и водоотведения",
    "Утепление (наружное, внутреннее)",
    "Прочее инженерное оборудование",
]


class Command(BaseCommand):
    help = "Пересоздаёт SpecKey и EstimateStage по утверждённому списку."

    def add_arguments(self, parser):
        parser.add_argument(
            "--fill-empty",
            action="store_true",
            help="Дополнительно заменить пустые value у существующих BuildSpecValue на default_value",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        # 1. Синхронизируем SpecKey
        wanted_titles = {title for _, title, _ in SPEC_KEYS}
        existing_by_title = {sk.title: sk for sk in SpecKey.objects.all()}

        deleted_keys = 0
        for title, sk in existing_by_title.items():
            if title not in wanted_titles:
                sk.delete()
                deleted_keys += 1

        created_keys = 0
        updated_keys = 0
        for idx, (section, title, default) in enumerate(SPEC_KEYS):
            obj, was_created = SpecKey.objects.get_or_create(
                title=title,
                defaults={"section": section, "order": idx, "default_value": default},
            )
            if was_created:
                created_keys += 1
            else:
                changed = False
                if obj.section != section:
                    obj.section = section; changed = True
                if obj.order != idx:
                    obj.order = idx; changed = True
                if obj.default_value != default:
                    obj.default_value = default; changed = True
                if changed:
                    obj.save()
                    updated_keys += 1

        self.stdout.write(self.style.SUCCESS(
            f"SpecKey: создано {created_keys}, обновлено {updated_keys}, удалено {deleted_keys}"
        ))

        # 2. Синхронизируем EstimateStage
        wanted_stages = set(ESTIMATE_STAGES)
        existing_stages = {st.title: st for st in EstimateStage.objects.all()}

        deleted_stages = 0
        for title, st in existing_stages.items():
            if title not in wanted_stages:
                st.delete()
                deleted_stages += 1

        created_stages = 0
        updated_stages = 0
        for idx, title in enumerate(ESTIMATE_STAGES):
            obj, was_created = EstimateStage.objects.get_or_create(
                title=title, defaults={"order": idx},
            )
            if was_created:
                created_stages += 1
            elif obj.order != idx:
                obj.order = idx
                obj.save()
                updated_stages += 1

        self.stdout.write(self.style.SUCCESS(
            f"EstimateStage: создано {created_stages}, обновлено {updated_stages}, удалено {deleted_stages}"
        ))

        # 3. Досоздаём недостающие значения для существующих Build (с дефолтами)
        builds = list(Build.objects.all())
        all_keys = list(SpecKey.objects.all())
        all_stages = list(EstimateStage.objects.all())
        spec_added = 0
        est_added = 0
        for b in builds:
            existing_key_ids = set(b.spec_values.values_list("key_id", flat=True))
            for k in all_keys:
                if k.id not in existing_key_ids:
                    BuildSpecValue.objects.create(
                        build=b, key=k, value=k.default_value,
                    )
                    spec_added += 1
            existing_stage_ids = set(b.estimate_values.values_list("stage_id", flat=True))
            for st in all_stages:
                if st.id not in existing_stage_ids:
                    BuildEstimateValue.objects.create(
                        build=b, stage=st, materials_cost=0, works_cost=0,
                    )
                    est_added += 1
        if builds:
            self.stdout.write(
                f"Существующие Build ({len(builds)}): добавлено spec-строк "
                f"{spec_added}, estimate-строк {est_added}"
            )

        # 4. (опц.) Заполняем пустые value у существующих BuildSpecValue
        if options.get("fill_empty"):
            filled = 0
            qs = BuildSpecValue.objects.select_related("key").filter(value="")
            for v in qs:
                if v.key.default_value:
                    v.value = v.key.default_value
                    v.save(update_fields=["value"])
                    filled += 1
            self.stdout.write(self.style.WARNING(
                f"--fill-empty: заполнено {filled} пустых значений в существующих карточках"
            ))

        self.stdout.write(self.style.SUCCESS("Готово."))
