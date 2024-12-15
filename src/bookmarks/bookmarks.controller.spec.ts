import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { BookmarkDto } from './bookmarks-dto';
import { Bookmark } from './bookmarks.entity';
import { User } from 'src/users/user.entity';

describe('BookmarksController', () => {
  let controller: BookmarksController;
  let service: BookmarksService;

  const mockBookmarksService = {
    addBookmark: jest.fn(),
    removeBookmark: jest.fn(),
    getUserBookmarks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [
        { provide: BookmarksService, useValue: mockBookmarksService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({})
      .compile();

    controller = module.get<BookmarksController>(BookmarksController);
    service = module.get<BookmarksService>(BookmarksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addBookmark', () => {
    it('should add a bookmark', async () => {
      const bookmarkDto: BookmarkDto = {
        title: 'Test Bookmark',
        url: 'http://example.com',
        urlToImage: null,
        author: null,
        category: null,
        content: null,      
        description: null, 
        publishedAt: null,  
      };

      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        first_name: 'Test',
        last_name: 'User',
        isActive: true,
        activationToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resetToken: null,
      };
      
      
      const mockBookmark: Bookmark = {
        id: 1,
        userId: 1,
        title: 'Test Bookmark',
        url: 'http://example.com',
        urlToImage: null,
        author: null,
        category: null,
        content: null,
        description: null,
        publishedAt: null,   
        createdAt: new Date(),
      };
      

      mockBookmarksService.addBookmark.mockResolvedValue(mockBookmark);

      const result = await controller.addBookmark(mockUser, bookmarkDto);
      expect(result).toEqual(mockBookmark);
      expect(mockBookmarksService.addBookmark).toHaveBeenCalledWith(
        mockUser.id,
        bookmarkDto,
      );
    });
  });

  describe('removeBookmark', () => {
    it('should remove a bookmark', async () => {
        const mockUser: User = {
            id: 1,
            email: 'test@example.com',
            password: 'hashedPassword',
            first_name: 'Test',
            last_name: 'User',
            isActive: true,
            activationToken: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            resetToken: null,
          };
                const bookmarkId = 1;

      mockBookmarksService.removeBookmark.mockResolvedValue(undefined);

      await expect(
        controller.removeBookmark(mockUser, bookmarkId),
      ).resolves.toBeUndefined();
      expect(mockBookmarksService.removeBookmark).toHaveBeenCalledWith(
        mockUser.id,
        bookmarkId,
      );
    });
  });

  describe('getBookmarks', () => {
    it('should return user bookmarks', async () => {
        const mockUser: User = {
            id: 1,
            email: 'test@example.com',
            password: 'hashedPassword',
            first_name: 'Test',
            last_name: 'User',
            isActive: true,
            activationToken: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            resetToken: null,
          };
        const mockBookmarks: Bookmark[] = [
            {
              id: 1,
              userId: 1,
              title: 'Test Bookmark',
              url: 'http://example.com',
              urlToImage: null,
              author: null,
              category: null,
              content: null,
              description: null,
              publishedAt: null,
              createdAt: new Date(),
            },
          ];
          

      mockBookmarksService.getUserBookmarks.mockResolvedValue(mockBookmarks);

      const result = await controller.getBookmarks(mockUser);
      expect(result).toEqual(mockBookmarks);
      expect(mockBookmarksService.getUserBookmarks).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });
});
