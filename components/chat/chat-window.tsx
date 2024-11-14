"use client";

import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { NicknameModal } from './nickname-modal';
import { ConnectionStatus } from './connection-status';
import { ErrorMessage } from './error-message';

const ChatButton = memo(({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg p-0"
  >
    <MessageSquare className="h-6 w-6" />
  </Button>
));

ChatButton.displayName = 'ChatButton';

const ChatContent = memo(({ onClose }: { onClose: () => void }) => {
  const { 
    messages, 
    nickname, 
    setNickname, 
    sendMessage, 
    error, 
    isConnected,
    members 
  } = useChat();

  const onlineCount = Object.keys(members).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-80 sm:w-96 bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-50 flex flex-col h-[600px]"
    >
      <ChatHeader 
        onClose={onClose} 
        onlineCount={onlineCount}
      />

      <ConnectionStatus isConnected={isConnected} />

      {error && (
        <ErrorMessage 
          message={error.message} 
          onDismiss={() => {}} 
        />
      )}

      <ChatMessages
        messages={messages}
        nickname={nickname}
      />

      <ChatInput
        onSend={sendMessage}
        disabled={!nickname || !isConnected}
        nickname={nickname}
      />

      <NicknameModal
        open={!nickname}
        onNicknameSet={setNickname}
      />
    </motion.div>
  );
});

ChatContent.displayName = 'ChatContent';

export function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <AnimatePresence>
      {isOpen ? (
        <ChatContent onClose={handleToggle} />
      ) : (
        <ChatButton onClick={handleToggle} />
      )}
    </AnimatePresence>
  );
}