import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Calendar, Clock, TerminalSquare, ChevronRight, Activity } from 'lucide-react';

const PipelineIngestion: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [hours, setHours] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert('Only PDF files are accepted.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Only PDF files are accepted.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !hours || !date) {
      alert('Please complete all fields.');
      return;
    }

    setIsSubmitting(true);

    // Simulated payload prep
    const payload = {
      fileName: file.name,
      fileSize: file.size,
      dailyHours: parseInt(hours, 10),
      targetDate: date,
      timestamp: new Date().toISOString()
    };
    
    // Fake the data stream log effect
    const logMessages = [
      `[SYS] Initializing ingestion protocol...`,
      `[SYS] Authenticating with Supabase Storage... OK`,
      `[UPL] Uploading payload: ${payload.fileName} (${(payload.fileSize / 1024).toFixed(2)} KB)`,
      `[UPL] Chunk 1/3... 100%`,
      `[UPL] Chunk 2/3... 100%`,
      `[UPL] Chunk 3/3... 100%`,
      `[UPL] Upload complete. Hash verified.`,
      `[NET] Triggering n8n automation webhook...`,
      `[NET] Waiting for response...`,
      `[PRC] AI parsing document structure...`,
      `[PRC] Extracting key concepts and modules...`,
      `[PRC] Applying time constraints (${payload.dailyHours} hrs/day)...`,
      `[PRC] Mapping to target date: ${payload.targetDate}...`,
      `[SYS] Roadmap generated successfully. Handshake complete.`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logMessages.length) {
        setLoadingLogs(prev => [...prev, logMessages[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        // Simulate completion and redirect/reset
        setTimeout(() => {
          setIsSubmitting(false);
          setLoadingLogs([]);
          setFile(null);
          setHours('');
          setDate('');
          alert('Roadmap Generated! (Simulation Complete)');
          // window.location.href = '/dashboard';
        }, 1000);
      }
    }, 400); // Add a log every 400ms
  };

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-50 bg-[#000000] text-[#6366f1] font-mono flex flex-col items-center justify-center overflow-hidden">
        {/* Scanning Line */}
        <div className="absolute inset-0 pointer-events-none z-10 scan-line"></div>
        
        {/* Cinematic Grain Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]"></div>

        <div className="w-full max-w-4xl p-8 relative z-20 flex flex-col h-full justify-end pb-24">
          <div className="flex items-center gap-4 mb-8">
            <Activity className="animate-pulse w-8 h-8 text-[#8b5cf6]" />
            <h2 className="text-3xl font-bold tracking-widest text-white uppercase glow-text-subtle">
              Processing Pipeline
            </h2>
          </div>
          
          <div className="space-y-2 text-sm md:text-base">
            {loadingLogs.map((log, index) => (
              <div key={index} className="flex gap-2 items-start animate-fade-in-up">
                <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-50" />
                <span className={log.includes('OK') || log.includes('complete') ? 'text-green-400' : 'text-[#a1a1aa]'}>
                  {log}
                </span>
              </div>
            ))}
            <div className="flex gap-2 items-start animate-pulse mt-4">
              <span className="w-5 h-5 flex-shrink-0 bg-[#6366f1] block ml-1 mt-0.5"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full mx-auto">
      <div className="terminal-card border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
        <div className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rotate-45 pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
          <TerminalSquare className="text-[#6366f1] w-6 h-6" />
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">
            Ingestion Node
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {/* Document Dropzone */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
              Syllabus / Source Document
            </label>
            <div
              className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
                isDragging 
                  ? 'border-[#6366f1] bg-[#6366f1]/5 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                  : 'border-white/10 hover:border-[#6366f1]/50 hover:bg-white/[0.01]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-3 animate-fade-in text-center">
                  <div className="w-12 h-12 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/50 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    <FileText className="text-[#6366f1] w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-mono text-sm">{file.name}</p>
                    <p className="text-[#a1a1aa] text-xs font-mono mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • READY
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <UploadCloud className="text-[#a1a1aa] w-8 h-8 group-hover:text-[#6366f1] transition-colors" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Drag & drop syllabus here</p>
                    <p className="text-[#a1a1aa] text-sm mt-1">or click to browse local filesystem</p>
                    <p className="text-[#6366f1] font-mono text-[10px] mt-4 tracking-widest uppercase border border-[#6366f1]/30 bg-[#6366f1]/10 px-2 py-1 rounded inline-block">
                      .PDF ONLY
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Study Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
                Daily Study Capacity
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="w-4 h-4 text-[#a1a1aa]" />
                </div>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 text-white text-sm rounded-lg focus:ring-1 focus:ring-[#6366f1] focus:border-[#6366f1] block w-full pl-10 p-3 font-mono transition-all hover:border-white/20"
                  placeholder="e.g. 2 hours"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
                Target / Exam Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-[#a1a1aa]" />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 text-white text-sm rounded-lg focus:ring-1 focus:ring-[#6366f1] focus:border-[#6366f1] block w-full pl-10 p-3 font-mono transition-all hover:border-white/20 [color-scheme:dark]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-6 border-t border-white/5">
            <button
              type="submit"
              className="w-full relative flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-black text-sm tracking-widest transition-all duration-300 hover:bg-[#6366f1] hover:text-white hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-[0.98] group/btn uppercase"
            >
              <div className="absolute inset-0 bg-white blur-md opacity-20 group-hover/btn:bg-[#6366f1] group-hover/btn:opacity-40 transition-colors rounded-xl"></div>
              <Activity className="w-5 h-5 relative z-10" />
              <span className="relative z-10 font-mono">Generate Roadmap</span>
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scan-line {
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(99, 102, 241, 0.2) 10%,
            rgba(99, 102, 241, 0.8) 50%,
            rgba(99, 102, 241, 0.2) 90%,
            transparent 100%
          );
          height: 10px;
          animation: scan 3s linear infinite;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
        }

        @keyframes scan {
          0% { transform: translateY(-10vh); }
          100% { transform: translateY(110vh); }
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }

        .glow-text-subtle {
          text-shadow: 0 0 15px rgba(255,255,255,0.3);
        }
      `}} />
    </div>
  );
};

export default PipelineIngestion;
