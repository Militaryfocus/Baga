from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

# db будет инициализирован в app.py

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    level = db.Column(db.Integer, default=1)
    experience = db.Column(db.Integer, default=0)
    avatar_url = db.Column(db.String(200))
    bio = db.Column(db.Text)
    
    # Связи
    posts = db.relationship('Post', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='author', lazy=True)
    achievements = db.relationship('UserAchievement', backref='user', lazy=True)
    ratings = db.relationship('Rating', backref='user', lazy=True)

class Hero(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # Tank, Fighter, Assassin, Mage, Marksman, Support
    specialty = db.Column(db.String(100), nullable=False)  # Charge, Burst, Regen, Push, etc.
    difficulty = db.Column(db.String(20), nullable=False)  # Easy, Medium, Hard
    rating = db.Column(db.Float, default=0.0)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(200))
    skills = db.Column(db.Text)  # JSON строка с навыками
    stats = db.Column(db.Text)  # JSON строка со статистикой
    
    # Связи
    posts = db.relationship('Post', backref='hero', lazy=True)
    ratings = db.relationship('Rating', backref='hero', lazy=True)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    is_pinned = db.Column(db.Boolean, default=False)
    
    # Внешние ключи
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    hero_id = db.Column(db.Integer, db.ForeignKey('hero.id'))
    
    # Связи
    comments = db.relationship('Comment', backref='post', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    
    # Внешние ключи
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon_url = db.Column(db.String(200))
    points = db.Column(db.Integer, default=10)
    category = db.Column(db.String(50))  # Community, Hero, Game, etc.
    
    # Связи
    user_achievements = db.relationship('UserAchievement', backref='achievement', lazy=True)

class UserAchievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Внешние ключи
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'), nullable=False)

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 звезд
    review = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Внешние ключи
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    hero_id = db.Column(db.Integer, db.ForeignKey('hero.id'), nullable=False)
    
    # Уникальность: один пользователь может оценить героя только один раз
    __table_args__ = (db.UniqueConstraint('user_id', 'hero_id'),)