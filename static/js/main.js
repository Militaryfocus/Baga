// Основной JavaScript файл для Mobile Legends Community

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех компонентов
    initRatingSystem();
    initFilterSystem();
    initTooltips();
    initAnimations();
});

// Система рейтинга
function initRatingSystem() {
    const ratingInputs = document.querySelectorAll('.rating-input');
    
    ratingInputs.forEach(ratingInput => {
        const stars = ratingInput.querySelectorAll('.star-label');
        const inputs = ratingInput.querySelectorAll('input[type="radio"]');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                // Убираем активный класс со всех звезд
                stars.forEach(s => s.classList.remove('active'));
                
                // Добавляем активный класс до текущей звезды включительно
                for (let i = 0; i <= index; i++) {
                    stars[i].classList.add('active');
                }
                
                // Устанавливаем значение input
                inputs[index].checked = true;
            });
            
            star.addEventListener('mouseenter', function() {
                // Подсвечиваем звезды при наведении
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.classList.add('hover');
                    } else {
                        s.classList.remove('hover');
                    }
                });
            });
        });
        
        // Сбрасываем подсветку при уходе мыши
        ratingInput.addEventListener('mouseleave', function() {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// Система фильтрации
function initFilterSystem() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    const heroCards = document.querySelectorAll('.hero-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Обновляем активную кнопку
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('btn-outline-primary');
            });
            this.classList.add('active');
            this.classList.remove('btn-outline-primary');
            
            // Фильтруем карточки с анимацией
            heroCards.forEach((card, index) => {
                const role = card.getAttribute('data-role');
                const shouldShow = filter === 'all' || role === filter;
                
                if (shouldShow) {
                    card.style.display = 'block';
                    card.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Инициализация тултипов
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Анимации при скролле
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Наблюдаем за карточками
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Функция для лайков
function likePost(postId) {
    fetch(`/api/like_post/${postId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const likeButton = document.querySelector(`[data-post-id="${postId}"]`);
            const likeCount = likeButton.querySelector('.like-count');
            likeCount.textContent = data.likes;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Функция для поиска
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const cards = document.querySelectorAll('.hero-card, .post-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Валидация форм
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Обработка отправки форм
document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.hasAttribute('data-validate')) {
        e.preventDefault();
        
        if (validateForm(form.id)) {
            form.submit();
        } else {
            showNotification('Пожалуйста, заполните все обязательные поля', 'warning');
        }
    }
});

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Инициализация поиска при загрузке
initSearch();