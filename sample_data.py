from werkzeug.security import generate_password_hash
import json

def create_sample_data(db, User, Hero, Post, Comment, Achievement, UserAchievement, Rating):
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