import { Modal, Group, ThemeIcon, Text, Button } from '@mantine/core';
import {IconAlertTriangle,IconCheck,IconInfoCircle} from '@tabler/icons-react';

// Helper function to get configuration based on alert type
function getTypeConfig(type) {
  switch (type) {
  case 'error':
    return { color: 'red', Icon: IconAlertTriangle, defaultTitle: 'Error' };
  case 'success':
    return { color: 'green', Icon: IconCheck, defaultTitle: 'Success' };
  default:
    return { color: 'blue', Icon: IconInfoCircle, defaultTitle: 'Notice' };
  }
}

// AppAlertModal component
export default function AppAlertModal({
  opened,
  onClose,
  title,
  message,
  type = 'info',
}) {
  const { color, Icon, defaultTitle } = getTypeConfig(type);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="md"
      withCloseButton
      overlayProps={{ opacity: 0.4, blur: 2 }}
      title={
        <Group gap="xs">
          <ThemeIcon color={color} variant="light" radius="xl">
            <Icon size={18} />
          </ThemeIcon>
          <Text fw={600}>
            {title || defaultTitle}
          </Text>
        </Group>
      }
    >
      <Text mb="md">
        {message}
      </Text>

      <Group justify="flex-end" mt="md">
        <Button
          onClick={onClose}
          color={color}
          radius="md"
          autoFocus
        >
          OK
        </Button>
      </Group>
    </Modal>
  );
}
