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
    const sanitizedBookmarkData: Partial<Bookmark> = {
      title: bookmarkData.title || 'Unknown',
      url: bookmarkData.url || 'Unknown',
      urlToImage: bookmarkData.urlToImage || 'Unknown',
      author: bookmarkData.author || 'Unknown',
      category: bookmarkData.category || 'Unknown',
    };

    const bookmark = this.bookmarksRepository.create({
      ...sanitizedBookmarkData,
      userId,
    });

    return this.bookmarksRepository.save(bookmark);
  }

  async removeBookmark(userId: number, bookmarkId: number): Promise<void> {
    await this.bookmarksRepository.delete({ id: bookmarkId, userId });
  }

  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return this.bookmarksRepository.find({ where: { userId } });
  }
}
