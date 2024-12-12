import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { GetUser } from '../users/user.decorator';
import { User } from '../users/user.entity';
import { Bookmark } from './bookmarks.entity';
import { BookmarksService } from './bookmarks.service';
import { BookmarkDto } from './bookmarks-dto';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  async addBookmark(
    @GetUser() user: User,
    @Body() bookmarkDTO: BookmarkDto,
  ): Promise<Bookmark> {
    return this.bookmarksService.addBookmark(user.id, bookmarkDTO);
  }

  @Delete(':id')
  async removeBookmark(
    @GetUser() user: User,
    @Param('id') id: number,
  ): Promise<void> {
    await this.bookmarksService.removeBookmark(user.id, id);
  }

  @Get()
  async getBookmarks(@GetUser() user: User): Promise<Bookmark[]> {
    return this.bookmarksService.getUserBookmarks(user.id);
  }
}
