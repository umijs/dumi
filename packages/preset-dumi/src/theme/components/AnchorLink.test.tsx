import '@testing-library/jest-dom';
import React from 'react';
import { Router } from '@umijs/runtime';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import AnchorLink from './AnchorLink';

describe('theme API: AnchorLink', () => {
  let anchor: any;
  let stub: any;
  let scrollTo: any;

  beforeAll(async () => {
    render(
      <Router history={createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 })}>
        <AnchorLink to="#anchor" id="anchor">
          Anchor
        </AnchorLink>
      </Router>,
    );

    // FIXME: RAF not working
    stub = window.requestAnimationFrame;
    window.requestAnimationFrame = setTimeout;

    // find anchor element
    anchor = await screen.findByText('Anchor');
  });

  afterAll(() => {
    window.requestAnimationFrame = stub;
    window.scrollTo = scrollTo;
  });

  it('should scroll to anchor after click', async () => {
    // FIXME: element.offsetTop not working in jest
    Object.defineProperty(anchor, 'offsetTop', { value: 110 });

    scrollTo = window.scrollTo;
    // mock a scrollTo for jest
    // @ts-ignore
    window.scrollTo = jest.fn((x, y) => {
      document.documentElement.scrollTop = y;
    });

    // expect scroll to anchor when click (distance 100px from top)
    expect(document.documentElement.scrollTop).toEqual(0);
    anchor.click();
    await waitFor(() => expect(document.documentElement.scrollTop).toEqual(10), { timeout: 100 });
  });

  it('should active anchor if hash is matched', () => {
    // expect highlight for anchor
    expect(anchor).toHaveClass('active');
  });
});
