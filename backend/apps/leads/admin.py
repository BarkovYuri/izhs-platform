from django.contrib import admin

from unfold.admin import ModelAdmin

from .models import Lead


@admin.register(Lead)
class LeadAdmin(ModelAdmin):
    list_display = ("name", "phone", "build", "source", "status", "created_at")
    list_display_links = ("name",)
    list_filter = ("status", "source", "created_at")
    search_fields = ("name", "phone", "email", "message", "notes")
    list_editable = ("status",)
    list_per_page = 30
    date_hierarchy = "created_at"
    save_on_top = True
    readonly_fields = ("ip", "user_agent", "created_at", "updated_at",
                       "utm_source", "utm_medium", "utm_campaign", "page_url")
    fieldsets = (
        ("Клиент", {"fields": ("name", "phone", "email", "message")}),
        ("Контекст", {"fields": ("build", "source", "page_url",
                                  "utm_source", "utm_medium", "utm_campaign")}),
        ("Работа", {"fields": ("status", "notes")}),
        ("Техническое", {"fields": ("ip", "user_agent", "created_at", "updated_at"),
                         "classes": ("collapse",)}),
    )

    actions = ["mark_in_progress", "mark_done", "mark_spam"]

    @admin.action(description="Перевести в работу")
    def mark_in_progress(self, request, queryset):
        n = queryset.update(status=Lead.STATUS_IN_PROGRESS)
        self.message_user(request, f"{n} заявок переведено в работу")

    @admin.action(description="Закрыть заявки")
    def mark_done(self, request, queryset):
        n = queryset.update(status=Lead.STATUS_DONE)
        self.message_user(request, f"{n} заявок закрыто")

    @admin.action(description="Пометить как спам")
    def mark_spam(self, request, queryset):
        n = queryset.update(status=Lead.STATUS_SPAM)
        self.message_user(request, f"{n} заявок помечено как спам")
