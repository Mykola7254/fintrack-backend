import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'full_name', length: 100 })
    full_name: string;

    @Column({ length: 100, unique: true })
    email: string;

    @Column({ name: 'password_hash', length: 255 })
    password_hash: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;
}