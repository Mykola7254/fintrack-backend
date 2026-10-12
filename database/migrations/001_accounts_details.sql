-- Деталі рахунку для екранів «Рахунки» та «Вибір рахунку» (ПриватБанк •• 4821, Готівка, Кредитна картка)
alter table accounts
    add column type enum('card', 'cash', 'credit_card') not null default 'card',
    add column card_last4 char(4) default null,
    add column description varchar(100) default null;

update accounts set type = 'cash' where name = 'Готівка';
