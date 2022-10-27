import { useAtomAssets, useIntl } from 'dumi';
import React, { type FC } from 'react';
import Table from '../Table';

const API: FC<{ id: string }> = ({ id }) => {
  const { components } = useAtomAssets();
  const definition = components?.[id];
  const intl = useIntl();

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
                    <code>{prop.type!}</code>
                  </td>
                  <td>
                    <code>
                      {definition.propsConfig.required?.includes(name)
                        ? intl.formatMessage({ id: 'api.component.required' })
                        : prop.default || '--'}
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
                    id: `api.component.${components ? 'not.found' : 'loading'}`,
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
