import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type CategoryType = 'income' | 'expense';

// user_id = null — системна категорія, спільна для всіх користувачів
@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    user_id: number | null;

    @Column({ length: 50 })
    name: string;

    @Column({ type: 'enum', enum: ['income', 'expense'] })
    type: CategoryType;

    @Column({ type: 'varchar', length: 50, nullable: true })
    icon_name: string | null;

    @Column({ type: 'varchar', length: 10, nullable: true })
    color_code: string | null;
}
