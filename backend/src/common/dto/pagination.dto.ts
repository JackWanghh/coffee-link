import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CursorQuery {
  @IsOptional()
  @IsString()
  afterId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export interface CursorResult<T> {
  items: T[];
  nextCursor: string | null;
}

export function paginate<T extends { id: string }>(
  items: T[],
  limit: number,
  afterId?: string,
): CursorResult<T> {
  let list = items;
  if (afterId) {
    const idx = list.findIndex((x) => x.id === afterId);
    if (idx >= 0) list = list.slice(idx + 1);
  }
  const page = list.slice(0, limit);
  const next = list.length > limit ? page[page.length - 1]?.id ?? null : null;
  return { items: page, nextCursor: next };
}
