import { useState, useCallback } from 'react';
import { useAppStore, FileNode } from '@/lib/store';

export function useFileSystem() {
  const { setRootHandle, setFileTree } = useAppStore();
  const [isScanning, setIsScanning] = useState(false);

  const scanDirectory = useCallback(async (
    handle: FileSystemDirectoryHandle,
    path: string = ""
  ): Promise<FileNode[]> => {
    const nodes: FileNode[] = [];
    try {
      for await (const entry of handle.values()) {
        const entryPath = path ? `${path}/${entry.name}` : entry.name;
        const node: FileNode = {
          id: entryPath,
          name: entry.name,
          kind: entry.kind,
          handle: entry,
        };
        if (entry.kind === "directory") {
          node.children = await scanDirectory(entry as FileSystemDirectoryHandle, entryPath);
        }
        nodes.push(node);
      }
    } catch (error) {
      console.error("Error scanning directory:", error);
    }
    return nodes.sort((a, b) => {
      if (a.kind === b.kind) return a.name.localeCompare(b.name);
      return a.kind === "directory" ? -1 : 1;
    });
  }, []);

  const openDirectory = useCallback(async () => {
    if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
      // Fallback mock tree for non-Chromium browsers
      const mockTree: FileNode[] = [
        {
          id: "root",
          name: "demo-project",
          kind: "directory",
          children: [
            { id: "1", name: "package.json", kind: "file", content: '{\n  "name": "demo-project",\n  "version": "1.0.0"\n}' },
            {
              id: "2", name: "src", kind: "directory", children: [
                { id: "3", name: "main.ts", kind: "file", content: 'console.log("Hello from Neural HQ!");' },
                { id: "4", name: "utils.ts", kind: "file", content: 'export const add = (a: number, b: number) => a + b;' }
              ]
            },
            { id: "5", name: "README.md", kind: "file", content: "# Neural HQ Demo\n\nWelcome to the AI agent workspace." }
          ]
        }
      ];
      setFileTree(mockTree);
      return;
    }

    try {
      setIsScanning(true);
      const handle = await window.showDirectoryPicker();
      setRootHandle(handle);
      const tree = await scanDirectory(handle);
      setFileTree(tree);
    } catch (err) {
      // AbortError = user cancelled the picker — not a real error, ignore silently
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Failed to open directory", err);
    } finally {
      setIsScanning(false);
    }
  }, [scanDirectory, setRootHandle, setFileTree]);

  const readFile = useCallback(async (node: FileNode): Promise<string> => {
    if (node.content) return node.content;
    if (!node.handle) return "";
    try {
      if (node.handle instanceof FileSystemFileHandle) {
        const file = await node.handle.getFile();
        return await file.text();
      }
      return "";
    } catch (err) {
      console.error("Failed to read file", err);
      return "";
    }
  }, []);

  return { openDirectory, isScanning, readFile };
}
