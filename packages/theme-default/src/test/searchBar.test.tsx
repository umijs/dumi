import '@testing-library/jest-dom';
import React from 'react';

import { highlight } from '../components/SearchBar';

describe('test highlight', () => {
  it('should render right', () => {
    expect(highlight('', '1234')).toMatchSnapshot();
    expect(highlight('1', '1234')).toMatchSnapshot();
    expect(highlight('2', '1234')).toMatchSnapshot();
    expect(highlight('23', '1234')).toMatchSnapshot();
  });
});
