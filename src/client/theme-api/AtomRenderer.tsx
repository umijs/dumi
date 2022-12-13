import { useSiteData } from 'dumi';
import { AtomAsset, ExamplePresetAsset } from 'dumi-assets-types';
import type { TypeMap } from 'dumi-assets-types/typings/atom/props/types';
import React, { type FC } from 'react';

interface IAtomRendererProps {
  type: AtomAsset['type'];
  value: ExamplePresetAsset['value'];
  processor?: typeof builtInProcessor;
}

type Entity = TypeMap['element'] | TypeMap['function'] | TypeMap['dom'];
type Exports = Record<string, any>;

function builtInProcessor(entity: Entity, entryExports: Exports) {
  let mod: any;

  switch (entity.$$__type) {
    case 'function':
      // eslint-disable-next-line no-eval
      return eval(entity.$$__body.sourceCode);

    case 'element':
      // find child component from entry exports
      mod = entity.$$__body.componentName
        .split('.')
        .reduce((col: any, cur: string) => col[cur], entryExports);

      // fallback to HTML tag
      if (mod === undefined) return entity.$$__body.componentName;

      // support pure render for antd components
      return '_InternalPanelDoNotUseOrYouWillBeFired' in mod
        ? mod._InternalPanelDoNotUseOrYouWillBeFired
        : mod;
  }
}

function deepReplace(
  value: IAtomRendererProps['value'],
  entityProcessor: any,
): any {
  // transform array props
  if (Array.isArray(value)) {
    return value.map((e) => deepReplace(e, entityProcessor));
  }

  // transform element props
  if (typeof value === 'object' && value?.$$__type === 'element') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return translatePresetToReact(value.$$__body, entityProcessor);
  }

  // transform pure object props
  if (
    typeof value === 'object' &&
    Object.prototype.toString.call(value) === '[object Object]'
  ) {
    return Object.entries(value).reduce(
      (col, [key, value]) => ({
        ...col,
        [key]: deepReplace(value, entityProcessor),
      }),
      {},
    );
  }

  return value;
}

function translatePresetToReact(
  value: IAtomRendererProps['value'],
  processor: (entity: Entity) => any,
) {
  const { props, size } = value;
  const Component = processor({ $$__type: 'element', $$__body: value });

  return React.createElement(
    Component,
    deepReplace({ ...props, style: { ...props.style, ...size } }, processor),
  );
}

export const AtomRenderer: FC<IAtomRendererProps> = (props) => {
  const { entryExports } = useSiteData();

  switch (props.type) {
    case 'COMPONENT':
      return translatePresetToReact(
        props.value,
        (entity) =>
          // support custom processor
          props.processor?.(entity, entryExports) ??
          // fallback to built-in processor
          builtInProcessor(entity, entryExports),
      );

    default:
      // TODO: handle FUNCTION type
      return <>{props.type} atom is not supported.</>;
  }
};
