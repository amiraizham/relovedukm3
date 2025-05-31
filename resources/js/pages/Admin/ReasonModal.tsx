import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ReasonModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    selectedReason: string;
    setSelectedReason: (value: string) => void;
  };
  
  export default function ReasonModal({
    isOpen,
    onClose,
    onSubmit,
    selectedReason,
    setSelectedReason,
  }: ReasonModalProps) {
    const reasons = [
      'Item is harmful',
      'Item is not appropriate',
      'Image is not clear',
    ];
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md backdrop-blur-sm bg-white/90 border rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle>Select a Rejection Reason</DialogTitle>
          </DialogHeader>
  
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {reasons.map((r, i) => (
                    <SelectItem key={i} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
  
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={!selectedReason}
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onSubmit}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  