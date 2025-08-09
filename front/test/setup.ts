import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Initialize Firebase Mock before running tests
beforeAll(() => {
  // Mock the Firebase settings for testing
  const mockFirebaseConfig = {
    apiKey: 'mock-api-key',
    authDomain: 'mock-auth-domain',
    projectId: 'mock-project-id',
    storageBucket: 'mock-storage-bucket',
    messagingSenderId: 'mock-sender-id',
    appId: 'mock-app-id'
  }
})

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Clean up after all tests
afterAll(() => {
  // Clean up if necessary
})

// Mock the console.error to suppress unnecessary error logs
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})