import re

from rest_framework import serializers
from .models import Lead


class LeadCreateSerializer(serializers.ModelSerializer):
    # Honeypot: скрытое поле в форме. Бот его заполнит, человек — нет.
    # Если значение есть — просто молча принимаем заявку и ничего не пишем в БД.
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate_phone(self, value: str) -> str:
        """Жёсткая проверка номера: 10-15 цифр (без учёта форматирования).
        Защита от заявок с phone='123'."""
        digits = re.sub(r"\D", "", value or "")
        if len(digits) < 10 or len(digits) > 15:
            raise serializers.ValidationError(
                "Введите корректный номер телефона (минимум 10 цифр).",
            )
        return value.strip()

    def validate_name(self, value: str) -> str:
        v = (value or "").strip()
        if len(v) < 2:
            raise serializers.ValidationError("Имя должно содержать минимум 2 символа.")
        return v

    class Meta:
        model = Lead
        fields = (
            "name", "phone", "email", "message",
            "build", "source", "page_url",
            "utm_source", "utm_medium", "utm_campaign",
            "website",
        )
        extra_kwargs = {
            "email": {"required": False, "allow_blank": True},
            "message": {"required": False, "allow_blank": True},
            "build": {"required": False, "allow_null": True},
            "page_url": {"required": False, "allow_blank": True},
            "utm_source": {"required": False, "allow_blank": True},
            "utm_medium": {"required": False, "allow_blank": True},
            "utm_campaign": {"required": False, "allow_blank": True},
            "source": {"required": False},
        }

    def validate_website(self, value):
        # Если honeypot заполнен — это бот; молча останавливаем
        if value:
            raise serializers.ValidationError("spam detected")
        return value
