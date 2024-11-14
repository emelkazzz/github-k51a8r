export const CHANNELS = {
  CHAT: 'presence-chat',
  VAULT: 'vault-updates',
  PAYMENTS: 'private-payments',
} as const;

export const EVENTS = {
  CHAT: {
    MESSAGE: 'chat-message',
    MEMBER_ADDED: 'member_added',
    MEMBER_REMOVED: 'member_removed',
    TYPING: 'typing',
    ERROR: 'chat-error',
  },
  VAULT: {
    NEW_PARTICIPANT: 'new-participant',
    STATUS_UPDATE: 'status-update',
    WINNER_SELECTED: 'winner-selected',
    PRIZE_UPDATE: 'prize-update',
  },
  CONNECTION: {
    STATE_CHANGE: 'state_change',
    ERROR: 'error',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    FAILED: 'failed',
  },
} as const;

export const PUSHER_CONFIG = {
  DEFAULTS: {
    ACTIVITY_TIMEOUT: 30000,
    PONG_TIMEOUT: 15000,
    MAX_RETRIES: 5,
    RETRY_DELAY: 1000,
    PRESENCE_TIMEOUT: 5000,
  },
} as const;