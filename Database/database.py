from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy_utils.types import ChoiceType
import bcrypt

db = create_engine('sqlite:///database.db')
Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column("id", Integer, primary_key=True, autoincrement=True, nullable=False)
    username = Column("name", String(50), nullable=False)
    email = Column("email", String(50), unique=True, nullable=False)
    password = Column("senha", String(500), nullable=False)
    active = Column("ativo", Boolean, nullable=False)
    admin = Column("admin", Boolean, default=False)

    def __init__(self, name, email, senha, ativo, admin):
        self.name = name
        self.email = email
        self.senha = senha
        self.ativo = ativo
        self.admin = admin
