from typing import Optional


class AppException(Exception):
    def __init__(
        self,
        detail: str,
        status_code: int = 500,
        headers: Optional[dict] = None
    ):
        self.detail = detail
        self.status_code = status_code
        self.headers = headers or {}
        super().__init__(detail)


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Unauthorized", headers: Optional[dict] = None):
        super().__init__(detail, status_code=401, headers=headers or {"WWW-Authenticate": "Bearer"})


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Forbidden", headers: Optional[dict] = None):
        super().__init__(detail, status_code=403, headers=headers)


class NotFoundException(AppException):
    def __init__(self, detail: str = "Not found", headers: Optional[dict] = None):
        super().__init__(detail, status_code=404, headers=headers)


class ConflictException(AppException):
    def __init__(self, detail: str = "Conflict", headers: Optional[dict] = None):
        super().__init__(detail, status_code=409, headers=headers)


class ValidationException(AppException):
    def __init__(self, detail: str = "Validation error", headers: Optional[dict] = None):
        super().__init__(detail, status_code=422, headers=headers)


class RateLimitException(AppException):
    def __init__(self, detail: str = "Rate limit exceeded", headers: Optional[dict] = None):
        super().__init__(detail, status_code=429, headers=headers or {"Retry-After": "60"})


class ServiceUnavailableException(AppException):
    def __init__(self, detail: str = "Service unavailable", headers: Optional[dict] = None):
        super().__init__(detail, status_code=503, headers=headers)