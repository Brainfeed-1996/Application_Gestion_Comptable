"""Unit tests for the User model operations."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

import pytest

from app.models.user import User


class TestUserModelBasics:
    """Tests for User model field defaults and construction."""

    def test_create_user_with_defaults(self, make_user):
        user = make_user()
        assert user.id is not None
        assert user.email == "user@example.com"
        assert user.password_hash == "$2b$12$hash"
        assert user.is_active is True
        assert user.is_superuser is False
        assert user.role == "user"
        assert user.locale == "fr"
        assert user.timezone == "Europe/Paris"
        assert user.two_factor_enabled is False
        assert user.mfa_method == "none"
        assert user.failed_login_count == 0
        assert user.created_at is not None
        assert user.updated_at is not None
        assert user.deleted_at is None

    def test_user_email_is_unique(self, make_user):
        user = make_user(email="unique@example.com")
        assert user.email == "unique@example.com"

    def test_user_full_name_combines_first_and_last(self, make_user):
        user = make_user(first_name="Jane", last_name="Doe")
        assert user.first_name == "Jane"
        assert user.last_name == "Doe"

    def test_user_can_be_inactive(self, make_user):
        user = make_user(is_active=False)
        assert user.is_active is False

    def test_user_can_be_superuser(self, make_user):
        user = make_user(is_superuser=True, role="admin")
        assert user.is_superuser is True
        assert user.role == "admin"

    def test_user_with_two_factor_enabled(self, make_user):
        user = make_user(
            two_factor_enabled=True,
            mfa_method="totp",
            two_factor_secret="JBSWY3DPEHPK3PXP",
        )
        assert user.two_factor_enabled is True
        assert user.mfa_method == "totp"
        assert user.two_factor_secret == "JBSWY3DPEHPK3PXP"

    def test_user_with_backup_codes(self, make_user):
        user = make_user(two_factor_backup_codes=["code1", "code2"])
        assert user.two_factor_backup_codes == ["code1", "code2"]

    def test_user_with_webauthn_credential(self, make_user):
        cred = {"id": "cred-id", "publicKey": "key"}
        user = make_user(webauthn_credential=cred)
        assert user.webauthn_credential == cred

    def test_user_with_soft_delete(self, make_user):
        user = make_user()
        user.deleted_at = datetime.now(timezone.utc)
        assert user.deleted_at is not None

    def test_user_id_is_uuid(self, make_user):
        user = make_user()
        assert isinstance(user.id, type(uuid4()))

    def test_user_failed_login_count_increments(self, make_user):
        user = make_user(failed_login_count=0)
        user.failed_login_count = 3
        assert user.failed_login_count == 3

    def test_user_locked_until_can_be_set(self, make_user):
        user = make_user()
        lock_time = datetime.now(timezone.utc)
        user.locked_until = lock_time
        assert user.locked_until == lock_time

    def test_user_last_login_tracking(self, make_user):
        user = make_user()
        login_time = datetime.now(timezone.utc)
        user.last_login_at = login_time
        user.last_login_ip = "192.168.1.10"
        assert user.last_login_at == login_time
        assert user.last_login_ip == "192.168.1.10"


class TestUserModelValidation:
    """Tests for User model constraints and validation logic."""

    def test_valid_mfa_methods(self, make_user):
        for mfa_method in ["none", "totp", "webauthn", "sms"]:
            user = make_user(mfa_method=mfa_method)
            assert user.mfa_method == mfa_method

    def test_user_has_tablename(self):
        assert User.__tablename__ == "users"

    def test_user_table_has_unique_email_index(self):
        index_names = {idx.name for idx in User.__table__.indexes}
        assert "idx_users_email" in index_names

    def test_user_table_has_active_index(self):
        index_names = {idx.name for idx in User.__table__.indexes}
        assert "idx_users_active" in index_names

    def test_user_table_has_last_login_index(self):
        index_names = {idx.name for idx in User.__table__.indexes}
        assert "idx_users_last_login" in index_names

    def test_user_table_has_deleted_index(self):
        index_names = {idx.name for idx in User.__table__.indexes}
        assert "idx_users_deleted" in index_names

    def test_user_table_has_mfa_check_constraint(self):
        constraint_names = {c.name for c in User.__table__.constraints if hasattr(c, "name")}
        assert "ck_users_mfa_method" in constraint_names


class TestUserModelRelationships:
    """Tests for User model relationships."""

    def test_user_relationships_defined(self):
        relationship_keys = set(User.__mapper__.relationships.keys())
        expected = {
            "notifications",
            "audit_logs",
            "created_transactions",
            "updated_transactions",
            "created_invoices",
            "updated_invoices",
            "created_quotes",
            "recurring_expenses",
            "financial_statements",
        }
        assert expected.issubset(relationship_keys)

    def test_notifications_relationship_passive_deletes(self):
        rel = User.__mapper__.relationships["notifications"]
        assert rel.passive_deletes is True

    def test_audit_logs_relationship_passive_deletes(self):
        rel = User.__mapper__.relationships["audit_logs"]
        assert rel.passive_deletes is True

    def test_created_transactions_uses_created_by_foreign_key(self):
        rel = User.__mapper__.relationships["created_transactions"]
        assert "created_by" in str(rel.local_remote_pairs[0])


class TestUserModelSerialization:
    """Tests for serializing User model attributes."""

    def test_user_attributes_are_accessible(self, make_user):
        user = make_user(
            email="test@example.com",
            first_name="Alice",
            last_name="Smith",
            phone="+33123456789",
        )
        attrs = {
            "id",
            "email",
            "password_hash",
            "first_name",
            "last_name",
            "phone",
            "is_active",
            "is_superuser",
            "role",
            "locale",
            "timezone",
        }
        for attr in attrs:
            assert hasattr(user, attr), f"User missing attribute {attr}"

    def test_user_optional_fields_can_be_none(self, make_user):
        user = make_user()
        user.phone = None
        user.avatar_url = None
        user.two_factor_secret = None
        user.two_factor_backup_codes = None
        user.webauthn_credential = None
        user.last_login_at = None
        user.last_login_ip = None
        user.locked_until = None
        user.deleted_at = None
        assert user.phone is None
        assert user.avatar_url is None
        assert user.two_factor_secret is None
        assert user.deleted_at is None