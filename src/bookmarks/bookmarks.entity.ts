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

  @Column()
  urlToImage: string;

  @Column()
  author: string;

  @Column()
  category: string;

  @CreateDateColumn()
  createdAt: Date;
}
