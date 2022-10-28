import React, { useContext } from 'react';
import type { IApiComponentProps } from 'dumi/theme';
import { context, useApiData } from 'dumi/theme';
import Table from './Table';

const PRIMARY_TYPES = [
  'string',
  'number',
  'boolean',
  'object',
  'array',
  'function',
  'symbol',
  'any',
  'void',
  'null',
  'undefined',
  'never',
  '',
];

const TYPE_SPLIT = /\||\&|,|\<|\>| |\=|\[|\]|\(|\)|\:|"|'/;

const isPrimaryType = (type: string) => {
  type = type.toLocaleLowerCase();
  if (PRIMARY_TYPES.includes(type)) return true;
  if (type.startsWith('React.')) return true;
  const types = type.split(TYPE_SPLIT);
  if (types.length > 1) {
    return types.every(isPrimaryType);
  } else {
    return PRIMARY_TYPES.includes(types[0]);
  }
};

const getComplicatedType = (type: string) => {
  type = type.toLocaleLowerCase();
  if (PRIMARY_TYPES.includes(type)) return '';
  if (type.startsWith('React.')) return '';
  const cts = type.split(TYPE_SPLIT).filter(t => !isPrimaryType(t));
  if (cts.length >= 1) {
    return cts[0];
  } else {
    return false;
  }
};

const LOCALE_TEXTS = {
  'zh-CN': {
    name: '属性名',
    description: '描述',
    type: '类型',
    default: '默认值',
    required: '(必选)',
  },
  'en-US': {
    name: 'Name',
    description: 'Description',
    type: 'Type',
    default: 'Default',
    required: '(required)',
  },
};
/**
 * syntax: {@link namepathOrURL|link text}
 */
// const linkReg = /@link\s*?\{[^\}\(\)\{@]*?(\([^\}\(\)\{@]*?\))?\s*?\}/g;
const linkRegG = /\{@link\s*?(\S*?)\s*?\|(.*?)\}/g;
const linkReg = /\{@link\s*?(\S*?)\s*?\|(.*?)\}/;

export default ({ identifier, export: expt }: IApiComponentProps) => {
  const data = useApiData(identifier);
  const { locale } = useContext(context);
  const texts = /^zh|cn$/i.test(locale) ? LOCALE_TEXTS['zh-CN'] : LOCALE_TEXTS['en-US'];

  return (
    <>
      {data && (
        <Table>
          <thead>
            <tr>
              <th>{texts.name}</th>
              <th>{texts.description}</th>
              <th>{texts.type}</th>
              <th>{texts.default}</th>
            </tr>
          </thead>
          <tbody>
            {data[expt]?.map(row => {
              if (linkReg.test(row.description)) {
                const groups = row.description.match(linkRegG);
                const links = groups.map(group => {
                  const [, target, name] = group.match(linkReg);
                  return {
                    title: name,
                    url: target,
                  };
                });
                row.links = links;
                row.description = row.description.replaceAll(linkRegG, '');
              }
              return (
                <tr key={row.identifier}>
                  <td>{row.identifier}</td>
                  <td>
                    <span dangerouslySetInnerHTML={{ __html: row.description }}></span>
                    {row.links?.map((link, i) => (
                      <a key={link.title} href={link.url}>
                        {link.title}
                      </a>
                    ))}
                  </td>
                  <td>
                    <a
                      href={
                        isPrimaryType(row.type)
                          ? 'javascript:void(0);'
                          : `#entity-${getComplicatedType(row.type)}`
                      }
                    >
                      <code>{row.type}</code>
                    </a>
                  </td>
                  <td>
                    <code>{row.default || (row.required && texts.required) || '--'}</code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
};
