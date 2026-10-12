import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const ACCOUNT_TYPES = ['card', 'cash', 'credit_card'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ length: 50 })
    name: string;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    balance: string;

    @Column({ length: 10, default: 'UAH' })
    currency: string;

    @Column({ type: 'enum', enum: ACCOUNT_TYPES, default: 'card' })
    type: AccountType;

    @Column({ type: 'char', length: 4, nullable: true })
    card_last4: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    description: string | null;
}
