import React, { useContext } from 'react';
import { context, useApiData, IApiComponentProps } from 'dumi/theme';

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

export default ({ identifier, exports: expts }: IApiComponentProps) => {
  const data = useApiData(identifier);
  const { locale } = useContext(context);
  const texts = LOCALE_TEXTS[locale] || LOCALE_TEXTS['en-US'];

  return (
    <>
      {data &&
        expts.map(expt => (
          <React.Fragment key={expt}>
            {expt !== 'default' && <h3>{expt}</h3>}
            <table style={{ marginTop: 24 }}>
              <thead>
                <tr>
                  <th>{texts.name}</th>
                  <th>{texts.description}</th>
                  <th>{texts.type}</th>
                  <th>{texts.default}</th>
                </tr>
              </thead>
              <tbody>
                {data[expt].map(row => (
                  <tr key={row.identifier}>
                    <td>{row.identifier}</td>
                    <td>{row.description || '--'}</td>
                    <td>
                      <code>{row.type}</code>
                    </td>
                    <td>
                      <code>{row.default || (row.required && texts.required) || '--'}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </React.Fragment>
        ))}
    </>
  );
};
