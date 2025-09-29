import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.current.onmessage = (event) => {
      setLastMessage(event.data);
    };

    ws.current.onerror = (event) => {
      setError('Error en la conexión WebSocket');
    };

    ws.current.onclose = (event) => {
      setIsConnected(false);
      // Intentar reconexión después de 3 segundos
      setTimeout(() => {
        if (ws.current.readyState !== WebSocket.OPEN) {
          ws.current = new WebSocket(url);
        }
      }, 3000);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      setError('No conectado al servidor WebSocket');
    }
  };

  return { isConnected, lastMessage, error, sendMessage };
};

export default useWebSocket;
