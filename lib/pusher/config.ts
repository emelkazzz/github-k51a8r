export const PUSHER_CONFIG = {
  DEFAULTS: {
    ACTIVITY_TIMEOUT: 30000,
    PONG_TIMEOUT: 15000,
    MAX_RETRIES: 5,
    RETRY_DELAY: 1000,
    PRESENCE_TIMEOUT: 5000,
    RECONNECT_MIN_DELAY: 1000,
    RECONNECT_MAX_DELAY: 30000,
    MAX_RECONNECT_ATTEMPTS: 10,
    CONNECTION_TIMEOUT: 15000,
    HEALTH_CHECK_INTERVAL: 30000,
  },
  AUTH: {
    ENDPOINT: '/api/pusher/auth',
    CONTENT_TYPE: 'application/x-www-form-urlencoded',
  },
  CHANNELS: {
    CHAT: 'presence-chat',
    VAULT: 'vault-updates',
  },
  EVENTS: {
    CHAT: {
      MESSAGE: 'chat-message',
      MEMBER_ADDED: 'member_added',
      MEMBER_REMOVED: 'member_removed',
      TYPING: 'client-typing',
      ERROR: 'chat-error',
    },
    CONNECTION: {
      STATE_CHANGE: 'state_change',
      ERROR: 'error',
      CONNECTED: 'connected',
      DISCONNECTED: 'disconnected',
      FAILED: 'failed',
    },
    VAULT: {
      NEW_PARTICIPANT: 'new-participant',
      STATUS_UPDATE: 'status-update',
      WINNER_SELECTED: 'winner-selected',
    },
  },
  RATE_LIMITS: {
    AUTH: {
      MAX_REQUESTS: 100,
      WINDOW_MS: 60000, // 1 minute
    },
    CHAT: {
      MAX_MESSAGES: 30,
      WINDOW_MS: 60000, // 1 minute
    },
  },
} as const;