from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import declarative_base, relationship
from Backend.config import DATABASE_URL

db = create_engine(DATABASE_URL, pool_pre_ping=True)
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
    locals = relationship("Local", back_populates="user")
    
    def __init__(self, name, email, senha, ativo, remember, admin):
        self.name = name
        self.email = email
        self.senha = senha
        self.ativo = ativo
        self.remember = remember
        self.admin = admin

class Local(Base):
    __tablename__ = 'locals'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    cep = Column(String(9), nullable=False)
    city = Column(String(50), nullable=False)
    neighborhood = Column(String(50), nullable=False)  
    street = Column(String(100), nullable=False)
    number = Column(String(10), nullable=False)
    complement = Column(String(100), nullable=True)

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user = relationship("User", back_populates="locals")

    def __init__(self, cep, city, neighborhood, street, number, complement=None):
        self.cep = cep
        self.city = city
        self.neighborhood = neighborhood
        self.street = street
        self.number = number
        self.complement = complement

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
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    items = relationship("OrderItem", back_populates="order")
    user = relationship("User", back_populates="orders")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"))

    product_id = Column(String)
    qty = Column(Integer)
    size_id = Column(String, nullable=True)
    addon_id = Column(String, nullable=True)

    order = relationship("Order", back_populates="items")
    