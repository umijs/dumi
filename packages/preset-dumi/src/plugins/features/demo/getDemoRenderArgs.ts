import type { ComponentProps, ReactNode } from 'react';
import type { IRouteComponentProps } from 'dumi';
import React, { FC, ReactElement } from 'react';
// @ts-ignore
import { useMotions } from 'dumi/theme';

type IGetDemoRenderArgs = [ComponentProps<any>, ReactNode] | [ReactNode] | [];

const InlineRender: FC<{
  render: () => ReactElement;
}> = props => {
  return props.render();
};

/**
 * return demo preview arguments for single page route
 * @return [props, children] or [children]
 */
export default (
  props: IRouteComponentProps<{ uuid: string }, { wrapper?: string; capture?: string }>,
  demos: any,
): IGetDemoRenderArgs => {
  let result = [] as IGetDemoRenderArgs;
  const uuid = props.match.params.uuid;
  const inline = props.location.query.wrapper === undefined;
  const demo = demos[uuid];

  if (demo) {
    const previewerProps = {
      ...demo.previewerProps,
      // disallowed matryoshka
      hideActions: (demo.previewerProps.hideActions || []).concat(['EXTERNAL']),
    };

    if (props.location.query.capture !== undefined) {
      // unchain refer
      previewerProps.motions = (previewerProps.motions || []).slice();

      // unshift autoplay motion
      previewerProps.motions.unshift('autoplay');

      // append capture motion if not exist
      if (previewerProps.motions.every(motion => !motion.startsWith('capture'))) {
        // compatible with qiankun app
        previewerProps.motions.push('capture:[id|=root]');
      }
    }

    if (inline) {
      // return demo component with motions handler
      result = [
        React.createElement(InlineRender, {
          render: () => {
            useMotions(
              previewerProps.motions || [],
              typeof window !== 'undefined' ? document.documentElement : null,
            );

            return React.createElement('div', {}, React.createElement(demo.component));
          },
        }),
      ];
    } else {
      // return demo component with previewer props, for render demo via Previewer.tsx in theme
      result = [previewerProps, React.createElement(demo.component)];
    }
  }

  return result;
};
