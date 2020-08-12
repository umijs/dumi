import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import SourceCode from './SourceCode';

describe('default theme: SourceCode', () => {
  it('render correctly', async () => {
    const code = "console.log('Hello World!')";
    const { container, getByText } = render(<SourceCode code={code} lang="javascript" />);

    // check content
    expect(container.firstChild.textContent).toEqual(code);

    // check highlight
    expect(getByText('console')).toHaveClass('token');
  });
});
