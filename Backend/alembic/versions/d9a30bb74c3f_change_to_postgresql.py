"""Change to postgresql

Revision ID: d9a30bb74c3f
Revises: 67f094abb1b8
Create Date: 2026-02-27 23:10:32.047489

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd9a30bb74c3f'
down_revision: Union[str, Sequence[str], None] = '67f094abb1b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
