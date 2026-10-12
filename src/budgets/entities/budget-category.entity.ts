import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';
import { Budget } from './budget.entity.js';

@Entity('budget_categories')
export class BudgetCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    budget_id: number;

    @Column()
    category_id: number;

    @Column('decimal', { precision: 12, scale: 2 })
    limit_amount: string;

    @ManyToOne(() => Budget, (budget) => budget.categories, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'budget_id' })
    budget?: Budget;

    @ManyToOne(() => Category, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'category_id' })
    category?: Category;
}
