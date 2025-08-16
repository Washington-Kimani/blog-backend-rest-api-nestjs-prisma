import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ArticleEntity } from './entities/article.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('articles')
@ApiTags('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create article' })
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ArticleEntity })
  async create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    const authorId = req.user.id;
    return new ArticleEntity(
      await this.articlesService.create(createArticleDto, authorId),
    );
  }

  // get all articles
  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiOkResponse({ type: ArticleEntity, isArray: true })
  async findAll() {
    const articles = await this.articlesService.findAll();
    return articles.map((article) => new ArticleEntity(article));
  }

  // get all articles of an author
  @Get('author/:id')
  @ApiOperation({ summary: 'Get articles by an author' })
  @ApiOkResponse({ type: ArticleEntity, isArray: true })
  async findAllForAuthor(@Param('id', ParseIntPipe) id: number){
    const articles = await this.articlesService.findAllForAuthor(id);
    return articles.map((article) => new ArticleEntity(article));
  }

  // get all drafts
  @Get('drafts')
  @ApiOperation({ summary: 'Get drafts' })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ArticleEntity, isArray: true })
  async findDrafts() {
    const drafts = await this.articlesService.findDrafts();
    return drafts.map((draft) => new ArticleEntity(draft));
  }

  // get one article
  @Get(':id')
  @ApiOperation({ summary: 'Get article by id' })
  @ApiOkResponse({ type: ArticleEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return new ArticleEntity(await this.articlesService.findOne(id));
  }

  // publish an article
  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish an article' })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ArticleEntity })
  async publish(@Param('id', ParseIntPipe) id: number) {
    return new ArticleEntity(await this.articlesService.publish(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an article' })
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ArticleEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return new ArticleEntity(
      await this.articlesService.update(id, updateArticleDto),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an article' })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ArticleEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return new ArticleEntity(await this.articlesService.remove(id));
  }
}
