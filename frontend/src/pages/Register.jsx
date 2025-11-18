import { useState } from 'react';
import { Paper, TextInput, PasswordInput, Button, Text, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

// Registration page
function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setErrorMsg("Invalid email format");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match. Please try again.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5005/user/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('email', form.email);

      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
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
      <Paper shadow="md" radius="md" p="xl" withBorder style={{ width: 400 }}>
        <Text size="lg" weight={500} mb="md" align="center">
          Register
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label="Email"
              name="email"
              data-testid="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
              required
            />

            <TextInput
              label="Username"
              data-testid="name"
              name="name"
              placeholder="Enter your username"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
              required
            />

            <PasswordInput
              label="Password"
              name="password"
              data-testid="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.currentTarget.value })}
              required
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              data-testid="confirmPassword"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.currentTarget.value })
              }
              required
            />

            {errorMsg && <Text color="red">{errorMsg}</Text>}

            <Button type="submit" fullWidth>
              Register
            </Button>
          </Stack>
        </form>

        <Text size="sm" mt="md" align="center">
          Already have an account?{' '}
          <Text
            component="span"
            color="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            Click to login
          </Text>
        </Text>
      </Paper>
    </div>
  );
}

export default Register;
