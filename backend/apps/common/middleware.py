"""Middleware для проекта."""


class NoCacheApiMiddleware:
    """Запрещает кэширование GET-ответов /api/* на стороне браузера/прокси.

    Без этого Safari/Chrome могли кэшировать ответы /api/faq/, /api/builds/
    и т.п. на часы → пользователь правил данные в админке, но видел старое
    через CDN/локальный browser cache.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.method == "GET" and request.path.startswith("/api/"):
            response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"
        return response
