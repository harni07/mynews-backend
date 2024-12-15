import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class BookmarkDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsOptional()
  @IsUrl()
  urlToImage?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  publishedAt?: string; 

  @IsOptional()
  @IsString()
  description?: string; 

  @IsOptional()
  @IsString()
  content?: string; 


  @IsOptional()
  @IsString()
  category?: string;
}
