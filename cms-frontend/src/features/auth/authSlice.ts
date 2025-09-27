import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
}

const initialState: AuthState = {
  access_token: localStorage.getItem('access_token'),
  refresh_token: localStorage.getItem('refresh_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      state.access_token = action.payload.access;
      state.refresh_token = action.payload.refresh;
      localStorage.setItem('access_token', action.payload.access);
      localStorage.setItem('refresh_token', action.payload.refresh);
    },
    logout: (state) => {
      state.access_token = null;
      state.refresh_token = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  },
});

export const { setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
