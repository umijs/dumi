import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import Badge from './Badge';

describe('default theme: Badge', () => {
  it('render correctly', async () => {
    const { container } = render(<Badge type="info">Badge</Badge>);

    expect(container.firstChild).toHaveClass('__dumi-default-badge');
  });
});
