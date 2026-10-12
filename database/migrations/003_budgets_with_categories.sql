-- Бюджет з дизайну: назва + загальний ліміт за період + ліміти по категоріях
create table budget_categories (
    id int auto_increment primary key,
    budget_id int not null,
    category_id int not null,
    limit_amount decimal(12, 2) not null,
    unique key uq_budget_category (budget_id, category_id),
    foreign key (budget_id) references budgets(id) on delete cascade,
    foreign key (category_id) references categories(id) on delete cascade
);

-- Переносимо наявні ліміти категорій у нову таблицю
insert into budget_categories (budget_id, category_id, limit_amount)
select id, category_id, limit_amount from budgets;

alter table budgets
    add column name varchar(100) not null default 'Бюджет' after user_id,
    add column total_limit decimal(12, 2) default null after name;

update budgets set total_limit = limit_amount;

alter table budgets modify total_limit decimal(12, 2) not null;

alter table budgets drop foreign key budgets_ibfk_2;

alter table budgets
    drop column category_id,
    drop column limit_amount;
