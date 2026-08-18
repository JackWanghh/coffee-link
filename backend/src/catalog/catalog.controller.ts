import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CursorQuery } from '../common/dto/pagination.dto';
import { CatalogService } from './catalog.service';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  async categories() {
    return { data: await this.catalog.categories() };
  }

  @Get('coffee-drinks')
  async drinks() {
    return { data: await this.catalog.drinks() };
  }

  @Get('sharers')
  sharers(
    @Query('category') categoryId: string | undefined,
    @Query('industry') industry: string | undefined,
    @Query('q') q: string | undefined,
    @Query() cursor: CursorQuery,
  ) {
    return this.catalog.sharers({
      categoryId,
      industry,
      q,
      afterId: cursor.afterId,
      limit: cursor.limit,
    });
  }

  @Get('sharers/:id')
  sharerDetail(@Param('id') id: string) {
    return this.catalog.sharerDetail(id);
  }
}
