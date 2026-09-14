import traceback
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppException


def setup_error_handlers(app: FastAPI) -> None:
    """Register enhanced error handlers on the FastAPI application."""

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        log_error(request, exc)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail},
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(HTTPException)
    async def handle_fastapi_http_exception(request: Request, exc: HTTPException) -> JSONResponse:
        log_error(request, exc)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail},
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = format_validation_errors(exc.errors())
        log_error(request, exc, extra={"errors": errors})
        return JSONResponse(
            status_code=422,
            content={"error": "Validation error", "details": errors},
        )

    @app.exception_handler(ValidationError)
    async def handle_pydantic_validation_error(request: Request, exc: ValidationError) -> JSONResponse:
        errors = format_validation_errors(exc.errors())
        log_error(request, exc, extra={"errors": errors})
        return JSONResponse(
            status_code=422,
            content={"error": "Validation error", "details": errors},
        )

    @app.exception_handler(AppException)
    async def handle_app_exception(request: Request, exc: AppException) -> JSONResponse:
        log_error(request, exc)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail},
            headers=exc.headers or None,
        )

    @app.exception_handler(SQLAlchemyError)
    async def handle_sqlalchemy_error(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        log_error(request, exc)
        return JSONResponse(
            status_code=500,
            content={"error": "Database error occurred"},
        )

    @app.exception_handler(Exception)
    async def handle_generic_exception(request: Request, exc: Exception) -> JSONResponse:
        log_error(request, exc)
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"},
        )


def format_validation_errors(errors: list[dict[str, Any]]) -> list[dict[str, Any]]:
    formatted = []
    for err in errors:
        formatted.append({
            "field": ".".join(str(loc) for loc in err.get("loc", [])),
            "message": err.get("msg", ""),
            "type": err.get("type", ""),
        })
    return formatted


def log_error(request: Request, exc: Exception, extra: dict[str, Any] | None = None) -> None:
    import logging

    logger = logging.getLogger("app.errors")
    context = {
        "method": request.method,
        "url": str(request.url),
        "path": request.url.path,
        "error": str(exc),
        "error_type": type(exc).__name__,
        "traceback": traceback.format_exc(),
    }
    if extra:
        context.update(extra)
    logger.error("Request error: %s", context)