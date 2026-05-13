from django.utils.html import format_html
from unfold.admin import ModelAdmin, StackedInline, TabularInline

from .models import (
    Build,
    BuildImage, BuildFloorImage, BuildFacadeImage,
    BuildFAQ,
    SpecKey, BuildSpecValue,
    EstimateStage, BuildEstimateValue,
)


def _thumb(url, size=60):
    if not url:
        return "—"
    return format_html(
        '<img src="{}" style="width:{}px;height:{}px;object-fit:cover;border-radius:6px;" />',
        url, size, size,
    )


class _ImageInlineBase(TabularInline):
    extra = 1
    tab = True
    fields = ("preview", "image", "order")
    readonly_fields = ("preview",)

    def preview(self, obj):
        return _thumb(obj.image.url if obj.image else None, size=72)
    preview.short_description = "Превью"


class BuildImageInline(_ImageInlineBase):
    model = BuildImage
    verbose_name = "Фото"
    verbose_name_plural = "Фото дома"


class BuildFloorPlanInline(_ImageInlineBase):
    model = BuildFloorImage
    verbose_name = "Поэтажный план"
    verbose_name_plural = "Поэтажные планы"


class BuildFacadeInline(_ImageInlineBase):
    model = BuildFacadeImage
    verbose_name = "Схема фасада"
    verbose_name_plural = "Схемы фасадов"


class BuildFAQInline(StackedInline):
    """Вопросы-ответы по конкретному проекту.

    Эти Q&A:
    - показываются на странице билда отдельной секцией;
    - попадают в FAQPage schema.org — дают rich snippets в выдаче
      Google (раскрывающиеся вопросы под основной ссылкой).
    """

    model = BuildFAQ
    extra = 0
    tab = True
    fields = ("question", "answer", "order", "is_published")
    ordering = ("order", "id")
    verbose_name = "Вопрос-ответ"
    verbose_name_plural = "Вопросы и ответы по проекту"


class _BaseSpecsInline(StackedInline):
    """Стек: над каждым input'ом «Значение» отображается название
    характеристики (как заголовок), затем поле ввода, потом отступ
    до следующей характеристики."""

    model = BuildSpecValue
    extra = 0
    can_delete = False
    fields = ("characteristic", "value")
    readonly_fields = ("characteristic",)
    ordering = ("key__order", "id")
    tab = True

    section_code: str = ""

    def has_add_permission(self, request, obj=None):
        return False

    def characteristic(self, obj):
        return obj.key.title if obj.key_id else "—"
    characteristic.short_description = "Характеристика"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if self.section_code:
            qs = qs.select_related("key").filter(key__section=self.section_code)
        else:
            qs = qs.select_related("key")
        return qs


class MainSpecsInline(_BaseSpecsInline):
    section_code = SpecKey.SECTION_MAIN
    verbose_name = "Основная характеристика"
    verbose_name_plural = "Основные характеристики"


class NetworksSpecsInline(_BaseSpecsInline):
    section_code = SpecKey.SECTION_NETWORKS
    verbose_name = "Подключение к сетям"
    verbose_name_plural = "Подключение к сетям"


class LayoutSpecsInline(_BaseSpecsInline):
    section_code = SpecKey.SECTION_LAYOUT
    verbose_name = "Объёмно-планировочное решение"
    verbose_name_plural = "Планировка"


class StructSpecsInline(_BaseSpecsInline):
    section_code = SpecKey.SECTION_STRUCT
    verbose_name = "Конструктивное решение"
    verbose_name_plural = "Конструкция"


class BuildEstimateInline(StackedInline):
    model = BuildEstimateValue
    extra = 0
    can_delete = False
    fields = ("stage_title", "materials_cost", "works_cost")
    readonly_fields = ("stage_title",)
    ordering = ("stage__order", "id")
    tab = True
    verbose_name = "Этап сметы"
    verbose_name_plural = "Смета"

    def has_add_permission(self, request, obj=None):
        return False

    def stage_title(self, obj):
        return obj.stage.title if obj.stage_id else "—"
    stage_title.short_description = "Этап"


class BuildAdmin(ModelAdmin):
    list_display = (
        "cover_thumb", "title", "status", "area", "floors", "price",
        "is_typical", "is_published", "is_featured", "updated_at",
    )
    list_display_links = ("cover_thumb", "title")

    def cover_thumb(self, obj):
        first = obj.images.order_by("order", "id").first()
        return _thumb(first.image.url if first and first.image else None, size=44)
    cover_thumb.short_description = "Фото"
    list_filter = (
        "status", "is_typical", "is_published", "is_featured",
        "available_in_settlement", "available_on_client_land",
    )
    search_fields = ("title", "slug", "plot_number")
    prepopulated_fields = {"slug": ("title",)}
    save_on_top = True
    list_per_page = 30

    fieldsets = (
        ("Основное", {
            "fields": (
                "title", "slug", "status", "is_typical",
                "is_published", "is_featured",
            ),
        }),
        ("Параметры дома", {
            "fields": ("area", "floors", "bedrooms", "price"),
        }),
        ("Расположение", {
            "fields": (
                "plot_number",
                "available_in_settlement", "available_on_client_land",
            ),
        }),
        ("Описания", {
            "fields": ("short_description", "description"),
        }),
    )

    image_inlines = [BuildImageInline, BuildFloorPlanInline, BuildFacadeInline]
    detail_inlines = image_inlines + [
        MainSpecsInline, NetworksSpecsInline,
        LayoutSpecsInline, StructSpecsInline,
        BuildEstimateInline,
        BuildFAQInline,
    ]
    inlines = detail_inlines

    def get_inlines(self, request, obj=None):
        # При создании нового Build не показываем inline'ы характеристик и сметы:
        # они автоматически создаются post_save-сигналом с дефолтами SpecKey,
        # потом будут доступны для редактирования.
        if obj is None:
            return self.image_inlines
        return self.detail_inlines

    def response_add(self, request, obj, post_url_continue=None):
        """После создания нового проекта всегда открываем форму редактирования —
        чтобы пользователь сразу увидел вкладки характеристик и сметы,
        которые post_save-сигнал только что создал."""
        if "_addanother" not in request.POST:
            request.POST = request.POST.copy()
            request.POST["_continue"] = "1"
        return super().response_add(request, obj, post_url_continue)

    actions = ["duplicate_build"]

    def duplicate_build(self, request, queryset):
        created = 0
        for b in queryset:
            spec_vals = list(b.spec_values.values("key_id", "value"))
            est_vals = list(b.estimate_values.values(
                "stage_id", "materials_cost", "works_cost",
            ))
            b.pk = None
            b.title = f"{b.title} (копия)"
            b.slug = f"{b.slug}-copy"
            b.is_published = False
            b.save()  # post_save сигнал создаст стандартные строки
            for sv in spec_vals:
                BuildSpecValue.objects.update_or_create(
                    build=b, key_id=sv["key_id"],
                    defaults={"value": sv["value"]},
                )
            for ev in est_vals:
                BuildEstimateValue.objects.update_or_create(
                    build=b, stage_id=ev["stage_id"],
                    defaults={
                        "materials_cost": ev["materials_cost"],
                        "works_cost": ev["works_cost"],
                    },
                )
            created += 1
        self.message_user(
            request,
            f"Создано копий: {created} (черновики, фото не копируются)",
        )
    duplicate_build.short_description = "Дублировать выбранные проекты (без фото)"


class SpecKeyAdmin(ModelAdmin):
    list_display = ("title", "section", "default_value", "order")
    list_display_links = ("title",)
    list_editable = ("default_value", "order")
    list_filter = ("section",)
    search_fields = ("title",)
    ordering = ("section", "order", "id")
    save_on_top = True


class EstimateStageAdmin(ModelAdmin):
    list_display = ("title", "order")
    list_display_links = ("title",)
    list_editable = ("order",)
    search_fields = ("title",)
    ordering = ("order", "id")
    save_on_top = True


from django.contrib import admin  # noqa: E402  (admin.site используется для регистрации)
admin.site.register(Build, BuildAdmin)
admin.site.register(SpecKey, SpecKeyAdmin)
admin.site.register(EstimateStage, EstimateStageAdmin)
