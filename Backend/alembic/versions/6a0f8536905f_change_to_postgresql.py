"""Change to postgresql

Revision ID: 6a0f8536905f
Revises: d9a30bb74c3f
Create Date: 2026-02-28 09:05:50.363187

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6a0f8536905f'
down_revision: Union[str, Sequence[str], None] = 'd9a30bb74c3f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
