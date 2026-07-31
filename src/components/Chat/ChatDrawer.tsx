import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatView } from './ChatView';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: any;
  onOpenProfile?: (username: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  targetUser,
  onOpenProfile,
}) => {
  const { currentUser } = useAuth();

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-5xl">
        <ChatView
          initialTargetUser={targetUser}
          onOpenProfile={onOpenProfile}
          onCloseModal={onClose}
          isModalMode={true}
        />
      </div>
    </div>
  );
};
