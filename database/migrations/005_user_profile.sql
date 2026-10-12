-- Поля з екрана «Профіль»: телефон і валюта за замовчуванням
alter table users
    add column phone varchar(20) default null after email,
    add column default_currency varchar(10) not null default 'UAH' after phone;
