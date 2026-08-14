import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Layers, 
  FileCode, 
  Terminal, 
  Sparkles, 
  Smartphone, 
  Download,
  Search,
  ExternalLink
} from 'lucide-react';
import { SWIFT_CODE_FILES, SwiftFile } from '../data/swiftCodeData';

export const SwiftCodeHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SwiftFile>(SWIFT_CODE_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredFiles = SWIFT_CODE_FILES.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const combinedContent = SWIFT_CODE_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.name}\n// ${f.description}\n// ==========================================\n\n${f.code}\n\n`
    ).join('\n');

    const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CoffeeLink-Swift6-SwiftUI-Export.swift';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18181b] text-gray-200 overflow-hidden font-inter">
      {/* Top Header */}
      <header className="h-16 bg-[#121214] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <FileCode size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-hanken text-[16px] font-bold text-white tracking-tight">
                Swift 6 + SwiftUI 架构系统
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30">
                iOS 18+ Ready
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              声明式语法适配 iPhone，全套 7 个页面视图模型与设计系统
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 active:scale-95 transition-all"
          >
            <Download size={13} />
            导出全部代码
          </button>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '已复制 Swift 源码' : '复制当前文件'}
          </button>
        </div>
      </header>

      {/* Main Workspace layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar File Tree */}
        <div className="w-72 bg-[#121214]/80 border-r border-white/10 flex flex-col shrink-0">
          {/* Search bar */}
          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索 Swift 文件或视图..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {['All', 'System', 'Models', 'Views'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-orange-500/15 border-orange-500/40 text-white'
                      : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-xs font-bold text-orange-400 flex items-center gap-1.5">
                      <FileCode size={13} className="shrink-0" />
                      {file.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300">
                      {file.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 line-clamp-1 leading-tight">
                    {file.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Swift 6 Specs Footer Note */}
          <div className="p-3 border-t border-white/10 bg-[#0d0d0e] text-[10px] text-gray-400 space-y-1">
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Sparkles size={11} />
              <span>Swift 6 Concurrency + Observation</span>
            </div>
            <p className="leading-tight">
              代码支持在 Xcode 16 中无缝直接编译，全面利用 <code className="text-orange-300">@Observable</code>, <code className="text-orange-300">Sendable</code> 与 <code className="text-orange-300">NavigationStack</code>。
            </p>
          </div>
        </div>

        {/* Code Editor Preview Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e24] overflow-hidden">
          {/* File Header Tab */}
          <div className="h-10 bg-[#15151a] border-b border-white/10 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-orange-400 font-semibold">
                {selectedFile.name}
              </span>
              <span className="text-[11px] text-gray-400">
                — {selectedFile.description}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-500">
              UTF-8 • Swift 6.0
            </span>
          </div>

          {/* Code Text Area */}
          <div className="flex-1 overflow-auto p-4 font-mono-code text-[12.5px] leading-relaxed select-text bg-[#1e1e24] text-gray-300">
            <pre className="whitespace-pre">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
