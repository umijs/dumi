import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import Alert from './Alert';

describe('default theme: Alert', () => {
  it('render correctly', async () => {
    const { container } = render(<Alert type="info">Alert</Alert>);

    expect(container.firstChild).toHaveAttribute('type', 'info');
  });
});
