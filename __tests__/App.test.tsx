/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { WelcomeScreen } from '../src/ui/screens/WelcomeScreen';
import { ReviewScreen } from '../src/ui/screens/ReviewScreen';

jest.mock('react-native-svg', () => {
  const Mock = (props: { children?: React.ReactNode }) => props.children ?? null;
  return { __esModule: true, default: Mock, Path: Mock, Circle: Mock };
});

jest.mock('react-native-safe-area-context', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children,
    SafeAreaView: ({
      children,
      style,
    }: {
      children?: React.ReactNode;
      style?: object;
    }) => ReactLib.createElement(View, { style }, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

function render(element: React.ReactElement) {
  return ReactTestRenderer.create(element);
}

test('welcome screen shows the Paisa Path setup', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = render(<WelcomeScreen onSetup={() => undefined} />);
  });
  const labels = JSON.stringify(tree!.toJSON());
  expect(labels).toContain('Paisa Path');
  expect(labels).toContain('Set up your plan');
});

test('review screen shows the sample surplus', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = render(
      <ReviewScreen onEdit={() => undefined} onContinue={() => undefined} />,
    );
  });
  const labels = JSON.stringify(tree!.toJSON());
  expect(labels).toContain('₹26,000');
  expect(labels).toContain('Your Monthly Surplus');
});
