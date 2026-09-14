"""Add balance sheet template models

Revision ID: 20260913_add_balance_sheet_models
Revises: 
Create Date: 2026-09-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260913_add_balance_sheet_models'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create balance_sheet_templates table
    op.create_table(
        'balance_sheet_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('business_type', sa.String(30), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('structure', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_balance_sheet_templates_org', 'balance_sheet_templates', ['organization_id'])
    op.create_index('idx_balance_sheet_templates_business_type', 'balance_sheet_templates', ['business_type'])
    op.create_index('idx_balance_sheet_templates_active', 'balance_sheet_templates', ['is_active'], postgresql_where=sa.text('is_active = true'))
    op.create_index('idx_balance_sheet_templates_default', 'balance_sheet_templates', ['is_default'], postgresql_where=sa.text('is_default = true'))
    op.create_check_constraint(
        'ck_balance_sheet_templates_business_type',
        'balance_sheet_templates',
        "business_type IN ('SARL', 'SAS', 'EI', 'SCI', 'SA', 'SNC', 'SCP', 'EURL', 'SASU', 'ASSOCIATION', 'OTHER')"
    )

    # Create balance_sheet_drafts table
    op.create_table(
        'balance_sheet_drafts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('template_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('fiscal_year', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default=sa.text("'draft'")),
        sa.Column('data', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'")),
        sa.Column('calculated_totals', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['template_id'], ['balance_sheet_templates.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_balance_sheet_drafts_org', 'balance_sheet_drafts', ['organization_id'])
    op.create_index('idx_balance_sheet_drafts_template', 'balance_sheet_drafts', ['template_id'])
    op.create_index('idx_balance_sheet_drafts_fiscal_year', 'balance_sheet_drafts', ['fiscal_year'])
    op.create_index('idx_balance_sheet_drafts_status', 'balance_sheet_drafts', ['status'])
    op.create_index('idx_balance_sheet_drafts_deleted', 'balance_sheet_drafts', ['deleted_at'], postgresql_where=sa.text('deleted_at IS NULL'))
    op.create_check_constraint(
        'ck_balance_sheet_drafts_status',
        'balance_sheet_drafts',
        "status IN ('draft', 'completed', 'archived')"
    )

    # Create balance_sheet_items table
    op.create_table(
        'balance_sheet_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('draft_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('category', sa.String(20), nullable=False),
        sa.Column('account_code', sa.String(20), nullable=False),
        sa.Column('account_name', sa.String(255), nullable=False),
        sa.Column('amount', sa.Numeric(15, 2), nullable=False, server_default=sa.text('0')),
        sa.Column('is_calculated', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['draft_id'], ['balance_sheet_drafts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_balance_sheet_items_draft', 'balance_sheet_items', ['draft_id'])
    op.create_index('idx_balance_sheet_items_category', 'balance_sheet_items', ['draft_id', 'category'])
    op.create_index('idx_balance_sheet_items_account_code', 'balance_sheet_items', ['account_code'])
    op.create_check_constraint(
        'ck_balance_sheet_items_category',
        'balance_sheet_items',
        "category IN ('asset', 'liability', 'equity')"
    )


def downgrade() -> None:
    op.drop_table('balance_sheet_items')
    op.drop_table('balance_sheet_drafts')
    op.drop_table('balance_sheet_templates')