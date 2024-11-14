"use client";

import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Participant } from '@/hooks/use-vault';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminParticipantListProps {
  participants: Participant[];
  onSelectWinner: (participantId: string) => void;
  isSelecting: boolean;
  isVaultActive: boolean;
}

export function AdminParticipantList({
  participants,
  onSelectWinner,
  isSelecting,
  isVaultActive,
}: AdminParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No participants yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] rounded-md border border-gray-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nickname</TableHead>
            <TableHead>Entry Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell className="font-medium">{participant.nickname}</TableCell>
              <TableCell>
                {new Date(participant.timestamp).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectWinner(participant.id)}
                  disabled={isSelecting || !isVaultActive}
                  title={!isVaultActive ? 'Vault is currently inactive' : undefined}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Select as Winner
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}