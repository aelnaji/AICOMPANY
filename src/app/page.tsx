"use client";

import { TopNav } from "@/components/hq/top-nav";
import { IDELayout } from "@/components/ide/ide-layout";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0d0f12]">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <IDELayout />
      </div>
    </div>
  );
}
