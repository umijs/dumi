import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Foo from './index';

describe('<Foo />', () => {
  it('render Foo with dumi', () => {
    const msg = 'dumi';

    render(<Foo title={msg} />);
    expect(screen.queryByText(msg)).toBeInTheDocument();
  });
});
