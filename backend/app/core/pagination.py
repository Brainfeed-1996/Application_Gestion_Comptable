from typing import Any, Optional
from sqlalchemy import Select, func, or_
from sqlalchemy.sql import Selectable


def paginate_query(
    query: Selectable,
    page: int,
    limit: int,
    search: Optional[str] = None,
    search_fields: Optional[list[str]] = None
) -> tuple[Selectable, int]:
    if page < 1:
        page = 1
    if limit < 1:
        limit = 1
    if limit > 100:
        limit = 100

    if search and search_fields:
        conditions = []
        for field in search_fields:
            column = getattr(query.column_descriptions[0]["entity"], field, None)
            if column is not None:
                conditions.append(column.ilike(f"%{search}%"))
        if conditions:
            query = query.where(or_(*conditions))

    total_query = query.with_only_columns(func.count()).order_by(None)
    total = 0

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    return query, total


def build_pagination_meta(page: int, limit: int, total: int) -> dict[str, Any]:
    total_pages = (total + limit - 1) // limit if total > 0 else 0
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages
    }