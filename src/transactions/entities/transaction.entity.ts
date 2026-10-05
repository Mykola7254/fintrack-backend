import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

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
}