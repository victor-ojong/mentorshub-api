import { buildEntitySortObjectFromQueryParam } from './utils.lib';

describe('buildEntitySortObjectFromQueryParam', () => {
  it('should return object representative of the sort pattern. Patterns with comma and spaces', () => {
    expect(
      buildEntitySortObjectFromQueryParam('createdAt:asc, name:desc')
    ).toEqual({ createdAt: 'ASC', name: 'DESC' });
  });

  it('should return object representative of the sort pattern. Patterns with comma without spaces', () => {
    expect(
      buildEntitySortObjectFromQueryParam('createdAt:asc,name:desc')
    ).toEqual({ createdAt: 'ASC', name: 'DESC' });
  });
});
