import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Simple test component
const TestComponent = () => {
  return <div>This is the test</div>
}

describe('React Testing Library Integration', () => {
  it('should render component correctly', () => {
    render(<TestComponent />)
    
    expect(screen.getByText('This is the test')).toBeInTheDocument()
  })
})