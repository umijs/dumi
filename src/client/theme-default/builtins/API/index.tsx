import { useAtomAssets, useIntl, useRouteMeta } from 'dumi';
import type { AtomComponentAsset } from 'dumi-assets-types';
import React, { useEffect, useState, type FC } from 'react';
import Table from '../Table';

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
            .map((arg: any) => `${arg.key}: ${this.toString(arg)}`)
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

const API: FC<{ id?: string }> = (props) => {
  const { frontmatter } = useRouteMeta();
  const { components } = useAtomAssets();
  const id = props.id || frontmatter.atomId;
  const intl = useIntl();

  if (!id) throw new Error('`id` properties if required for API component!');

  const definition = components?.[id];

  return (
    <div className="markdown">
      <Table>
        <thead>
          <tr>
            <th>{intl.formatMessage({ id: 'api.component.name' })}</th>
            <th>{intl.formatMessage({ id: 'api.component.description' })}</th>
            <th>{intl.formatMessage({ id: 'api.component.type' })}</th>
            <th>{intl.formatMessage({ id: 'api.component.default' })}</th>
          </tr>
        </thead>
        <tbody>
          {definition && definition.propsConfig?.properties ? (
            Object.entries(definition.propsConfig.properties).map(
              ([name, prop]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{prop.description || '--'}</td>
                  <td>
                    <APIType {...prop} />
                  </td>
                  <td>
                    <code>
                      {definition.propsConfig.required?.includes(name)
                        ? intl.formatMessage({ id: 'api.component.required' })
                        : JSON.stringify(prop.default) || '--'}
                    </code>
                  </td>
                </tr>
              ),
            )
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
