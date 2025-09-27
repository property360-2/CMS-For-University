import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setTokens } from '../features/auth/authSlice';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post('token/', { email, password });
      dispatch(setTokens({ access: res.data.access, refresh: res.data.refresh }));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md w-96" onSubmit={handleSubmit}>
        <h1 className="text-2xl mb-4">Login</h1>
        <input
          className="border p-2 w-full mb-4"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-blue-500 text-white p-2 w-full rounded" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
