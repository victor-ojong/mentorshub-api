import {
  Pagination,
  PaginatedResult,
  DEFAULT_PAGE_LIMIT,
} from './pagination.lib';

describe('Pagination', () => {
  it('should set default value for page and perPage', () => {
    const pagination = new Pagination();
    expect(pagination.page).toBe(1);
    expect(pagination.perPage).toBe(DEFAULT_PAGE_LIMIT);
  });

  it('should set values for page and perPage to 3 and 50 respectively', () => {
    const page = 3;
    const perPage = 50;
    const pagination = new Pagination(page, perPage);
    expect(pagination.page).toBe(3);
    expect(pagination.perPage).toBe(perPage);
  });

  it('should set values for page and perPage if number string is passed in', () => {
    const page = '3' as unknown;
    const perPage = '50' as unknown;
    const pagination = new Pagination(<number>page, <number>perPage);
    expect(pagination.page).toBe(3);
    expect(pagination.perPage).toBe(+perPage);
  });
});

describe('Pagination result', () => {
  it('should return object with pagination data', () => {
    const data = [1, 2, 3, 4, 5];
    const total = 1000;
    const pagination = new Pagination();
    const paginatedResult = new PaginatedResult(data, total).create(pagination);

    expect(paginatedResult.metadata).toEqual(
      expect.objectContaining({
        total,
        pages: Math.ceil(total / pagination.perPage),
      })
    );
    expect(paginatedResult.result).toEqual(data);
    expect(pagination.perPage).toBe(DEFAULT_PAGE_LIMIT);
  });

  it('should return object with pagination data for page and perPage as number string', () => {
    const page: unknown = '3';
    const perPage: unknown = '50';
    const pagination = new Pagination(<number>page, <number>perPage);

    const data = [1, 2, 3, 4, 5];
    const total = 1000;
    const paginatedResult = new PaginatedResult(data, total).create(pagination);

    expect(paginatedResult.metadata).toEqual(
      expect.objectContaining({
        total,
        pages: Math.ceil(total / pagination.perPage),
      })
    );
    expect(paginatedResult.result).toEqual(data);
    expect(pagination.perPage).toBe(+perPage);
  });
});
