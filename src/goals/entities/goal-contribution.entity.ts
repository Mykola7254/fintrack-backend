import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity.js';

@Entity('goal_contributions')
export class GoalContribution {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    goal_id: number;

    @Column({ type: 'int', nullable: true })
    account_id: number | null;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    contribution_date: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    comment: string | null;

    @ManyToOne(() => Account, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'account_id' })
    account?: Account | null;
}
