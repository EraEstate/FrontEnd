import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../store/authStore';

// Mock authAPI to prevent real API calls
vi.mock('../../api/auth', () => ({
  authAPI: {
    logout: vi.fn().mockResolvedValue({}),
  }
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  it('should initialize with null user and not authenticated', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle updateUser properly', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'USER',
      avatar: null,
      status: 'ACTIVE',
      isVerified: true
    };

    useAuthStore.setState({ token: 'mock-token' });
    useAuthStore.getState().updateUser(mockUser as any);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true); // Because token was set
  });

  it('should handle logout properly', async () => {
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' }
    });

    // Setup initial authenticated state
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'USER',
        avatar: null,
        status: 'ACTIVE',
        isVerified: true
      } as any,
      token: 'mock-jwt-token',
      isAuthenticated: true,
    });

    // Perform logout
    await useAuthStore.getState().logout();

    // Verify state is reset
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
