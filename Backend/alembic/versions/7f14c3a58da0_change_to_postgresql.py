"""Change to postgresql

Revision ID: 7f14c3a58da0
Revises: 25bbaf0585b9
Create Date: 2026-02-28 09:11:34.832509

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f14c3a58da0'
down_revision: Union[str, Sequence[str], None] = '25bbaf0585b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
