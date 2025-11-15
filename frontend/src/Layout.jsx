import { AppShell, Burger, Group, UnstyledButton, Image,} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate,Outlet} from 'react-router-dom';
import logo from './Assets/logo.png';

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();   // 清空所有 localStorage
    navigate('/login');     // 跳转到登录页
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="md" align="center" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Image src={logo} h={40} fit="contain" style={{ cursor: 'pointer' }} onClick={() => navigate('/')} />
          </Group>

          <Group gap="lg" visibleFrom="sm" align="center">
            <UnstyledButton onClick={() => navigate('/')}>All Listings</UnstyledButton>
            <UnstyledButton onClick={() => navigate('/host/listings')}>My Listings</UnstyledButton>
            <UnstyledButton onClick={handleLogout}>Logout</UnstyledButton>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={8}>
        <UnstyledButton onClick={() => navigate('/')}>All Listings</UnstyledButton>
        <UnstyledButton onClick={() => navigate('/host/listings')}>My Listings</UnstyledButton>
        <UnstyledButton onClick={handleLogout}>Logout</UnstyledButton>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
