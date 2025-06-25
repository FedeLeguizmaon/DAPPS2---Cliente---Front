import { useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketContext'; 

export function useWebSocketEvent(eventName) {
  const { events } = useContext(SocketContext);
  const [latestEvent, setLatestEvent] = useState(null);

  useEffect(() => {
    if (!events || !Array.isArray(events)) return;

    const matching = [...events].reverse().find(e => e.event === eventName);
    if (matching) {
      setLatestEvent(matching);
    }
  }, [events, eventName]);

  return latestEvent;
}
