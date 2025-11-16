import {ActionIcon,Box,Button,Group,Indicator,Menu,ScrollArea,Stack,Text,} from '@mantine/core';
import { IconBellRinging, IconBellRingingFilled } from '@tabler/icons-react';
import { notifications as notificationsApi } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';
import { GetUserBookingDetail, GetHostBookingDetail } from '../api/BookingApi';

const LS_NOTIF_KEY = 'airbrb_notifications_v1';
const LS_PREV_GUEST_KEY = 'airbrb_prev_guest_bookings_v1';
const LS_PREV_HOST_KEY = 'airbrb_prev_host_bookings_v1';

export default function NotificationCenter() {
  const [notifList, setNotifList] = useState([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_NOTIF_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotifList(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load notifications from localStorage', e);
    }
  }, []);

  const unreadList = useMemo(
    () => notifList.filter((n) => !n.read),
    [notifList],
  );
  const unreadCount = unreadList.length;

  const pushNotification = (notif) => {
    setNotifList((prev) => {
      // 避免重复
      if (prev.some((n) => n.id === notif.id)) return prev;
      const next = [{ ...notif, read: false }, ...prev];
      try {
        localStorage.setItem(LS_NOTIF_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save notifications to localStorage', e);
      }
      return next;
    });

    notificationsApi.show({
      title: notif.title,
      message: notif.message,
      position: 'bottom-right',
    });
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');

      if (!token || !email) return;

      try {
        const [guestBookings, hostBookings] = await Promise.all([
          GetUserBookingDetail(token, email),
          GetHostBookingDetail(token, email),
        ]);

        const prevGuestRaw = localStorage.getItem(LS_PREV_GUEST_KEY);
        const prevHostRaw = localStorage.getItem(LS_PREV_HOST_KEY);

        const prevGuestMap = prevGuestRaw ? JSON.parse(prevGuestRaw) : null;
        const prevHostIds = prevHostRaw ? JSON.parse(prevHostRaw) : null;

        if (!prevGuestMap || !prevHostIds) {
          const guestMapInit = {};
          guestBookings.forEach((b) => {
            guestMapInit[b.id] = b.status;
          });

          const hostIdsInit = hostBookings.map((b) => b.id);

          localStorage.setItem(
            LS_PREV_GUEST_KEY,
            JSON.stringify(guestMapInit),
          );
          localStorage.setItem(LS_PREV_HOST_KEY, JSON.stringify(hostIdsInit));
          return;
        }

        const newGuestMap = {};
        guestBookings.forEach((b) => {
          const prevStatus = prevGuestMap[b.id];
          const currStatus = b.status;
          if (
            prevStatus === 'pending' &&
            (currStatus === 'accepted' || currStatus === 'declined')
          ) {
            pushNotification({
              id: `guest-${b.id}-${currStatus}`,
              type: currStatus === 'accepted'
                ? 'GUEST_ACCEPTED'
                : 'GUEST_DECLINED',
              title:
                currStatus === 'accepted'
                  ? 'Booking accepted'
                  : 'Booking declined',
              message: `Your booking for listing ${b.listingId} was ${currStatus}.`,
              createdAt: new Date().toISOString(),
            });
          }
          newGuestMap[b.id] = currStatus;
        });

        const prevHostSet = new Set(prevHostIds);
        const newHostIds = [];
        hostBookings.forEach((b) => {
          newHostIds.push(b.id);
          if (!prevHostSet.has(b.id) && b.status === 'pending') {
            pushNotification({
              id: `host-${b.id}`,
              type: 'HOST_NEW_REQUEST',
              title: 'New booking request',
              message: `New booking request for listing ${b.listingId}.`,
              createdAt: new Date().toISOString(),
            });
          }
        });

        // 更新基准到 localStorage
        localStorage.setItem(LS_PREV_GUEST_KEY, JSON.stringify(newGuestMap));
        localStorage.setItem(LS_PREV_HOST_KEY, JSON.stringify(newHostIds));
      } catch (err) {
        console.error('Polling notifications failed', err);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const markAllRead = () => {
    setNotifList((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem(LS_NOTIF_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markOneRead = (id) => {
    setNotifList((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      localStorage.setItem(LS_NOTIF_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <Menu width={320} position="bottom-end" offset={8}>
      <Menu.Target>
        <Indicator
          disabled={unreadCount === 0}
          label={unreadCount}
          size={18}
          processing
        >
          <ActionIcon
            variant="filled"
            aria-label="Notifications"
            color={unreadCount === 0 ? 'blue' : 'red'}
          >
            {unreadCount === 0 ? (
              <IconBellRinging size={20} />
            ) : (
              <IconBellRingingFilled size={20} />
            )}
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        <Box px="sm" py="xs">
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Notifications</Text>
            {unreadCount > 0 && (
              <Button
                variant="subtle"
                size="compact-xs"
                onClick={markAllRead}
              >
                Mark all as read
              </Button>
            )}
          </Group>

          {notifList.length === 0 ? (
            <Text c="dimmed" size="sm">
              No notifications yet
            </Text>
          ) : (
            <ScrollArea h={260}>
              <Stack gap="xs">
                {notifList.map((n) => (
                  <Box
                    key={n.id}
                    p="xs"
                    style={{
                      borderRadius: 8,
                      backgroundColor: n.read ? '#f1f3f5' : '#e7f5ff',
                      cursor: 'pointer',
                    }}
                    onClick={() => markOneRead(n.id)}
                  >
                    <Text size="xs" c="dimmed">
                      {new Date(n.createdAt).toLocaleString()}
                    </Text>
                    <Text size="sm" fw={n.read ? 400 : 600}>
                      {n.title}
                    </Text>
                    <Text size="sm">{n.message}</Text>
                  </Box>
                ))}

              </Stack>
            </ScrollArea>
          )}
        </Box>
      </Menu.Dropdown>
    </Menu>
  );
}
