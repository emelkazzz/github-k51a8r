"use client";

import { Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PusherMember } from '@/lib/pusher/types';

interface MembersListProps {
  members: Map<string, PusherMember>;
}

export function MembersList({ members }: MembersListProps) {
  return (
    <div className="p-4 border-t border-gray-800">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-400">
          Online Users ({members.size})
        </h3>
      </div>
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {Array.from(members.values()).map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 text-sm text-gray-300"
            >
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>{member.info.nickname}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}