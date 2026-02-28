"""new order structure

Revision ID: 591f11d3db78
Revises: 7f14c3a58da0
Create Date: 2026-02-28 15:02:25.325945

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '591f11d3db78'
down_revision: Union[str, Sequence[str], None] = '7f14c3a58da0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
