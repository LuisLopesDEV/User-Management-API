from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import declarative_base, relationship

db = create_engine("mysql+pymysql://root:@localhost:3306/App")
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column("id", Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column("name", String(50), nullable=False)
    email = Column("email", String(50), unique=True, nullable=False)
    senha = Column("senha", String(500), nullable=False)
    ativo = Column("ativo", Boolean, nullable=False)
    remember = Column("remember", Boolean, nullable=False)
    admin = Column("admin", Boolean, default=False)

    tokens = relationship("Token", back_populates="user")
    orders = relationship("Order", back_populates="user")

    def __init__(self, name, email, senha, ativo, remember, admin):
        self.name = name
        self.email = email
        self.senha = senha
        self.ativo = ativo
        self.remember = remember
        self.admin = admin


class Token(Base):
    __tablename__ = 'tokens'

    token = Column(String(200), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="tokens")
    def __init__(self, token, user_id, expires_at, is_active=True):
        self.token = token
        self.user_id = user_id
        self.expires_at = expires_at
        self.is_active = is_active


class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    item = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    user = relationship("User", back_populates="orders")

    def __init__(self, user_id, item, quantity, price):
        self.user_id = user_id
        self.item = item
        self.quantity = quantity
        self.price = price
