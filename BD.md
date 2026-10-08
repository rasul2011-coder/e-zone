ENGLISH ZONE
Схема базы данных
Профессиональная структура БД для сайта языкового центра

Версия 1.0
Основано на ТЗ English Zone
 
1. Назначение
База данных предназначена для хранения и управления курсами, уровнями, расписанием, преподавателями, филиалами, заявками, пробными уроками, отзывами, галереей, FAQ, контентом, SEO и администраторами. Структура универсальная: новые курсы и филиалы добавляются без изменения схемы.
2. Таблицы
admins
Поле	Тип	Описание
id	BIGINT PK	ID администратора
name	VARCHAR(100)	Имя
email	VARCHAR(255) UNIQUE	Email
password_hash	VARCHAR(255)	Хеш пароля
role_id	INT FK	Роль
is_active	BOOLEAN	Активен
last_login_at	DATETIME NULL	Последний вход
created_at	DATETIME	Создан
updated_at	DATETIME	Изменён

roles
Поле	Тип	Описание
id	INT PK	ID роли
name	VARCHAR(50) UNIQUE	Название
description	TEXT	Описание прав

branches
Поле	Тип	Описание
id	INT PK	ID филиала
name	VARCHAR(150)	Название
slug	VARCHAR(150) UNIQUE	ЧПУ
address	VARCHAR(255)	Адрес
phone	VARCHAR(30)	Телефон
email	VARCHAR(255) NULL	Email
working_hours	VARCHAR(255)	Режим работы
latitude	DECIMAL(10,7) NULL	Широта
longitude	DECIMAL(10,7) NULL	Долгота
description	TEXT	Описание
image	VARCHAR(500) NULL	Фото
is_active	BOOLEAN	Показывать
sort_order	INT	Порядок
created_at	DATETIME	Создан
updated_at	DATETIME	Изменён

courses
Поле	Тип	Описание
id	INT PK	ID курса
name	VARCHAR(150)	Название
slug	VARCHAR(150) UNIQUE	ЧПУ
short_description	TEXT	Краткое описание
description	TEXT	Полное описание
image	VARCHAR(500) NULL	Изображение
price	DECIMAL(10,2) NULL	Цена
currency	VARCHAR(10)	Валюта
duration	VARCHAR(100) NULL	Продолжительность
age_from	TINYINT NULL	Возраст от
age_to	TINYINT NULL	Возраст до
is_active	BOOLEAN	Активен
is_featured	BOOLEAN	Показывать на главной
sort_order	INT	Порядок
created_at	DATETIME	Создан
updated_at	DATETIME	Изменён

course_categories
Поле	Тип	Описание
id	INT PK	ID категории
name	VARCHAR(100)	Название
slug	VARCHAR(100) UNIQUE	ЧПУ
description	TEXT NULL	Описание
is_active	BOOLEAN	Активна

course_categories_map
Поле	Тип	Описание
course_id	INT FK	Курс
category_id	INT FK	Категория

course_levels
Поле	Тип	Описание
id	INT PK	ID уровня
course_id	INT FK	Курс
name	VARCHAR(50)	Название
description	TEXT NULL	Описание
sort_order	INT	Порядок

course_schedule
Поле	Тип	Описание
id	BIGINT PK	ID расписания
course_id	INT FK	Курс
branch_id	INT FK	Филиал
level_id	INT FK NULL	Уровень
teacher_id	INT FK NULL	Преподаватель
day_of_week	TINYINT	День недели
start_time	TIME	Начало
end_time	TIME	Окончание
start_date	DATE NULL	Начало группы
end_date	DATE NULL	Окончание группы
format	VARCHAR(30)	Формат
is_active	BOOLEAN	Актуально

teachers
Поле	Тип	Описание
id	INT PK	ID преподавателя
name	VARCHAR(150)	Имя
slug	VARCHAR(150) UNIQUE	ЧПУ
photo	VARCHAR(500) NULL	Фото
position	VARCHAR(150) NULL	Должность
specialization	VARCHAR(255) NULL	Специализация
experience_years	TINYINT NULL	Опыт
qualification	TEXT NULL	Квалификация
languages	VARCHAR(255) NULL	Языки
bio	TEXT NULL	Биография
is_active	BOOLEAN	Показывать
sort_order	INT	Порядок

teacher_courses
Поле	Тип	Описание
teacher_id	INT FK	Преподаватель
course_id	INT FK	Курс

teacher_branches
Поле	Тип	Описание
teacher_id	INT FK	Преподаватель
branch_id	INT FK	Филиал

application_statuses
Поле	Тип	Описание
id	INT PK	ID статуса
name	VARCHAR(50)	Название
description	VARCHAR(255) NULL	Описание

applications
Поле	Тип	Описание
id	BIGINT PK	ID заявки
name	VARCHAR(150)	Имя
phone	VARCHAR(30)	Телефон
email	VARCHAR(255) NULL	Email
course_id	INT FK NULL	Курс
branch_id	INT FK NULL	Филиал
preferred_time	VARCHAR(100) NULL	Желаемое время
comment	TEXT NULL	Комментарий
source	VARCHAR(100) NULL	Источник
status_id	INT FK	Статус
privacy_accepted	BOOLEAN	Согласие
created_at	DATETIME	Создана
updated_at	DATETIME	Изменена

application_history
Поле	Тип	Описание
id	BIGINT PK	ID записи
application_id	BIGINT FK	Заявка
admin_id	INT FK	Администратор
old_status_id	INT FK NULL	Старый статус
new_status_id	INT FK	Новый статус
comment	TEXT NULL	Комментарий
created_at	DATETIME	Дата

trial_lessons
Поле	Тип	Описание
id	BIGINT PK	ID пробного урока
application_id	BIGINT FK	Заявка
course_id	INT FK	Курс
branch_id	INT FK	Филиал
teacher_id	INT FK NULL	Преподаватель
date	DATE	Дата
time	TIME	Время
status	VARCHAR(50)	Статус
comment	TEXT NULL	Комментарий

reviews
Поле	Тип	Описание
id	INT PK	ID
name	VARCHAR(150)	Имя
photo	VARCHAR(500) NULL	Фото
text	TEXT	Отзыв
rating	TINYINT	Оценка 1–5
course_id	INT FK NULL	Курс
branch_id	INT FK NULL	Филиал
is_published	BOOLEAN	Опубликован
sort_order	INT	Порядок
created_at	DATETIME	Дата

gallery
Поле	Тип	Описание
id	BIGINT PK	ID
title	VARCHAR(150) NULL	Название
image	VARCHAR(500)	Фото
description	TEXT NULL	Описание
branch_id	INT FK NULL	Филиал
category	VARCHAR(100) NULL	Категория
is_published	BOOLEAN	Опубликовано
sort_order	INT	Порядок
created_at	DATETIME	Дата

faq
Поле	Тип	Описание
id	INT PK	ID
question	VARCHAR(500)	Вопрос
answer	TEXT	Ответ
category	VARCHAR(100) NULL	Категория
is_published	BOOLEAN	Показывать
sort_order	INT	Порядок

contacts
Поле	Тип	Описание
id	INT PK	ID
phone	VARCHAR(30)	Телефон
email	VARCHAR(255) NULL	Email
whatsapp	VARCHAR(255) NULL	WhatsApp
instagram	VARCHAR(255) NULL	Instagram
telegram	VARCHAR(255) NULL	Telegram
address	VARCHAR(255) NULL	Адрес
working_hours	VARCHAR(255) NULL	Режим работы

social_links
Поле	Тип	Описание
id	INT PK	ID
name	VARCHAR(50)	Соцсеть
url	VARCHAR(500)	Ссылка
icon	VARCHAR(500) NULL	Иконка
is_active	BOOLEAN	Активна
sort_order	INT	Порядок

media
Поле	Тип	Описание
id	BIGINT PK	ID файла
file_name	VARCHAR(255)	Имя
file_url	VARCHAR(500)	URL
file_type	VARCHAR(50)	Тип
file_size	INT NULL	Размер
alt_text	VARCHAR(255) NULL	ALT
uploaded_by	INT FK NULL	Кто загрузил
created_at	DATETIME	Дата

pages
Поле	Тип	Описание
id	INT PK	ID
title	VARCHAR(255)	Название
slug	VARCHAR(150) UNIQUE	URL
content	LONGTEXT	Контент
is_published	BOOLEAN	Опубликована
created_at	DATETIME	Создана
updated_at	DATETIME	Изменена

seo
Поле	Тип	Описание
id	BIGINT PK	ID
page_type	VARCHAR(50)	Тип страницы/объекта
page_id	BIGINT	ID объекта
title	VARCHAR(255)	SEO Title
description	TEXT NULL	Meta Description
canonical_url	VARCHAR(500) NULL	Canonical
og_title	VARCHAR(255) NULL	OG Title
og_description	TEXT NULL	OG Description
og_image	VARCHAR(500) NULL	OG Image

site_settings
Поле	Тип	Описание
id	INT PK	ID
key	VARCHAR(100) UNIQUE	Ключ
value	TEXT	Значение
type	VARCHAR(30)	Тип
description	VARCHAR(255) NULL	Описание

languages
Поле	Тип	Описание
id	INT PK	ID
code	VARCHAR(10) UNIQUE	ru/ky/en
name	VARCHAR(50)	Название
is_active	BOOLEAN	Включен
is_default	BOOLEAN	По умолчанию

course_translations
Поле	Тип	Описание
id	BIGINT PK	ID
course_id	INT FK	Курс
language_id	INT FK	Язык
name	VARCHAR(150)	Название
short_description	TEXT NULL	Краткое описание
description	TEXT NULL	Описание

statistics
Поле	Тип	Описание
id	INT PK	ID
title	VARCHAR(100)	Значение
description	VARCHAR(255)	Подпись
icon	VARCHAR(500) NULL	Иконка
sort_order	INT	Порядок
is_active	BOOLEAN	Показывать

events
Поле	Тип	Описание
id	INT PK	ID
title	VARCHAR(255)	Название
description	TEXT	Описание
image	VARCHAR(500) NULL	Фото
branch_id	INT FK NULL	Филиал
event_date	DATETIME	Дата/время
is_published	BOOLEAN	Опубликовано

 
3. Связи
•	roles 1:N admins
•	courses N:M course_categories через course_categories_map
•	courses 1:N course_levels
•	courses 1:N course_schedule
•	branches 1:N course_schedule
•	teachers N:M courses через teacher_courses
•	teachers N:M branches через teacher_branches
•	applications N:1 courses
•	applications N:1 branches
•	applications N:1 application_statuses
•	applications 1:N application_history
•	applications 1:N trial_lessons
•	reviews N:1 courses и branches
•	gallery N:1 branches
•	media N:1 admins
4. Что добавлено к исходному ТЗ
•	Админ-панель и роли.
•	Статусы и история обработки заявок.
•	Полноценное расписание.
•	Отдельная запись на пробный урок.
•	Категории и уровни курсов.
•	Связи преподавателей с курсами и филиалами.
•	Управляемая статистика главной страницы.
•	Мультиязычность.
•	SEO-структура.
•	Медиа-библиотека.
•	Мероприятия как расширение.
5. Важные замечания
•	Количество филиалов в ТЗ нужно подтвердить: в статистике указано 8, а в структуре перечислены Центр, Восток и Юг.
•	Цены, расписание, количество учеников и другие цифры должны быть подтверждены заказчиком.
•	Пароли хранить только в виде безопасного хеша.
•	Персональные данные заявок должны быть доступны только авторизованным сотрудникам.
•	Интеграции с CRM, Telegram, WhatsApp и email лучше реализовывать отдельным интеграционным слоем.
6. Итоговая рекомендуемая структура
admins, roles, branches, courses, course_categories, course_categories_map, course_levels, course_schedule, teachers, teacher_courses, teacher_branches, application_statuses, applications, application_history, trial_lessons, review
s, gallery, faq, contacts, social_links, media, pages, seo, site_settings, languages, course_translations, statistics, events.
