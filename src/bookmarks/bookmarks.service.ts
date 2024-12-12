import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './bookmarks.entity';
import { BookmarkDto } from './bookmarks-dto';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarksRepository: Repository<Bookmark>,
  ) {}

  async addBookmark(userId: number, bookmarkData: BookmarkDto): Promise<Bookmark> {
    try {
      const bookmark = this.bookmarksRepository.create({
        ...bookmarkData,
        userId,
      });
      return this.bookmarksRepository.save(bookmark);
    } catch (error) {
      throw new Error('Error saving bookmark');
    }
  }

  async removeBookmark(userId: number, bookmarkId: number): Promise<void> {
    try {
      const result = await this.bookmarksRepository.delete({ id: bookmarkId, userId });
      if (result.affected === 0) {
        throw new Error('Bookmark not found');
      }
    } catch (error) {
      throw new Error('Error removing bookmark');
    }
  }

  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    try {
      return this.bookmarksRepository.find({ where: { userId } });
    } catch (error) {
      throw new Error('Error fetching bookmarks');
    }
  }
}
