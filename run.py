#!/usr/bin/env python3
"""
Скрипт для запуска Mobile Legends Community System
"""

import os
import sys
from app import app, db, create_sample_data

def main():
    """Основная функция запуска"""
    print("🎮 Запуск Mobile Legends Community System...")
    
    with app.app_context():
        # Создаем таблицы базы данных
        print("📊 Создание таблиц базы данных...")
        db.create_all()
        
        # Создаем тестовые данные
        print("🎯 Создание тестовых данных...")
        create_sample_data()
        
        print("✅ Инициализация завершена!")
        print("🌐 Приложение доступно по адресу: http://localhost:8080")
        print("📱 Тестовые пользователи:")
        print("   - MLPro / password123")
        print("   - HeroMaster / password123") 
        print("   - NewbiePlayer / password123")
        print("\n🚀 Запуск сервера...")
    
    # Запускаем приложение
    app.run(debug=True, port=8080, host='0.0.0.0')

if __name__ == '__main__':
    main()