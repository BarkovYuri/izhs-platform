from rest_framework import serializers
from .models import Lead


class LeadCreateSerializer(serializers.ModelSerializer):
    # Honeypot: скрытое поле в форме. Бот его заполнит, человек — нет.
    # Если значение есть — просто молча принимаем заявку и ничего не пишем в БД.
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

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
