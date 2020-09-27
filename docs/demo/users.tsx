/* eslint-disable react/jsx-no-target-blank */

import React from 'react';

const USERS = [
  {
    name: 'UmiJS',
    link: 'https://umijs.org',
    logo:
      'https://gw.alipayobjects.com/zos/bmw-prod/598d14af-4f1c-497d-b579-5ac42cd4dd1f/k7bjua9c_w132_h130.png',
  },
  {
    link: 'https://ahooks.js.org/',
    logo: 'https://ahooks.js.org/logo.svg',
  },
  {
    name: 'Pro Layout',
    link: 'https://prolayout.ant.design',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  },
  {
    name: 'Pro Table',
    link: 'https://protable.ant.design',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  },
  {
    name: 'GGEditor',
    link: 'https://ggeditor.com',
    logo: 'https://img.alicdn.com/tfs/TB1FFA1CFP7gK0jSZFjXXc5aXXa-214-200.png',
  },
  {
    name: 'Remax',
    link: 'https://remaxjs.org',
    logo: 'https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*1NHAQYduQiQAAAAAAAAAAABkARQnAQ',
  },
  {
    name: 'LightProxy',
    link: 'https://lightproxy.org',
    logo:
      'https://user-images.githubusercontent.com/5436704/81533849-83e00f00-9399-11ea-943d-ac5fd4653906.png',
  },
  {
    name: 'juejin-im',
    link: 'https://juejin-im.github.io/open-source/',
    logo: 'https://avatars3.githubusercontent.com/u/69633008?s=200&v=4',
  },
];

export default () => {
  return (
    <ul style={{ display: 'flex', flexWrap: 'wrap', margin: 0, padding: 0, listStyle: 'none' }}>
      {USERS.map((user, i) => (
        <li
          key={user.link}
          style={{
            width: 224,
            marginRight: i === USERS.length - 1 ? 0 : 16,
            marginBottom: 8,
            border: '1px solid #eee',
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          <a
            style={{ display: 'block', color: '#666', padding: '18px 32px' }}
            target="_blank"
            href={user.link}
          >
            <img
              width={(user.name && 32) || undefined}
              height={(!user.name && 32) || undefined}
              style={{ verticalAlign: '-0.32em', marginRight: 8 }}
              src={user.logo}
              alt={user.name}
            />
            {user.name}
          </a>
        </li>
      ))}
    </ul>
  );
};
