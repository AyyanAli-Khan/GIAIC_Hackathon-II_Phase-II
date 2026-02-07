"""Initial todo table

Revision ID: 001
Revises:
Create Date: 2026-02-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create todo table
    op.create_table(
        'todo',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

    # Create indexes
    op.create_index('ix_todo_user_id', 'todo', ['user_id'])
    op.create_index('ix_todo_user_id_created_at', 'todo', ['user_id', 'created_at'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_todo_user_id_created_at', table_name='todo')
    op.drop_index('ix_todo_user_id', table_name='todo')

    # Drop table
    op.drop_table('todo')
