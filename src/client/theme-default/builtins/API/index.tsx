import { useAtomAssets, useIntl, useRouteMeta } from 'dumi';
import type { AtomComponentAsset } from 'dumi-assets-types';
import React, { useEffect, useMemo, useState, type FC } from 'react';
import Badge from '../Badge';
import Table from '../Table';
import './index.less';

type PropertySchema = NonNullable<
  AtomComponentAsset['propsConfig']['properties']
>[string];

const HANDLERS = {
  // entry method
  toString(prop: PropertySchema): string {
    if (typeof prop.type === 'string' && prop.type in this) {
      // value from TypeMap
      if ('enum' in prop) return this.enum(prop);

      return (this as any)[prop.type](prop);
    } else if (prop.type) {
      // non-parsed type, such as ReactNode
      return this.getValidClassName(prop) || prop.type;
    } else if ('const' in prop) {
      // const value
      return `${prop.const}`;
    } else if ('oneOf' in prop) {
      // oneOf value
      return this.oneOf(prop);
    }

    // unknown type
    return `unknown`;
  },

  // type handlers
  string(prop: PropertySchema) {
    return prop.type;
  },
  number(prop: PropertySchema) {
    return prop.type;
  },
  boolean(prop: PropertySchema) {
    return prop.type;
  },
  any(prop: PropertySchema) {
    return prop.type;
  },
  object(prop: Extract<PropertySchema, { type: 'object' }>) {
    let props: string[] = [];

    Object.entries(prop.properties || {}).forEach(([key, value]) => {
      // skip nested object type
      props.push(
        `${key}${prop.required?.includes(key) ? '' : '?'}: ${
          value.type === 'object' ? 'object' : this.toString(value)
        }`,
      );
    });

    return props.length ? `{ ${props.join('; ')} }` : '{}';
  },
  array(prop: Extract<PropertySchema, { type: 'array' }>) {
    if (prop.items) {
      const className = this.getValidClassName(prop.items);

      return className ? `${className}[]` : `${this.toString(prop.items)}[]`;
    }

    return 'any[]';
  },
  // FIXME: extract real type
  element(prop: any) {
    return `<${prop.componentName} />`;
  },
  // FIXME: extract real type
  function({ signature }: any) {
    // handle Function type without signature
    if (!signature) return 'Function';

    const signatures = 'oneOf' in signature ? signature.oneOf : [signature];

    return signatures
      .map(
        (signature: any) =>
          `${signature.isAsync ? 'async ' : ''}(${signature.arguments
            .map(
              (arg: any) =>
                `${arg.key}${arg.hasQuestionToken ? '?' : ''}: ${this.toString(
                  arg,
                )}`,
            )
            .join(', ')}) => ${this.toString(signature.returnType)}`,
      )
      .join(' | ');
  },
  // FIXME: extract real type
  dom(prop: any) {
    return prop.className || 'DOM';
  },

  // special handlers
  enum(prop: PropertySchema) {
    return prop.enum!.map((v) => JSON.stringify(v)).join(' | ');
  },
  oneOf(prop: PropertySchema): string {
    return prop
      .oneOf!.map((v) => this.getValidClassName(v) || this.toString(v))
      .join(' | ');
  },

  // utils
  getValidClassName(prop: PropertySchema) {
    return 'className' in prop &&
      typeof prop.className === 'string' &&
      prop.className !== '__type'
      ? prop.className
      : null;
  },
};

const APIType: FC<PropertySchema> = (prop) => {
  const [type, setType] = useState(() => HANDLERS.toString(prop));

  useEffect(() => {
    setType(HANDLERS.toString(prop));
  }, [prop]);

  return <code>{type}</code>;
};

type ReleaseInfo = Record<string, string[]>;
type VersionInfo = Record<string, string>;

function getReleaseAndVersionInfo(
  props: Record<string, PropertySchema>,
): [ReleaseInfo, VersionInfo] {
  const releaseInfo: ReleaseInfo = {};
  const versionInfo: VersionInfo = {};

  Object.entries(props).forEach(([prop, schema]) => {
    const modiferTags: string[] = schema.tags?.modifierTags;
    const blockTags: {
      tag: string;
      content: { kind: string; text: string }[];
    }[] = schema.tags?.blockTags;
    modiferTags?.forEach((tag) => {
      if (tag === 'alpha' || tag === 'beta' || tag === 'experimental') {
        releaseInfo[prop] = [tag];
      }
    });
    blockTags?.forEach(({ tag, content }) => {
      if (tag === 'deprecated' || tag === 'version' || tag === 'since') {
        const textContent = content.map((item) => item.text).join('');
        if (tag === 'version') {
          versionInfo[prop] = textContent;
        } else {
          releaseInfo[prop] = [tag, textContent];
        }
      }
    });
  });
  return [releaseInfo, versionInfo];
}

const APIRelease: FC<{ name: string; info: string[] }> = ({ name, info }) => {
  const intl = useIntl();
  const [modifer, text] = info;
  const modiferProps: any = {
    className: 'dumi-default-api-release-modifer',
    ['data-release']: modifer,
  };
  if (text && modifer === 'deprecated') {
    modiferProps['data-dumi-tooltip'] = text;
  }
  const modiferText =
    modifer === 'since'
      ? `${text}+`
      : intl.formatMessage({ id: `api.component.release.${modifer}` });
  return (
    <span className="dumi-default-api-release">
      <span className="dumi-default-api-release-name" data-release={modifer}>
        {name}
      </span>
      <span {...modiferProps}>
        {modifer === 'deprecated' ? (
          modiferText
        ) : (
          <Badge type="info">{modiferText}</Badge>
        )}
      </span>
    </span>
  );
};

const API: FC<{
  id?: string;
  type?: 'props' | 'events' | 'slots' | 'imperative';
}> = (props) => {
  const { frontmatter } = useRouteMeta();
  const { components } = useAtomAssets();
  const id = props.id || frontmatter.atomId;
  const intl = useIntl();

  if (!id) throw new Error('`id` properties if required for API component!');

  const definition = components?.[id];

  let properties: Record<string, PropertySchema> = {};

  let type = (props.type || 'props').toLowerCase();

  if (definition) {
    let key = `${type}Config` as 'propsConfig';
    properties = definition[key]?.properties || {};
  }

  const [releaseInfo, versionInfo] = useMemo(() => {
    return getReleaseAndVersionInfo(properties);
  }, [properties]);

  return (
    <div className="markdown">
      <Table>
        <thead>
          <tr>
            <th>{intl.formatMessage({ id: 'api.component.name' })}</th>
            <th>{intl.formatMessage({ id: 'api.component.description' })}</th>
            <th>{intl.formatMessage({ id: 'api.component.type' })}</th>
            {props.type === 'props' && (
              <th>{intl.formatMessage({ id: 'api.component.default' })}</th>
            )}
            {Object.keys(versionInfo).length > 0 && (
              <th>{intl.formatMessage({ id: 'api.component.version' })}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {Object.keys(properties).length ? (
            Object.entries(properties).map(([name, prop]) => (
              <tr key={name}>
                <td>
                  {releaseInfo[name] ? (
                    <APIRelease name={name} info={releaseInfo[name]} />
                  ) : (
                    name
                  )}
                </td>
                <td>{prop.description || '--'}</td>
                <td>
                  <APIType {...prop} />
                </td>
                {props.type === 'props' && (
                  <td>
                    <code>
                      {definition.propsConfig.required?.includes(name)
                        ? intl.formatMessage({ id: 'api.component.required' })
                        : JSON.stringify(prop.default) || '--'}
                    </code>
                  </td>
                )}
                {versionInfo[name] && (
                  <td>
                    {versionInfo[name] && <span>{versionInfo[name]}</span>}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>
                {intl.formatMessage(
                  {
                    id: `api.component.${
                      components ? 'not.found' : 'unavailable'
                    }`,
                  },
                  { id },
                )}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default API;
