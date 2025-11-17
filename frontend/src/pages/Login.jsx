import { useState } from 'react';
import { Paper, TextInput, PasswordInput, Button, Text, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Invalid email format");
      return;
    }  

    try {
      const res = await fetch('http://localhost:5005/user/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('email', email);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed, please try again.');
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper shadow="md" radius="md" p="xl" withBorder style={{ width: 380 }}>
        <Text size="lg" weight={500} mb="md" align="center">
          Login
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {errorMsg && <Text color="red">{errorMsg}</Text>}

            <Button type="submit" fullWidth>
              Login
            </Button>

            {/* Guest Login Button */}
            <Button
              variant="outline"
              color="gray"
              fullWidth
              onClick={() => {
                navigate('/');
              }}
            >
              Continue as Guest
            </Button>
          </Stack>
        </form>

        <Text size="sm" mt="md" align="center">
          {"Don't have an account? "}
          <Text
            component="span"
            color="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/register')}
          >
            Click to register
          </Text>
        </Text>
      </Paper>
    </div>
  );
}

export default Login;
