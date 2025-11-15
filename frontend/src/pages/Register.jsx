import { useState } from 'react';
import { Paper, TextInput, PasswordInput, Button, Text, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      // Registration success logic here
      // localStorage.setItem('token', data.token);
      // navigate('/listings');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed, please try again.');
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
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <TextInput
              label="Username"
              name="name"
              placeholder="Enter your username"
              value={form.name}
              onChange={handleChange}
              required
            />

            <PasswordInput
              label="Password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            {errorMsg && <Text color="red">{errorMsg}</Text>}

            <Button type="submit" fullWidth onClick={()=> navigate('/')}>
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
