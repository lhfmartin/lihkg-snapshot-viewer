import { expect, it } from 'vitest';
import { render } from '@testing-library/react';
import ThreadViewer from '@/src/components/ThreadViewer';

it('renders ThreadViewer', async () => {
  const { container } = await render(<ThreadViewer />);
  expect(container).toMatchSnapshot();
});
