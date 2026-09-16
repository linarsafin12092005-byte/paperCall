import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * WebSocket хук для подключения к Spring Boot STOMP endpoint через нативный WebSocket
 * @param {string} topic - STOMP topic для подписки (например "/topic/call-events")
 * @param {function} onMessage - callback при получении сообщения
 */
export function useWebSocket(topic, onMessage) {
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const subscriptionIdRef = useRef(0)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return // Уже подключены
    }

    // Определяем WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws`

    console.log('[WS] Connecting to:', wsUrl)
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('✅ WebSocket connected')
      setIsConnected(true)

      // STOMP CONNECT frame
      const connectFrame = `CONNECT
accept-version:1.0,1.1,1.2
heart-beat:10000,10000

\0`
      ws.send(connectFrame)
    }

    ws.onmessage = (event) => {
      const message = event.data
      console.log('[WS Debug] Received:', message)

      // Парсим STOMP frames
      if (message.startsWith('CONNECTED')) {
        console.log('[WS] STOMP connected, subscribing to', topic)

        // STOMP SUBSCRIBE frame
        const subId = `sub-${subscriptionIdRef.current++}`
        const subscribeFrame = `SUBSCRIBE
id:${subId}
destination:${topic}

\0`
        ws.send(subscribeFrame)
      } else if (message.startsWith('MESSAGE')) {
        // Извлекаем body из STOMP MESSAGE frame
        const bodyStart = message.indexOf('\n\n') + 2
        const bodyEnd = message.lastIndexOf('\0')
        const body = message.substring(bodyStart, bodyEnd)

        try {
          const data = JSON.parse(body)
          onMessage(data)
        } catch (err) {
          console.error('Failed to parse WS message:', err, body)
        }
      } else if (message.startsWith('ERROR')) {
        console.error('❌ STOMP error:', message)
      }
    }

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }

    ws.onclose = () => {
      console.warn('⚠️ WebSocket closed, reconnecting in 5s...')
      setIsConnected(false)

      // Автоподключение каждые 5 сек
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, 5000)
    }

    wsRef.current = ws
  }, [topic, onMessage])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        // STOMP DISCONNECT frame
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send('DISCONNECT\n\n\0')
        }
        wsRef.current.close()
      }
    }
  }, [connect])

  return {
    isConnected,
  }
}
