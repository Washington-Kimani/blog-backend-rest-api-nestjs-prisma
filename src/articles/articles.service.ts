import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async create(createArticleDto: CreateArticleDto, authorId: number) {
    const exists =
      (await this.prisma.article.findFirst({
        where: { title: createArticleDto.title },
      })) &&
      (await this.prisma.article.findFirst({
        where: { authorId: authorId },
      }));

    if (exists)
      throw new BadRequestException(
        `Article with title: ${createArticleDto.title} or AuthorID ${authorId} already exists`,
      );

    return this.prisma.article.create({
      data: {
        ...createArticleDto,
        author: { connect: { id: authorId } },
      },
    });
  }

  // get all articles that are not published yet
  findDrafts() {
    return this.prisma.article.findMany({ where: { published: false } });
  }

  // publish an article
  async publish(id: number) {
    const article = this.prisma.article.findFirst({
      where: { id },
    });

    if (!article)
      throw new BadRequestException(`Article with id ${id} not found`);

    return this.prisma.article.update({
      where: { id },
      data: { published: true },
    });
  }

  // get all articles that are published
  findAll() {
    return this.prisma.article.findMany({ where: { published: true } });
  }

  // find all articles from one author
  async findAllForAuthor(id: number) {
    const author = this.prisma.user.findFirst({
      where: { id: id },
    });

    if (!author)
      throw new BadRequestException(`Author with id ${id} does not exists`);

    return this.prisma.article.findMany({
      where: { authorId: id },
    });
  }

  findOne(id: number) {
    return this.prisma.article.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return this.prisma.article.update({
      where: { id },
      data: updateArticleDto,
    });
  }

  remove(id: number) {
    return this.prisma.article.delete({ where: { id } });
  }
}
