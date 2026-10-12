# Міграції БД

Базова схема — `init_schema.sql` і `seed_data.sql` з репозиторію БД. Після них по черзі виконати файли з `migrations/`:

| Файл | Що робить |
|---|---|
| `001_accounts_details.sql` | `accounts`: `type`, `card_last4`, `description` |
| `002_system_categories.sql` | системні категорії з дизайну (Розваги, Освіта, Дім, Інше, Фріланс, Подарунки) |
| `003_budgets_with_categories.sql` | `budgets`: `name`, `total_limit`; ліміти категорій → `budget_categories` |
| `004_goal_contributions.sql` | `financial_goals.icon`, таблиця `goal_contributions` |
| `005_user_profile.sql` | `users`: `phone`, `default_currency` |

```bash
mysql -u root -p fintrack_db < database/migrations/001_accounts_details.sql
```

## Тестовий користувач

У `seed_data.sql` поле `password_hash` для `iryna@gmail.com` — не bcrypt-хеш, тому вхід не працює. Щоб увійти з паролем `password123`:

```sql
update users
set password_hash = '$2b$10$jgv/0k9fRX1LrW7VQewf1erb2l0tYQ//TWHFKE1SvF9C9riWFU7ny'
where email = 'iryna@gmail.com';
```
