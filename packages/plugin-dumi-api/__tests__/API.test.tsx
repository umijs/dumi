import React from 'react';
import { render } from '@testing-library/react';
import API from '../src/API';

jest.mock('@@/dumi/apis', () => {
  return {
    Hello: {
      default: [
        {
          identifier: 'className',
          description: 'Extra CSS className for this component',
          'description.zh-CN': '组件额外的 CSS className',
          type: 'string',
        },
        {
          identifier: 'type',
          description: "I'm required",
          'description.zh-CN': '我是一个必选属性',
          type: 'string',
          required: true,
        },
      ],
    },
  };
});

describe('API component', () => {
  test('Match snapshot', () => {
    const { asFragment } = render(<API hideTitle={false} identifier="Hello" export="default" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
