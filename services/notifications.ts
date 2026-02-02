type TimerMap = { [key: string]: number };

let timers: TimerMap = {};

const clearAll = () => {
  Object.values(timers).forEach(id => clearTimeout(id));
  timers = {};
};

export const requestPermission = async () => {
  if ('Notification' in window && Notification.permission !== 'granted') {
    try {
      await Notification.requestPermission();
    } catch (e) {
      // ignore
    }
  }
};

export const scheduleNotifications = async (instances: { id: string; title: string; dateTime: Date }[]) => {
  clearAll();
  await requestPermission();
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  instances.forEach(inst => {
    const ms = inst.dateTime.getTime() - now.getTime();
    if (ms <= 0) return; // don't schedule past notifications
    // Limit scheduling to reasonable horizon (30 days)
    if (ms > 1000 * 60 * 60 * 24 * 30) return;
    const id = window.setTimeout(() => {
      new Notification(inst.title, { body: 'Log your attendance', tag: inst.id });
    }, ms);
    timers[inst.id] = id;
  });
};

export const cancelAll = () => {
  clearAll();
};
