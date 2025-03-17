module.exports = {
    // Set the test environment to jsdom for React component testing
    testEnvironment: 'jsdom',
    
    // The root directory where Jest should scan for tests
    rootDir: '.',
    
    // Where to find test files
    testMatch: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    
    // Files to ignore
    testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/'],
    
    // File extensions Jest will look for
    moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
    
    // Transform files with babel-jest
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    
    // Handle static assets (which aren't JavaScript)
    moduleNameMapper: {
      '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
      '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    },
    
    // Setup files to run before tests
    //setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    
    // Coverage configuration
    collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.d.ts',
      '!src/index.js',
      '!src/serviceWorker.js',
    ],
    
    // Coverage directory
    coverageDirectory: 'coverage',
    
    // Verbose output
    verbose: true,
  };