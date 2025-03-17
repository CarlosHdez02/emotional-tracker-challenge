import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Cookie from 'js-cookie';
import { AuthProvider, AuthContext } from '../../context/AuthContext';

// Mock dependencies
jest.mock('axios');
jest.mock('js-cookie');
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Test component to access context values
const TestConsumer = () => {
  const context = React.useContext(AuthContext);
  return (
    <div>
      <div data-testid="user">{context.user ? JSON.stringify(context.user) : 'no user'}</div>
      <div data-testid="loading">{context.loading.toString()}</div>
      <button onClick={() => context.login({ email: 'test@example.com', password: 'password' })}>Login</button>
      <button onClick={() => context.logout()}>Logout</button>
      <button onClick={() => context.register({ email: 'test@example.com', password: 'password' })}>Register</button>
      <button onClick={() => context.updateProfile({ name: 'Updated Name' })}>Update Profile</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the checkUserLoggedIn function behavior
    axios.get.mockImplementation((url) => {
      if (url.includes('/users/profile')) {
        return Promise.resolve({ data: { id: '1', name: 'Test User', email: 'test@example.com' } });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    Cookie.get.mockImplementation((name) => {
      if (name === 'token') return 'fake-token';
      return null;
    });
  });

  test('provides the authentication context with initial values', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    // Initially loading should be true
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Wait for checkUserLoggedIn to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // User should be set from the profile API call
    expect(screen.getByTestId('user').textContent).toContain('Test User');
  });

  test('handles login correctly', async () => {
    const userData = { id: '1', name: 'Test User', email: 'test@example.com', token: 'new-token' };
    axios.post.mockResolvedValueOnce({ data: { data: userData } });
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Click login button
    screen.getByText('Login').click();
    
    await waitFor(() => {
      // Check axios call
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5050/api/users/login',
        { email: 'test@example.com', password: 'password' }
      );
      
      // Check cookie was set
      expect(Cookie.set).toHaveBeenCalledWith('token', 'new-token');
    });
  });

  test('handles logout correctly', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Click logout button
    screen.getByText('Logout').click();
    
    expect(Cookie.remove).toHaveBeenCalledWith('token');
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('no user');
    });
  });

  test('handles register correctly', async () => {
    const userData = { id: '1', name: 'New User', email: 'test@example.com', token: 'register-token' };
    axios.post.mockResolvedValueOnce({ data: userData });
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Click register button
    screen.getByText('Register').click();
    
    await waitFor(() => {
      // Check axios call
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5050/api/users/register',
        { email: 'test@example.com', password: 'password' }
      );
      
      // Check cookie was set
      expect(Cookie.set).toHaveBeenCalledWith('token', 'register-token');
      
      // Check user was updated
      expect(screen.getByTestId('user').textContent).toContain('New User');
    });
  });

  test('handles updateProfile correctly', async () => {
    const updatedUserData = { id: '1', name: 'Updated Name', email: 'test@example.com' };
    axios.put.mockResolvedValueOnce({ data: updatedUserData });
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Click update profile button
    screen.getByText('Update Profile').click();
    
    await waitFor(() => {
      // Check axios call
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5050/api/users/profile',
        { name: 'Updated Name' },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      
      // Check user was updated
      expect(screen.getByTestId('user').textContent).toContain('Updated Name');
    });
  });

  test('handles failed authentication on initial load', async () => {
    // Override the default mock to simulate no token
    Cookie.get.mockReturnValueOnce(null);
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('no user');
    });
  });

  test('handles API error on initial load', async () => {
    // Override the default mock to simulate API error
    axios.get.mockRejectedValueOnce(new Error('API error'));
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('no user');
      expect(Cookie.remove).toHaveBeenCalledWith('token');
    });
  });

  test('sets cookies with expiration for "remember me"', async () => {
    const userData = { id: '1', name: 'Test User', email: 'test@example.com', token: 'remember-token' };
    axios.post.mockResolvedValueOnce({ data: { data: userData } });
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    // Create a test component with explicit props
    const LoginTest = () => {
      const { login } = React.useContext(AuthContext);
      return (
        <button onClick={() => login({ email: 'test@example.com', password: 'password' }, true)}>
          Remember Login
        </button>
      );
    };
    
    // Render the test component
    render(
      <AuthProvider>
        <LoginTest />
      </AuthProvider>
    );
    
    // Click remember login button
    screen.getByText('Remember Login').click();
    
    await waitFor(() => {
      expect(Cookie.set).toHaveBeenCalledWith('token', 'remember-token', { expires: 30 });
    });
  });
});