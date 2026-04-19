"use client";

import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useAppStore, FileNode } from "@/lib/store";
import { Loader2Icon, XIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CodeEditor() {
  const { activeFileId, openFiles, closeFile, setActiveFileId, fileTree } = useAppStore();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    const loadFile = async () => {
      if (!activeFileId) {
        setContent("");
        return;
      }

      setLoading(true);
      try {
        const node = findNodeById(fileTree, activeFileId);
        if (node) {
          if (node.handle && node.handle instanceof FileSystemFileHandle) {
            const file = await node.handle.getFile();
            const text = await file.text();
            setContent(text);
          } else if (node.content !== undefined) {
            setContent(node.content);
          }
        }
      } catch (err) {
        console.error("Failed to load file", err);
      } finally {
        setLoading(false);
        setIsDirty(false);
      }
    };

    loadFile();
  }, [activeFileId, fileTree]);

  const handleSave = async () => {
    if (!activeFileId) return;
    try {
      const node = findNodeById(fileTree, activeFileId);
      if (node && node.handle instanceof FileSystemFileHandle) {
        const writable = await node.handle.createWritable();
        await writable.write(content);
        await writable.close();
        setIsDirty(false);
      } else if (node) {
        node.content = content;
        setIsDirty(false);
      }
    } catch (err) {
      console.error("Failed to save file", err);
    }
  };

  if (!activeFileId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-[#0d0f12]">
        <div className="p-8 border border-dashed rounded-lg border-muted-foreground/20 text-center">
          <p className="text-sm">Select a file to edit</p>
          <p className="text-[10px] mt-1 opacity-50 uppercase tracking-widest">Awaiting Input</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0f12]">
      {/* Open file tabs */}
      <div className="flex items-center overflow-x-auto bg-[#0d0f12] border-b border-white/5">
        {openFiles.map((fileId) => {
          const node = findNodeById(fileTree, fileId);
          const isActive = activeFileId === fileId;
          return (
            <div
              key={fileId}
              className={cn(
                "flex items-center px-3 py-2 border-r border-white/5 text-xs cursor-pointer min-w-[120px] max-w-[200px] transition-colors group",
                isActive ? "bg-[#161b22] text-primary" : "text-muted-foreground hover:bg-accent/30"
              )}
              onClick={() => setActiveFileId(fileId)}
            >
              <span className="truncate flex-1">{node?.name || fileId}</span>
              <button
                className="ml-2 p-0.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-muted/50 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(fileId);
                }}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0d0f12] border-b border-white/5 text-[10px] text-muted-foreground uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span>{activeFileId}</span>
          {isDirty && <span className="text-yellow-500 lowercase ml-1">(unsaved)</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-primary transition-colors" onClick={handleSave} disabled={!isDirty}>
            <SaveIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d0f12] z-10">
            <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <Editor
          height="100%"
          language={getLanguage(activeFileId)}
          theme="vs-dark"
          value={content}
          onChange={(value) => {
            setContent(value || "");
            setIsDirty(true);
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontFamily: "var(--font-mono)",
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 10,
          }}
          onMount={(_editor, monaco) => {
            monaco.editor.defineTheme('cyber-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: { 'editor.background': '#0d0f12' }
            });
            monaco.editor.setTheme('cyber-dark');
          }}
        />
      </div>
    </div>
  );
}

function getLanguage(filename: string | null) {
  if (!filename) return "plaintext";
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx': return 'javascript';
    case 'ts':
    case 'tsx': return 'typescript';
    case 'json': return 'json';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'md': return 'markdown';
    case 'py': return 'python';
    default: return 'plaintext';
  }
}
