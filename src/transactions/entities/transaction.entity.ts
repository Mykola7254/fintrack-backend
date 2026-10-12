import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity.js';
import { Category } from '../../categories/entities/category.entity.js';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    account_id: number;

    @Column({ type: 'int', nullable: true })
    category_id: number | null;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: string;

    @Column({
        type: 'enum',
        enum: ['income', 'expense'],
    })
    type: 'income' | 'expense';

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    transaction_date: Date;

    @Column('text', { nullable: true })
    comment: string | null;

    @ManyToOne(() => Account, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'account_id' })
    account?: Account;

    @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'category_id' })
    category?: Category | null;
}
