import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

const TestComponent = () => <Text>Hello Test</Text>;

test('renders correctly', () => {
  const { getByText } = render(<TestComponent />);
  expect(getByText('Hello Test')).toBeTruthy();
});