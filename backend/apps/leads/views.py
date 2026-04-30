from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response

from .models import Lead
from .serializers import LeadCreateSerializer


def _client_ip(request) -> str | None:
    fwd = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _notify(lead: Lead) -> None:
    to = settings.LEADS_NOTIFY_EMAIL
    if not to:
        return
    subject = f"[Ремстрой] Новая заявка: {lead.name}"
    body_lines = [
        f"Имя: {lead.name}",
        f"Телефон: {lead.phone}",
        f"Email: {lead.email or '—'}",
        f"Источник: {lead.get_source_display()}",
        f"Проект: {lead.build.title if lead.build_id else '—'}",
        f"Страница: {lead.page_url or '—'}",
        f"UTM: {lead.utm_source}/{lead.utm_medium}/{lead.utm_campaign}",
        "",
        "Сообщение:",
        lead.message or "—",
    ]
    send_mail(
        subject=subject,
        message="\n".join(body_lines),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to],
        fail_silently=True,
    )


class LeadCreateView(CreateAPIView):
    serializer_class = LeadCreateSerializer
    throttle_scope = "leads"
    # Public endpoint — не требуем session/CSRF/auth.
    # Защита: throttle 5/min + honeypot-поле + 152-ФЗ-чекбокс на фронте.
    authentication_classes = []
    permission_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        # Если honeypot заполнен — отвечаем ok, но в БД ничего не пишем
        if not serializer.is_valid(raise_exception=False):
            errors = serializer.errors
            if "website" in errors:
                return Response({"ok": True}, status=status.HTTP_201_CREATED)
            # остальные ошибки валидации — обычный 400
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        # honeypot-поле не сохраняем в модель — отделяем
        validated = dict(serializer.validated_data)
        validated.pop("website", None)
        lead = Lead.objects.create(
            **validated,
            ip=_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:300],
        )
        _notify(lead)
        return Response({"ok": True, "id": lead.id}, status=status.HTTP_201_CREATED)
