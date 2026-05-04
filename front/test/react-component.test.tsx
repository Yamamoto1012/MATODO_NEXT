import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const TestComponent = () => {
  return <div>This is the test</div>;
};

describe('React Testing Library Integration', () => {
  it('should render component correctly', () => {
    render(<TestComponent />);

    expect(screen.getByText('This is the test')).toBeInTheDocument();
  });
});
