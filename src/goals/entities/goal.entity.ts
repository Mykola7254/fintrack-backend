import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('financial_goals')
export class Goal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ length: 100 })
    title: string;

    @Column('decimal', { precision: 12, scale: 2 })
    target_amount: string;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    current_amount: string;

    @Column({ type: 'date', nullable: true })
    deadline: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    icon: string | null;
}
