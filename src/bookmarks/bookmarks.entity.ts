import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  urlToImage?: string;

  @Column({ nullable: true })
  author?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  content?: string;
  
  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  publishedAt?: string;

  @CreateDateColumn()
  createdAt: Date;
}
