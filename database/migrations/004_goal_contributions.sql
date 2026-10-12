-- Іконка цілі (🚗 ✈️ 🏠 💻 🎓) та історія поповнень з екрана «Додати накопичення»
alter table financial_goals
    add column icon varchar(50) default null;

create table goal_contributions (
    id int auto_increment primary key,
    goal_id int not null,
    account_id int default null,
    amount decimal(12, 2) not null,
    contribution_date timestamp default current_timestamp,
    comment varchar(255) default null,
    foreign key (goal_id) references financial_goals(id) on delete cascade,
    foreign key (account_id) references accounts(id) on delete set null
);
