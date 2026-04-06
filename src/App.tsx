/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Youtube, 
  Plus, 
  Trash2, 
  Activity, 
  BarChart3, 
  Terminal,
  ExternalLink,
  Settings,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ViewTask {
  id: string;
  url: string;
  videoId: string;
  targetViews: number;
  currentViews: number;
  status: 'idle' | 'running' | 'completed';
  lastViewTime: number;
}

export default function App() {
  const [tasks, setTasks] = useState<ViewTask[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newTarget, setNewTarget] = useState(100);
  const [logs, setLogs] = useState<{id: string, message: string, time: string}[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      time: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const addTask = () => {
    const videoId = extractVideoId(newUrl);
    if (!videoId) {
      addLog("Error: Invalid YouTube URL");
      return;
    }

    const newTask: ViewTask = {
      id: Math.random().toString(36).substr(2, 9),
      url: newUrl,
      videoId,
      targetViews: newTarget,
      currentViews: 0,
      status: 'idle',
      lastViewTime: 0
    };

    setTasks(prev => [...prev, newTask]);
    setNewUrl('');
    addLog(`Task added: ${videoId} (Target: ${newTarget})`);
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
    addLog(`Task removed: ${id}`);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'running' ? 'idle' : 'running';
        addLog(`Task ${id} ${newStatus === 'running' ? 'started' : 'paused'}`);
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status === 'running' && task.currentViews < task.targetViews) {
          const now = Date.now();
          // Simulate a view every 5-10 seconds
          if (now - task.lastViewTime > (5000 + Math.random() * 5000)) {
            addLog(`Simulated view for ${task.videoId} (${task.currentViews + 1}/${task.targetViews})`);
            
            if (task.currentViews + 1 >= task.targetViews) {
              addLog(`Task ${task.id} completed!`);
              return { ...task, currentViews: task.currentViews + 1, status: 'completed', lastViewTime: now };
            }
            return { ...task, currentViews: task.currentViews + 1, lastViewTime: now };
          }
        }
        return task;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-[#E4E3E0] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#141414] p-2 rounded-sm">
            <Youtube className="text-[#E4E3E0] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tighter uppercase">YT-VIEW-GEN v1.0.4</h1>
            <p className="font-serif italic text-xs opacity-60">Technical Simulation Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 border border-[#141414] rounded-sm bg-white/50">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="font-mono text-xs uppercase font-bold">System Online</span>
          </div>
          <button className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors border border-[#141414] rounded-sm">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 border-x border-[#141414] min-h-[calc(100vh-88px)]">
        
        {/* Left Sidebar: Controls & Input */}
        <aside className="lg:col-span-4 border-r border-[#141414] p-6 space-y-8 bg-[#E4E3E0]/50">
          <section>
            <h2 className="font-serif italic text-sm opacity-50 uppercase tracking-widest mb-4">New Task Configuration</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase font-bold opacity-70">Video URL</label>
                <input 
                  type="text" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-white border border-[#141414] p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase font-bold opacity-70">Target Views</label>
                <input 
                  type="number" 
                  value={newTarget}
                  onChange={(e) => setNewTarget(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-[#141414] p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                />
              </div>
              <button 
                onClick={addTask}
                className="w-full bg-[#141414] text-[#E4E3E0] py-4 font-mono font-bold uppercase tracking-tighter hover:bg-[#141414]/90 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Initialize Task
              </button>
            </div>
          </section>

          <section className="pt-8 border-t border-[#141414]/20">
            <div className="bg-white/50 border border-[#141414] p-4 rounded-sm space-y-3">
              <div className="flex items-center gap-2 text-[#141414]">
                <Info className="w-4 h-4" />
                <h3 className="font-mono text-xs font-bold uppercase">Disclaimer</h3>
              </div>
              <p className="text-xs font-serif leading-relaxed opacity-70">
                This tool is a simulation environment. Actual YouTube views are governed by Google's proprietary algorithms and bot detection systems. Rapid automated viewing may violate YouTube's Terms of Service.
              </p>
            </div>
          </section>

          <section className="pt-8 space-y-4">
             <h2 className="font-serif italic text-sm opacity-50 uppercase tracking-widest">System Logs</h2>
             <div className="bg-[#141414] text-[#E4E3E0] p-4 font-mono text-[10px] h-64 overflow-y-auto space-y-1 rounded-sm border border-[#141414]">
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2 border-b border-white/10 pb-1"
                    >
                      <span className="opacity-40">[{log.time}]</span>
                      <span className="text-[#00FF00]">{">"}</span>
                      <span>{log.message}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {logs.length === 0 && <div className="opacity-30 italic">Waiting for system events...</div>}
             </div>
          </section>
        </aside>

        {/* Main Content: Task List & Preview */}
        <div className="lg:col-span-8 flex flex-col">
          
          {/* Task List Table */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-12 border-b border-[#141414] bg-[#141414]/5">
              <div className="col-span-1 p-4 font-serif italic text-[11px] opacity-50 uppercase">#</div>
              <div className="col-span-5 p-4 font-serif italic text-[11px] opacity-50 uppercase">Video Identifier</div>
              <div className="col-span-2 p-4 font-serif italic text-[11px] opacity-50 uppercase text-center">Progress</div>
              <div className="col-span-2 p-4 font-serif italic text-[11px] opacity-50 uppercase text-center">Status</div>
              <div className="col-span-2 p-4 font-serif italic text-[11px] opacity-50 uppercase text-right">Actions</div>
            </div>

            <div className="divide-y divide-[#141414]">
              {tasks.map((task, idx) => (
                <motion.div 
                  key={task.id}
                  layout
                  onClick={() => setActiveTaskId(task.id)}
                  className={`grid grid-cols-12 items-center transition-colors cursor-pointer group ${activeTaskId === task.id ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'}`}
                >
                  <div className="col-span-1 p-4 font-mono text-xs opacity-50">{(idx + 1).toString().padStart(2, '0')}</div>
                  <div className="col-span-5 p-4 flex items-center gap-3">
                    <div className="w-12 h-8 bg-black/20 rounded-sm overflow-hidden flex-shrink-0 border border-[#141414]/10">
                      <img 
                        src={`https://img.youtube.com/vi/${task.videoId}/default.jpg`} 
                        alt="thumbnail" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="truncate">
                      <div className="font-mono text-xs font-bold truncate">{task.videoId}</div>
                      <div className="font-serif italic text-[10px] opacity-50 truncate">{task.url}</div>
                    </div>
                  </div>
                  <div className="col-span-2 p-4 text-center">
                    <div className="font-mono text-xs font-bold">
                      {Math.round((task.currentViews / task.targetViews) * 100)}%
                    </div>
                    <div className="w-full h-1 bg-black/10 mt-1 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(task.currentViews / task.targetViews) * 100}%` }}
                        className={`h-full ${activeTaskId === task.id ? 'bg-[#E4E3E0]' : 'bg-[#141414]'}`}
                      />
                    </div>
                  </div>
                  <div className="col-span-2 p-4 text-center">
                    <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm border ${
                      task.status === 'running' ? 'border-green-500 text-green-500' : 
                      task.status === 'completed' ? 'border-blue-500 text-blue-500' : 
                      'border-[#141414]/30 opacity-50'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="col-span-2 p-4 flex justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                      className={`p-2 rounded-sm border transition-colors ${
                        activeTaskId === task.id 
                          ? 'border-[#E4E3E0]/30 hover:bg-[#E4E3E0] hover:text-[#141414]' 
                          : 'border-[#141414]/30 hover:bg-[#141414] hover:text-[#E4E3E0]'
                      }`}
                    >
                      {task.status === 'running' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                      className={`p-2 rounded-sm border transition-colors ${
                        activeTaskId === task.id 
                          ? 'border-[#E4E3E0]/30 hover:bg-red-500 hover:text-white' 
                          : 'border-[#141414]/30 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {tasks.length === 0 && (
                <div className="p-20 text-center space-y-4">
                  <div className="flex justify-center opacity-20">
                    <BarChart3 className="w-16 h-16" />
                  </div>
                  <div className="font-serif italic text-lg opacity-40">No active tasks in queue</div>
                  <p className="font-mono text-xs opacity-30 uppercase">Initialize a task from the sidebar to begin simulation</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Preview Panel */}
          <AnimatePresence>
            {activeTask && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="border-t border-[#141414] bg-white p-6 h-80 flex gap-6"
              >
                <div className="w-1/2 h-full bg-black rounded-sm overflow-hidden relative group">
                  <iframe 
                    key={activeTask.currentViews} // Force reload on each "view"
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${activeTask.videoId}?autoplay=${activeTask.status === 'running' ? 1 : 0}&mute=1&controls=0`}
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                  {activeTask.status !== 'running' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <div className="text-white font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                        <Pause className="w-4 h-4" />
                        Simulation Paused
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-1/2 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-mono text-sm font-bold uppercase">Task Details: {activeTask.id}</h3>
                      <p className="font-serif italic text-xs opacity-50">Active Simulation Node</p>
                    </div>
                    <a 
                      href={activeTask.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 border border-[#141414] rounded-sm hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-[#141414] p-3 rounded-sm">
                      <div className="font-mono text-[10px] uppercase opacity-50">Current Progress</div>
                      <div className="font-mono text-2xl font-bold">{activeTask.currentViews}</div>
                    </div>
                    <div className="border border-[#141414] p-3 rounded-sm">
                      <div className="font-mono text-[10px] uppercase opacity-50">Target Goal</div>
                      <div className="font-mono text-2xl font-bold">{activeTask.targetViews}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between font-mono text-[10px] uppercase font-bold">
                      <span>Simulation Integrity</span>
                      <span>{activeTask.status === 'running' ? '98.4%' : '0.0%'}</span>
                    </div>
                    <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden border border-[#141414]/10">
                      <motion.div 
                        animate={{ 
                          width: activeTask.status === 'running' ? '98.4%' : '0%',
                          backgroundColor: activeTask.status === 'running' ? '#141414' : '#ccc'
                        }}
                        className="h-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="border-t border-[#141414] bg-[#141414] text-[#E4E3E0] p-2 px-6 flex justify-between items-center font-mono text-[10px] uppercase tracking-wider">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Node: US-WEST-1</span>
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            <span>Active Threads: {tasks.filter(t => t.status === 'running').length}</span>
          </div>
        </div>
        <div className="opacity-50">
          © 2026 YT-VIEW-GEN SIMULATOR // ENCRYPTED SESSION
        </div>
      </footer>
    </div>
  );
}
