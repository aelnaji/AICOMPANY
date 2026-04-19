"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { ShieldCheck, ShieldAlert, Terminal } from "lucide-react";

export function ApprovalDialog() {
  const { pendingApprovals, resolveApproval } = useAppStore();
  const activeApproval = pendingApprovals[0];

  if (!activeApproval) return null;

  return (
    <Dialog open={!!activeApproval} onOpenChange={(open) => !open && resolveApproval(activeApproval.id, false)}>
      <DialogContent className="max-w-2xl bg-[#0d0f12] border-primary/20 text-white shadow-[0_0_50px_rgba(0,201,167,0.1)]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-primary">System Approval Required</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs uppercase tracking-widest font-bold">
                Security Gate: {activeApproval.agentId} Requesting Access
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="p-4 rounded-lg bg-[#161b22] border border-white/5 space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              Proposed Action
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {activeApproval.title}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-[#161b22] border border-white/5">
              <div className="text-[10px] text-muted-foreground uppercase font-black mb-1">Target Agent</div>
              <div className="text-sm font-mono text-primary">{activeApproval.agentId}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#161b22] border border-white/5">
              <div className="text-[10px] text-muted-foreground uppercase font-black mb-1">Request ID</div>
              <div className="text-sm font-mono text-amber-500 truncate">{activeApproval.id}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-white hover:bg-white/5 text-[10px] uppercase font-bold tracking-widest"
            onClick={() => resolveApproval(activeApproval.id, false)}
          >
            Deny Access
          </Button>
          <Button
            className="bg-primary hover:bg-primary/80 text-black text-[10px] uppercase font-black tracking-widest px-8"
            onClick={() => resolveApproval(activeApproval.id, true)}
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Authorize Execution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
