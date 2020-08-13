import '@testing-library/jest-dom';
import React from 'react';
import { Router } from '@umijs/runtime';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import Link from './Link';

describe('theme API: Link', () => {
  it('should render normal link', async () => {
    render(
      <Router history={createMemoryHistory()}>
        <Link to="/">Normal</Link>
      </Router>,
    );
    expect(await screen.findByText('Normal')).toHaveAttribute('href', '/');
  });

  it('should render external link', async () => {
    render(
      <Router history={createMemoryHistory()}>
        <Link to="https://d.umijs.org">External</Link>
      </Router>,
    );
    expect(await screen.findByText('External')).toHaveAttribute('target', '_blank');
  });
});
