import { useAtomAssets, useIntl, useRouteMeta, useSiteData } from 'dumi';
import type { AtomComponentAsset } from 'dumi-assets-types';
import React, { ReactNode, useEffect, useMemo, useState, type FC } from 'react';
import Badge from '../Badge';
import Table from '../Table';
import './index.less';

type PropertySchema = NonNullable<
  AtomComponentAsset['propsConfig']['properties']
>[string];

function Token({ children }: { children: string }) {
  return <span data-token={children}>{children}</span>;
}

// https://github.com/umijs/dumi/issues/1957
function fixArg(arg: any) {
  if (arg.hasQuestionToken && typeof arg.type === 'string') {
    arg.type = arg.type.replace(/\s+\|\s+undefined\s*$/i, '');
  }
  return arg;
}

// Usually handles types other than basic types, either interfaces or type aliases
const CompositeType: FC<PropertySchema> = (prop: PropertySchema) => {
  const intl = useIntl();
  const { themeConfig } = useSiteData();
  return prop.source?.[0] && themeConfig.sourceLink ? (
    <a
      className="dumi-default-api-link"
      href={intl.formatMessage(
        { id: '$internal.api.sourceLink' },
        { ...prop.source[0] },
      )}
      target="_blank"
      rel="noreferrer"
    >
      {prop.className}
    </a>
  ) : (
    prop.className
  );
};

const HANDLERS = {
  // entry method
  toNode(prop: PropertySchema): ReactNode {
    if (typeof prop.type === 'string' && prop.type in this) {
      // value from TypeMap
      if ('enum' in prop) return this.enum(prop);

      return (this as any)[prop.type](prop);
    } else if (prop.type) {
      // non-parsed type, such as ReactNode
      return this.getValidClassName(prop) || <span>{prop.type}</span>;
    } else if ('const' in prop) {
      // const value
      return <span>{prop.const}</span>;
    } else if ('oneOf' in prop) {
      // oneOf value
      return this.oneOf(prop);
    }

    // unknown type
    return <span>unknown</span>;
  },

  // type handlers
  string(prop: PropertySchema): ReactNode {
    return <span>{prop.type}</span>;
  },
  number(prop: PropertySchema): ReactNode {
    return <span>{prop.type}</span>;
  },
  boolean(prop: PropertySchema): ReactNode {
    return <span>{prop.type}</span>;
  },
  any(prop: PropertySchema): ReactNode {
    return <span>{prop.type}</span>;
  },
  object(prop: Extract<PropertySchema, { type: 'object' }>): ReactNode {
    const entries = Object.entries(prop.properties || {});
    const props = entries.map(([key, value], index) => {
      // skip nested object type
      return (
        <span key={key}>
          <span>{key}</span>
          {!prop.required?.includes(key) && <Token>?</Token>}
          <Token>:</Token>
          {value.type === 'object' ? <span>object</span> : this.toNode(value)}
          {index < entries.length - 1 && <Token>;</Token>}
        </span>
      );
    });
    return (
      <span>
        <Token>{'{'}</Token>
        {props}
        <Token>{'}'}</Token>
      </span>
    );
  },
  array(prop: Extract<PropertySchema, { type: 'array' }>): ReactNode {
    let arrayType: ReactNode = <span>any</span>;
    if (prop.items) {
      const className = this.getValidClassName(prop.items);
      arrayType = className ?? this.toNode(prop.items);
    }
    return (
      <span>
        {arrayType}
        <Token>{'['}</Token>
        <Token>{']'}</Token>
      </span>
    );
  },
  // FIXME: extract real type
  element(prop: any): ReactNode {
    return (
      <span>
        <Token>&lt;</Token>
        <span>{prop.componentName}</span>
        <Token>&gt;</Token>
      </span>
    );
  },
  // FIXME: extract real type
  function({ signature }: any) {
    // handle Function type without signature
    if (!signature) return <span>Function</span>;

    const signatures = 'oneOf' in signature ? signature.oneOf : [signature];

    return signatures.map((signature: any, si: number) => {
      return (
        <span key={`${si}`}>
          {signature.isAsync ? <Token>async</Token> : ''}
          <Token>{'('}</Token>
          {signature.arguments.map((arg: any, ai: number) => {
            return (
              <span key={`${si}${ai}`}>
                <span>{arg.key}</span>
                {arg.hasQuestionToken && <Token>?</Token>}
                <Token>:</Token>
                {this.toNode(!!arg.schema ? arg.schema : fixArg(arg))}
                {ai < signature.arguments.length - 1 && <Token>,</Token>}
              </span>
            );
          })}
          <Token>{')'}</Token>
          <Token>=&gt;</Token>
          {this.toNode(signature.returnType)}
          {si < signatures.length - 1 && <Token>|</Token>}
        </span>
      );
    });
  },
  // FIXME: extract real type
  dom(prop: any): ReactNode {
    return <span>{prop.className || 'DOM'}</span>;
  },

  // special handlers
  enum(prop: PropertySchema) {
    const enumStringArray = prop.enum!.map((v) => JSON.stringify(v));
    return (
      <span>
        {enumStringArray.map((e, i) => (
          <span key={i}>
            <span>{e}</span>
            {i < enumStringArray.length - 1 && <Token>|</Token>}
          </span>
        ))}
      </span>
    );
  },
  oneOf(prop: PropertySchema): ReactNode {
    return prop.oneOf!.map((v, i) => {
      return (
        <span key={i}>
          {this.getValidClassName(v) || this.toNode(v)}
          {i < prop.oneOf!.length - 1 && <Token>|</Token>}
        </span>
      );
    });
  },

  reference(prop: Extract<PropertySchema, { type: 'reference' }>): ReactNode {
    const typeParameters = prop.typeParameters || [];
    const params = typeParameters.map((param, i) => (
      <span key={i}>
        {this.toNode(param)}
        {i < typeParameters.length - 1 && <Token>,</Token>}
      </span>
    ));
    return (
      <>
        <a
          className="dumi-default-api-link"
          href={prop.externalUrl}
          target="_blank"
          rel="noreferrer"
        >
          {prop.name}
        </a>
        {params.length ? (
          <>
            <Token>&lt;</Token>
            {params}
            <Token>&gt;</Token>
          </>
        ) : (
          ''
        )}
      </>
    );
  },

  // utils
  getValidClassName(prop: PropertySchema): ReactNode {
    if (
      'className' in prop &&
      typeof prop.className === 'string' &&
      prop.className !== '__type'
    ) {
      return <CompositeType {...prop} />;
    }
    return null;
  },
};

const APIType: FC<PropertySchema> = (prop) => {
  const [type, setType] = useState(() => HANDLERS.toNode(prop));

  useEffect(() => {
    setType(HANDLERS.toNode(prop));
  }, [prop]);

  return <code className="dumi-default-api-type">{type}</code>;
};

type ReleaseInfo = Record<string, string[]>;

function getReleaseAndVersionInfo(props: Record<string, PropertySchema>) {
  const releaseInfo: ReleaseInfo = {};

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
      if (tag === 'deprecated' || tag === 'since') {
        const textContent = content.map((item) => item.text).join('');
        releaseInfo[prop] = [tag, textContent];
      }
    });
  });
  return releaseInfo;
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

  const releaseInfo = useMemo(() => {
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
            {type === 'props' && (
              <th>{intl.formatMessage({ id: 'api.component.default' })}</th>
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
                {type === 'props' && (
                  <td>
                    <code>
                      {definition.propsConfig.required?.includes(name)
                        ? intl.formatMessage({ id: 'api.component.required' })
                        : JSON.stringify(prop.default) || '--'}
                    </code>
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
