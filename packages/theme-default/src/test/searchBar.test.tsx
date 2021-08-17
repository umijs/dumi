import '@testing-library/jest-dom';
import React from 'react';

import { highlight } from '../components/SearchBar';

describe('test highlight', () => {
  it('should render right', () => {
    const element1 = highlight('1', '1234').props.children;
    expect(element1[0]).toEqual(false);
    expect(element1[1].props).toEqual({ className: '__dumi-default-search-highlight', children: '1' });
    expect(element1[2].props).toEqual({ children: '234' });

    const element2 = highlight('2', '1234').props.children;
    expect(element2[0].props).toEqual({ children: '1' });
    expect(element2[1].props).toEqual({ className: '__dumi-default-search-highlight', children: '2' });
    expect(element2[2].props).toEqual({ children: '34' });

    const element3 = highlight('23', '1234').props.children;
    expect(element3[0].props).toEqual({ children: '1' });
    expect(element3[1].props).toEqual({ className: '__dumi-default-search-highlight', children: '23' });
    expect(element3[2].props).toEqual({ children: '4' });

    const element4 = highlight('34', '1234').props.children;
    expect(element4[0].props).toEqual({ children: '12' });
    expect(element4[1].props).toEqual({ className: '__dumi-default-search-highlight', children: '34' });
    expect(element4[2]).toEqual(false);

    const element5 = highlight('1234', '1234').props.children;
    expect(element5[0]).toEqual(false);
    expect(element5[1].props).toEqual({ className: '__dumi-default-search-highlight', children: '1234' });
    expect(element5[2]).toEqual(false);
  });
});
