from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///mobile_legends_community.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Модели данных
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

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Главная страница
@app.route('/')
def index():
    recent_posts = Post.query.order_by(Post.created_at.desc()).limit(6).all()
    top_heroes = Hero.query.order_by(Hero.rating.desc()).limit(5).all()
    return render_template('index.html', posts=recent_posts, heroes=top_heroes)

# Регистрация
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Пользователь с таким именем уже существует!')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Пользователь с таким email уже существует!')
            return redirect(url_for('register'))
        
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
        
        flash('Регистрация прошла успешно!')
        return redirect(url_for('login'))
    
    return render_template('register.html')

# Вход
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash('Неверное имя пользователя или пароль!')
    
    return render_template('login.html')

# Выход
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

# Профиль пользователя
@app.route('/profile/<username>')
def profile(username):
    user = User.query.filter_by(username=username).first_or_404()
    posts = Post.query.filter_by(author_id=user.id).order_by(Post.created_at.desc()).all()
    achievements = UserAchievement.query.filter_by(user_id=user.id).all()
    return render_template('profile.html', user=user, posts=posts, achievements=achievements)

# Список героев
@app.route('/heroes')
def heroes():
    heroes = Hero.query.order_by(Hero.name).all()
    return render_template('heroes.html', heroes=heroes)

# Детали героя
@app.route('/hero/<int:hero_id>')
def hero_detail(hero_id):
    hero = Hero.query.get_or_404(hero_id)
    posts = Post.query.filter_by(hero_id=hero_id).order_by(Post.created_at.desc()).all()
    return render_template('hero_detail.html', hero=hero, posts=posts)

# Создание поста
@app.route('/create_post', methods=['GET', 'POST'])
@login_required
def create_post():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        hero_id = request.form.get('hero_id')
        
        post = Post(
            title=title,
            content=content,
            author_id=current_user.id,
            hero_id=hero_id if hero_id else None
        )
        db.session.add(post)
        db.session.commit()
        
        flash('Пост создан успешно!')
        return redirect(url_for('index'))
    
    heroes = Hero.query.order_by(Hero.name).all()
    return render_template('create_post.html', heroes=heroes)

# Детали поста
@app.route('/post/<int:post_id>')
def post_detail(post_id):
    post = Post.query.get_or_404(post_id)
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    return render_template('post_detail.html', post=post, comments=comments)

# Добавление комментария
@app.route('/add_comment/<int:post_id>', methods=['POST'])
@login_required
def add_comment(post_id):
    content = request.form['content']
    comment = Comment(
        content=content,
        author_id=current_user.id,
        post_id=post_id
    )
    db.session.add(comment)
    db.session.commit()
    
    return redirect(url_for('post_detail', post_id=post_id))

# Оценка героя
@app.route('/rate_hero/<int:hero_id>', methods=['POST'])
@login_required
def rate_hero(hero_id):
    rating_value = int(request.form['rating'])
    review = request.form.get('review', '')
    
    # Проверяем, не оценивал ли уже пользователь этого героя
    existing_rating = Rating.query.filter_by(user_id=current_user.id, hero_id=hero_id).first()
    
    if existing_rating:
        existing_rating.rating = rating_value
        existing_rating.review = review
    else:
        rating = Rating(
            rating=rating_value,
            review=review,
            user_id=current_user.id,
            hero_id=hero_id
        )
        db.session.add(rating)
    
    db.session.commit()
    
    # Обновляем средний рейтинг героя
    hero = Hero.query.get(hero_id)
    hero_ratings = Rating.query.filter_by(hero_id=hero_id).all()
    if hero_ratings:
        avg_rating = sum(r.rating for r in hero_ratings) / len(hero_ratings)
        hero.rating = round(avg_rating, 1)
        db.session.commit()
    
    flash('Спасибо за оценку!')
    return redirect(url_for('hero_detail', hero_id=hero_id))

# API для получения данных
@app.route('/api/heroes')
def api_heroes():
    heroes = Hero.query.all()
    return jsonify([{
        'id': hero.id,
        'name': hero.name,
        'role': hero.role,
        'specialty': hero.specialty,
        'rating': hero.rating,
        'description': hero.description
    } for hero in heroes])

@app.route('/api/posts')
def api_posts():
    posts = Post.query.order_by(Post.created_at.desc()).limit(20).all()
    return jsonify([{
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'author': post.author.username,
        'created_at': post.created_at.isoformat(),
        'hero': post.hero.name if post.hero else None
    } for post in posts])

def create_sample_data():
    # Проверяем, есть ли уже данные
    if User.query.first():
        return
    
    # Создаем тестовых пользователей
    users = [
        User(
            username='MLPro',
            email='mlpro@example.com',
            password_hash=generate_password_hash('password123'),
            level=25,
            experience=15000,
            bio='Профессиональный игрок Mobile Legends'
        ),
        User(
            username='HeroMaster',
            email='heromaster@example.com',
            password_hash=generate_password_hash('password123'),
            level=30,
            experience=25000,
            bio='Эксперт по героям и стратегиям'
        ),
        User(
            username='NewbiePlayer',
            email='newbie@example.com',
            password_hash=generate_password_hash('password123'),
            level=5,
            experience=500,
            bio='Новичок в игре, изучаю основы'
        )
    ]
    
    for user in users:
        db.session.add(user)
    
    # Создаем героев Mobile Legends
    heroes_data = [
        {
            'name': 'Layla',
            'role': 'Marksman',
            'specialty': 'Reap',
            'difficulty': 'Easy',
            'description': 'Layla - это герой дальнего боя с высоким уроном. Идеально подходит для новичков.',
            'skills': json.dumps({
                'passive': 'Malefic Gun - Увеличивает дальность атаки',
                'skill1': 'Malefic Bomb - Взрывной снаряд',
                'skill2': 'Void Projectile - Проектиль пустоты',
                'ultimate': 'Destruction Rush - Разрушительный рывок'
            }),
            'stats': json.dumps({
                'hp': 2500,
                'mana': 500,
                'physical_attack': 120,
                'magic_power': 0,
                'armor': 15,
                'magic_resistance': 10,
                'attack_speed': 0.8,
                'movement_speed': 260
            })
        },
        {
            'name': 'Tigreal',
            'role': 'Tank',
            'specialty': 'Initiator',
            'difficulty': 'Easy',
            'description': 'Tigreal - мощный танк с отличными способностями контроля.',
            'skills': json.dumps({
                'passive': 'Fearless - Снижает урон от врагов',
                'skill1': 'Attack Wave - Волна атаки',
                'skill2': 'Sacred Hammer - Священный молот',
                'ultimate': 'Implosion - Имплозия'
            }),
            'stats': json.dumps({
                'hp': 3000,
                'mana': 450,
                'physical_attack': 100,
                'magic_power': 0,
                'armor': 25,
                'magic_resistance': 20,
                'attack_speed': 0.7,
                'movement_speed': 250
            })
        },
        {
            'name': 'Eudora',
            'role': 'Mage',
            'specialty': 'Burst',
            'difficulty': 'Easy',
            'description': 'Eudora - маг с высоким магическим уроном и способностями контроля.',
            'skills': json.dumps({
                'passive': 'Superconductor - Проводник',
                'skill1': 'Forked Lightning - Разветвленная молния',
                'skill2': 'Electric Arrow - Электрическая стрела',
                'ultimate': 'Thunder Strike - Удар грома'
            }),
            'stats': json.dumps({
                'hp': 2000,
                'mana': 600,
                'physical_attack': 80,
                'magic_power': 150,
                'armor': 10,
                'magic_resistance': 15,
                'attack_speed': 0.6,
                'movement_speed': 240
            })
        },
        {
            'name': 'Alucard',
            'role': 'Fighter',
            'specialty': 'Charge',
            'difficulty': 'Medium',
            'description': 'Alucard - боец с высокой мобильностью и уроном в ближнем бою.',
            'skills': json.dumps({
                'passive': 'Pursuit - Преследование',
                'skill1': 'Groundsplitter - Разлом земли',
                'skill2': 'Whirling Smash - Вихревой удар',
                'ultimate': 'Fission Wave - Волна деления'
            }),
            'stats': json.dumps({
                'hp': 2800,
                'mana': 400,
                'physical_attack': 130,
                'magic_power': 0,
                'armor': 20,
                'magic_resistance': 15,
                'attack_speed': 0.9,
                'movement_speed': 270
            })
        },
        {
            'name': 'Saber',
            'role': 'Assassin',
            'specialty': 'Charge',
            'difficulty': 'Medium',
            'description': 'Saber - убийца с высокой мобильностью и способностью быстро уничтожать врагов.',
            'skills': json.dumps({
                'passive': 'Enemy\'s Bane - Проклятие врага',
                'skill1': 'Charge - Заряд',
                'skill2': 'Triple Sweep - Тройная развертка',
                'ultimate': 'Triple Sweep - Тройная развертка'
            }),
            'stats': json.dumps({
                'hp': 2200,
                'mana': 350,
                'physical_attack': 140,
                'magic_power': 0,
                'armor': 15,
                'magic_resistance': 10,
                'attack_speed': 1.0,
                'movement_speed': 280
            })
        }
    ]
    
    heroes = []
    for hero_data in heroes_data:
        hero = Hero(**hero_data)
        heroes.append(hero)
        db.session.add(hero)
    
    db.session.commit()
    
    # Создаем достижения
    achievements_data = [
        {
            'name': 'Первый пост',
            'description': 'Создайте свой первый пост в сообществе',
            'points': 10,
            'category': 'Community'
        },
        {
            'name': 'Активный комментатор',
            'description': 'Оставьте 10 комментариев',
            'points': 25,
            'category': 'Community'
        },
        {
            'name': 'Эксперт по героям',
            'description': 'Оцените 5 разных героев',
            'points': 50,
            'category': 'Hero'
        },
        {
            'name': 'Мастер стратегии',
            'description': 'Создайте 5 постов о стратегиях',
            'points': 75,
            'category': 'Game'
        }
    ]
    
    achievements = []
    for achievement_data in achievements_data:
        achievement = Achievement(**achievement_data)
        achievements.append(achievement)
        db.session.add(achievement)
    
    db.session.commit()
    
    # Создаем тестовые посты
    posts_data = [
        {
            'title': 'Лучшие герои для новичков в Mobile Legends',
            'content': 'Если вы только начинаете играть в Mobile Legends, рекомендую начать с этих героев:\n\n1. Layla - отличный герой дальнего боя\n2. Tigreal - мощный танк\n3. Eudora - простой в освоении маг\n\nКаждый из них имеет простые навыки и поможет вам изучить основы игры.',
            'author_id': 1,
            'hero_id': 1,
            'likes': 15,
            'views': 120
        },
        {
            'title': 'Стратегия игры за Alucard',
            'content': 'Alucard - один из самых популярных бойцов в игре. Вот несколько советов:\n\n- Используйте Pursuit для преследования врагов\n- Groundsplitter отлично подходит для фарма\n- Whirling Smash наносит огромный урон в группе\n- Fission Wave - идеальный финишер\n\nСобирайте предметы на физический урон и атаку!',
            'author_id': 2,
            'hero_id': 4,
            'likes': 23,
            'views': 89
        },
        {
            'title': 'Как правильно играть в команде',
            'content': 'Командная игра - ключ к успеху в Mobile Legends:\n\n1. Всегда следите за картой\n2. Помогайте союзникам\n3. Не забывайте про варды\n4. Общайтесь с командой\n5. Не сдавайтесь рано\n\nПомните: одна команда сильнее суммы отдельных игроков!',
            'author_id': 1,
            'likes': 31,
            'views': 156
        }
    ]
    
    for post_data in posts_data:
        post = Post(**post_data)
        db.session.add(post)
    
    # Создаем тестовые комментарии
    comments_data = [
        {
            'content': 'Отличный гайд! Layla действительно хороша для новичков.',
            'author_id': 3,
            'post_id': 1
        },
        {
            'content': 'Спасибо за советы по Alucard! Попробую применить.',
            'author_id': 3,
            'post_id': 2
        },
        {
            'content': 'Согласен с каждым пунктом! Командная игра решает.',
            'author_id': 2,
            'post_id': 3
        }
    ]
    
    for comment_data in comments_data:
        comment = Comment(**comment_data)
        db.session.add(comment)
    
    # Создаем рейтинги героев
    ratings_data = [
        {'user_id': 1, 'hero_id': 1, 'rating': 5, 'review': 'Отличный герой для новичков!'},
        {'user_id': 1, 'hero_id': 2, 'rating': 4, 'review': 'Хороший танк, но сложный в освоении.'},
        {'user_id': 2, 'hero_id': 4, 'rating': 5, 'review': 'Мой любимый боец!'},
        {'user_id': 2, 'hero_id': 5, 'rating': 4, 'review': 'Сильный убийца, требует навыков.'},
        {'user_id': 3, 'hero_id': 1, 'rating': 5, 'review': 'Начал с неё, очень доволен!'}
    ]
    
    for rating_data in ratings_data:
        rating = Rating(**rating_data)
        db.session.add(rating)
    
    # Обновляем рейтинги героев
    for hero in heroes:
        hero_ratings = Rating.query.filter_by(hero_id=hero.id).all()
        if hero_ratings:
            avg_rating = sum(r.rating for r in hero_ratings) / len(hero_ratings)
            hero.rating = round(avg_rating, 1)
    
    db.session.commit()
    
    print("Тестовые данные созданы успешно!")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Создаем тестовые данные
        create_sample_data()
    app.run(debug=True, port=8080)