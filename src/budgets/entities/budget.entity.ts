import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BudgetCategory } from './budget-category.entity.js';

@Entity('budgets')
export class Budget {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ length: 100 })
    name: string;

    @Column('decimal', { precision: 12, scale: 2 })
    total_limit: string;

    @Column({ type: 'date' })
    start_date: string;

    @Column({ type: 'date' })
    end_date: string;

    @OneToMany(() => BudgetCategory, (item) => item.budget, {
        cascade: true,
    })
    categories: BudgetCategory[];
}
