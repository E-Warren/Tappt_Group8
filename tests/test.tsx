import React from 'react';
import { render } from '@testing-library/react-native';
import Index from '../app/index';

test('Index renders as expected', () => {
  const { getByText } = render(<Index />);
  expect(getByText('How would you like to play?')).toBeTruthy();
});
