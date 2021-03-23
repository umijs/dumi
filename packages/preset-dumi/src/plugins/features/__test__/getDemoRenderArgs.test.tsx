import '@testing-library/jest-dom';
import type { IRouteComponentProps } from '@umijs/types';
import { render } from '@testing-library/react';
import demos from './__mocks__/@@/dumi/demos';
import getDemoRenderArgs from '../demo/getDemoRenderArgs';

describe('feature: getDemoRenderArgs', () => {
  const baseProps = {
    location: {
      query: {},
    },
    match: {
      params: { uuid: 'a' },
    },
  } as IRouteComponentProps<{ uuid: string }, { wrapper: string; capture: string }>;

  it('should return args for inline mode', () => {
    const args = getDemoRenderArgs(baseProps, demos);

    // expect children element
    expect(args).toHaveLength(1);

    // expect a react element
    expect(args[0].$$typeof).not.toBeUndefined();

    // expect render demo directly
    const { container } = render(args[0]);

    expect(container.innerHTML).toContain(demos[baseProps.match.params.uuid].component());
  });

  it('should return args for wrapper mode', () => {
    const args = getDemoRenderArgs(
      {
        ...baseProps,
        location: {
          ...baseProps.location,
          query: {
            wrapper: null,
          },
        },
      },
      demos,
    );

    // expect props & children element
    expect(args).toHaveLength(2);

    // expect props.title equal with demos module
    expect(args[0].title).toEqual(demos[baseProps.match.params.uuid].previewerProps.title);

    // expect force to hide external action
    expect(args[0].hideActions.includes('EXTERNAL')).toBeTruthy();
  });

  it('should return args for capture mode', () => {
    const args = getDemoRenderArgs(
      {
        ...baseProps,
        location: {
          ...baseProps.location,
          query: {
            wrapper: null,
            capture: null,
          },
        },
      },
      demos,
    );

    // expect motions props whatever
    expect(Array.isArray(args[0].motions)).toBeTruthy();

    // expect motions contains autoplay
    expect(args[0].motions.includes('autoplay')).toBeTruthy();
  });
});
