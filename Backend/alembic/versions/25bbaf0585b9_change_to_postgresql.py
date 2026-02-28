"""Change to postgresql

Revision ID: 25bbaf0585b9
Revises: 6a0f8536905f
Create Date: 2026-02-28 09:08:59.277878

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '25bbaf0585b9'
down_revision: Union[str, Sequence[str], None] = '6a0f8536905f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
