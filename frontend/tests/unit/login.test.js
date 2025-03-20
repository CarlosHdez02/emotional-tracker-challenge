import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../../context/AuthContext';
import Login from '../../pages/login';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children }) => {
    return children;
  };
});

describe('Login Component', () => {
  const mockLogin = jest.fn();
  
  const renderLoginWithContext = (contextValue = { login: mockLogin }) => {
    return render(
      <AuthContext.Provider value={contextValue}>
        <Login />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('updates email input value when typed', async () => {
    renderLoginWithContext();
    
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    await userEvent.type(emailInput, 'test@example.com');
    
    expect(emailInput.value).toBe('test@example.com');
  });

  test('updates password input value when typed', async () => {
    renderLoginWithContext();
    
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    await userEvent.type(passwordInput, 'password123');
    
    expect(passwordInput.value).toBe('password123');
  });


  test('calls login function with form data when form is submitted', async () => {
    renderLoginWithContext();
    
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const rememberMeCheckbox = screen.getByLabelText(/Recordarme/i);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(rememberMeCheckbox);
    await userEvent.click(submitButton);
    
    expect(mockLogin).toHaveBeenCalledWith(
      { email: 'test@example.com', password: 'password123' },
      true
    );
  });

  test('shows alert when login fails', async () => {
    const mockLoginWithError = jest.fn().mockRejectedValue(new Error('Failed to login'));
    global.alert = jest.fn();
    
    renderLoginWithContext({ login: mockLoginWithError });
    
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLoginWithError).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Failed to login');
    });
  });
});