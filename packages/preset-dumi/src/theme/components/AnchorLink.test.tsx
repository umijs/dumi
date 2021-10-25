import '@testing-library/jest-dom';
import React from 'react';
import { Router } from '@umijs/runtime';
import { render, screen, waitFor, act } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import AnchorLink from './AnchorLink';

describe('theme API: AnchorLink', () => {
  let anchor: any;
  let stub: any;
  let scrollTo: any;

  beforeAll(async () => {
    render(
      <Router history={createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 })}>
        <AnchorLink to="#anchor">
          Anchor
        </AnchorLink>
        <h1 id="anchor">
          <AnchorLink to="#anchor">
            Anchor Title
          </AnchorLink>
        </h1>
      </Router>,
    );

    // FIXME: RAF not working
    stub = window.requestAnimationFrame;
    window.requestAnimationFrame = setTimeout;

    // mock a scrollTo for jest
    scrollTo = window.scrollTo;
    // @ts-ignore
    window.scrollTo = jest.fn((x, y) => {
      document.documentElement.scrollTop = y;
    });

    // find anchor element
    anchor = await screen.findByText('Anchor');
  });

  afterAll(() => {
    window.requestAnimationFrame = stub;
    window.scrollTo = scrollTo;
  });

  it('should scroll to title & active self after click anchor', async () => {
    // FIXME: element.offsetTop not working in jest
    Object.defineProperty(document.getElementById('anchor'), 'offsetTop', { value: 110 });

    // expect scroll to anchor when click (distance 100px from top)
    expect(document.documentElement.scrollTop).toEqual(0);
    anchor.click();
    await waitFor(() => expect(document.documentElement.scrollTop).toEqual(10), { timeout: 100 });

    // expect highlight for anchor
    expect(anchor).toHaveClass('active');
  });

  it('should active anchor if scroll position match title anchors', async () => {
    const { container } = render(
      <Router history={createMemoryHistory({ initialEntries: ['/'], initialIndex: 0 })}>
        <AnchorLink to="#title-1" id="title-1-anchor">
          Anchor
        </AnchorLink>
        <h1 id="title-1">
          <AnchorLink to="#title-1">title-1</AnchorLink>
        </h1>
        <h1 id="title-2">
          <AnchorLink to="#title-2">title-2</AnchorLink>
        </h1>
      </Router>,
    );

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => expect(container.querySelector('#title-1-anchor').classList.contains('active')).toBeTruthy(), { timeout: 200 });
  });
});
