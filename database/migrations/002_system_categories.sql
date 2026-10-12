-- Системні категорії (user_id = null) з екрана «Виберіть категорію»
insert into categories (user_id, name, type, icon_name, color_code)
select null, c.name, c.type, c.icon_name, c.color_code
from (
    select 'Розваги' as name, 'expense' as type, 'gamepad' as icon_name, '#FFB020' as color_code
    union all select 'Освіта', 'expense', 'school', '#2D9CDB'
    union all select 'Дім', 'expense', 'home', '#8D6E63'
    union all select 'Інше', 'expense', 'more', '#9E9E9E'
    union all select 'Фріланс', 'income', 'laptop', '#20C997'
    union all select 'Подарунки', 'income', 'gift', '#E83E8C'
    union all select 'Інше', 'income', 'more', '#9E9E9E'
) as c
where not exists (
    select 1 from categories e
    where e.user_id is null and e.name = c.name and e.type = c.type
);
