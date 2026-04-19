"use client";

import React, { useState, useEffect } from "react";
import { useAppStore, FileNode } from "@/lib/store";
import { FolderIcon, FileIcon, ChevronRightIcon, ChevronDownIcon, FolderOpenIcon, PlusIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileSystem } from "@/lib/hooks/use-file-system";

export function FileTree() {
  const { rootHandle, fileTree, setFileTree, openFile, activeFileId } = useAppStore();
  const { openDirectory, isScanning } = useFileSystem();
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "showDirectoryPicker" in window);
  }, []);

  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Loader2Icon className="w-8 h-8 mb-4 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Scanning Filesystem...</p>
      </div>
    );
  }

  if (!rootHandle && fileTree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <FolderOpenIcon className="w-12 h-12 mb-4 text-muted-foreground opacity-20" />
        <p className="mb-4 text-sm text-muted-foreground font-medium">No directory synchronized</p>
        <Button onClick={openDirectory} variant="outline" size="sm" className="cyber-border text-[10px] uppercase font-bold tracking-widest px-6 h-8">
          Initialize Source
        </Button>
        {!isSupported && (
          <p className="mt-4 text-[10px] text-yellow-500/70 uppercase tracking-tighter">
            Web-FS API limited in this browser.<br/>Switching to Neural Demo Mode.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#161b22]/30">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Source Explorer</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-primary transition-colors" onClick={openDirectory}>
            <PlusIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {fileTree.map((node) => (
            <FileTreeNode key={node.id} node={node} depth={0} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function FileTreeNode({ node, depth }: { node: FileNode; depth: number }) {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const { openFile, activeFileId, setCurrentPage } = useAppStore();

  const handleToggle = () => {
    if (node.kind === "directory") {
      setIsOpen(!isOpen);
    } else {
      openFile(node.id);
      setCurrentPage("ide");
    }
  };

  const isActive = activeFileId === node.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-1 cursor-pointer hover:bg-accent/50 rounded-sm text-sm group transition-colors",
          isActive && "bg-primary/10 text-primary border-r-2 border-primary",
          depth > 0 && "ml-3"
        )}
        onClick={handleToggle}
        style={{ paddingLeft: `${depth * 4}px` }}
      >
        <span className="mr-1.5 opacity-70">
          {node.kind === "directory" ? (
            isOpen ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronRightIcon className="w-3.5 h-3.5" />
          ) : (
            <div className="w-3.5 h-3.5" />
          )}
        </span>
        <span className="mr-2">
          {node.kind === "directory" ? (
            isOpen ? <FolderOpenIcon className="w-4 h-4 text-primary/70" /> : <FolderIcon className="w-4 h-4 text-primary/70" />
          ) : (
            <FileIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </span>
        <span className="truncate flex-1">{node.name}</span>
      </div>
      {node.kind === "directory" && isOpen && node.children && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
