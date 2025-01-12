import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number): number => value,
      from: (value: string | number): number => Number(value),
    },
  })
  price: number;

  @Column()
  category: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('simple-array', { nullable: true })
  contents?: string[];

  @Column({ default: true })
  available: boolean;

  @ManyToOne('Menu', 'items', { onDelete: 'CASCADE' })
  menu: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
