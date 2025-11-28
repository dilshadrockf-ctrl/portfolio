import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Terminal, Server, ShieldCheck, Cpu, Globe, 
  ChevronDown, X, Copy, Check, Linkedin, 
  Mail, Code, Layers, Activity, 
  FileText, Monitor, Lock, Database,
  AlertCircle, Key, Send, Volume2, VolumeX,
  Search, Command, Wifi, AlertTriangle
} from 'lucide-react';

/**
 * -------------------------------------------
 * UTILITIES & HOOKS
 * -------------------------------------------
 */

// 1. SOUND SYNTHESIS ENGINE
const useSound = () => {
  const [enabled, setEnabled] = useState(false);
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const toggle = () => {
    if (!enabled) initAudio();
    setEnabled(!enabled);
  };

  const playTone = useCallback((freq, type = 'sine', duration = 0.1, vol = 0.05) => {
    if (!enabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [enabled]);

  const playHover = useCallback(() => playTone(800, 'sine', 0.05, 0.02), [playTone]);
  const playClick = useCallback(() => playTone(400, 'square', 0.1, 0.03), [playTone]);
  const playType = useCallback(() => playTone(1200, 'triangle', 0.03, 0.01), [playTone]);
  const playSuccess = useCallback(() => {
    if (!enabled) return;
    playTone(600, 'sine', 0.1, 0.05);
    setTimeout(() => playTone(1200, 'sine', 0.2, 0.05), 100);
  }, [enabled, playTone]);

  return { enabled, toggle, playHover, playClick, playType, playSuccess };
};

// 2. ROBUST CLIPBOARD HOOK
const useClipboard = (playSuccess) => {
  const [copied, setCopied] = useState(false);
  const copyText = useCallback((text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => { setCopied(true); playSuccess(); })
        .catch(() => copyLegacy(text));
    } else {
      copyLegacy(text);
    }
    setTimeout(() => setCopied(false), 2000);
  }, [playSuccess]);

  const copyLegacy = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      if (successful) { setCopied(true); playSuccess(); }
      document.body.removeChild(textArea);
    } catch (err) { console.error("Clipboard Failure", err); }
  };
  return { copied, copyText };
};

// 3. DECRYPTION TEXT EFFECT HOOK
const useHackerEffect = (text, speed = 30) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

  const trigger = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text.split("").map((letter, index) => {
          if (index < iterations) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      if (iterations >= text.length) { clearInterval(interval); setIsAnimating(false); }
      iterations += 1 / 3;
    }, speed);
  }, [text, speed, isAnimating]);

  useEffect(() => { const timer = setTimeout(trigger, 500); return () => clearTimeout(timer); }, [trigger]);
  return { displayText, trigger };
};

// 4. SCROLL SPY HOOK
const useScrollSpy = (sections) => {
    const [activeSection, setActiveSection] = useState(sections[0]);
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
        }, { threshold: 0.5 });
        sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, [sections]);
    return activeSection;
};

// 5. 3D TILT HOOK
const useTilt = () => {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    ref.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale3d(1.02, 1.02, 1.02)`;
  };
  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
  };
  return { ref, handleMouseMove, handleMouseLeave };
};

// 6. ANIMATED COUNTER HOOK
const useCounter = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => { if(entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, {threshold: 0.1});
      if(ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration, start, isVisible]);
  return { count, ref };
};

/**
 * -------------------------------------------
 * DATA CONSTANTS
 * -------------------------------------------
 */

const SECTIONS = ['hero', 'about', 'experience', 'projects', 'contact'];

const EXPERIENCE = [
  { id: 1, role: "Associate System Engineer", company: "H Connect International", period: "Oct 2025 - Present", desc: "Managing escalated technical issues, optimizing network uptime, and administering M365/Active Directory environments.", icon: <Server className="w-5 h-5 text-red-500" /> },
  { id: 2, role: "Junior Network Administrator", company: "Aethermind SIC (Qatar)", period: "Jan 2025 - Jun 2025", desc: "Built HPC systems for AI/ML workloads. Deployed OpenStack private clouds and optimized Dell servers/TrueNAS storage.", icon: <Cpu className="w-5 h-5 text-red-500" /> },
  { id: 3, role: "PC Builder / Tech Support", company: "Store 974 (Qatar)", period: "Sep 2022 - Jan 2025", desc: "Specialized in high-end custom PC assembly, hardware troubleshooting, and performance tuning for gaming workstations.", icon: <Monitor className="w-5 h-5 text-red-500" /> },
  { id: 4, role: "Support Specialist", company: "Amez Cloud", period: "Dec 2020 - Feb 2022", desc: "Provided remote and on-site IT support, ensuring seamless operations for enterprise clients.", icon: <Activity className="w-5 h-5 text-red-500" /> },
  { id: 5, role: "IT Hardware Technician", company: "Hi-Tech Marketing", period: "Apr 2018 - Sep 2020", desc: "Installed PC components, maintained existing hardware, and performed component-level troubleshooting.", icon: <Code className="w-5 h-5 text-red-500" /> }
];

const PROJECTS = [
  { title: "Private Cloud Deployment", tech: "OpenStack, Python", desc: "Architected a private cloud testbed using OpenStack. Integrated Neutron networking and Cinder storage.", icon: <Globe className="w-8 h-8" /> },
  { title: "Proxmox Virtual Lab", tech: "Proxmox, vSwitch", desc: "Engineered a secure virtual lab simulating enterprise networks with virtual firewalls and switches.", icon: <Layers className="w-8 h-8" /> },
  { title: "HPC Cluster for AI", tech: "Linux, GPU Passthrough", desc: "Built and optimized HPC clusters tailored for AI/ML model training with multi-GPU configurations.", icon: <Cpu className="w-8 h-8" /> },
  { title: "Fortinet Security Audit", tech: "FortiGate, VPN", desc: "Hardened enterprise network security by implementing strict traffic policies and SSL VPNs.", icon: <ShieldCheck className="w-8 h-8" /> }
];

const CERTIFICATIONS = [
  { name: "Cisco Certified Network Associate", issuer: "Cisco", code: "CCNA 200-301", color: "border-blue-500", text: "text-blue-500" },
  { name: "Certified in Cybersecurity (CC)", issuer: "ISC2", code: "ISC2-CC-2024", color: "border-green-500", text: "text-green-500" },
  { name: "Google IT Support Professional", issuer: "Google", code: "GOOG-IT-SUP", color: "border-yellow-500", text: "text-yellow-500" }
];

const STATS = [
  { label: "Infrastructure Uptime", value: 99, suffix: "%", color: "bg-green-500" },
  { label: "Security Threats Blocked", value: 100, suffix: "%", color: "bg-red-500" },
  { label: "Cloud Deployment Efficiency", value: 95, suffix: "%", color: "bg-blue-500" },
  { label: "Hardware Optimization", value: 98, suffix: "%", color: "bg-purple-500" }
];

const SKILLS = [ "Cisco IOS", "Fortinet", "OpenStack", "AWS", "Linux RHEL", "HPC", "Proxmox", "Docker", "Python", "TrueNAS", "Active Directory", "Virtualization", "GPU Acceleration", "LLM Config", "Terraform" ];

/**
 * -------------------------------------------
 * VISUAL COMPONENTS
 * -------------------------------------------
 */

// Boot Sequence
const BootSequence = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  const logs = [
    "INITIALIZING KERNEL...",
    "LOADING SYSTEM DRIVERS...",
    "MOUNTING FILE SYSTEMS... [OK]",
    "CHECKING MEMORY INTEGRITY... [OK]",
    "ESTABLISHING SECURE UPLINK...",
    "AUTHENTICATING USER: DILSHAD...",
    "ACCESS GRANTED.",
    "STARTING INTERFACE..."
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < logs.length) {
        setLines(prev => [...prev, logs[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 200); 
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-start justify-start p-8 font-mono text-green-500 text-sm md:text-base overflow-hidden">
      <div className="space-y-1">
        {lines.map((line, i) => (
          <div key={i}>{`> ${line}`}</div>
        ))}
        <div className="animate-pulse">_</div>
      </div>
      <button onClick={onComplete} className="absolute bottom-8 right-8 text-neutral-500 text-xs border border-neutral-800 px-3 py-1 rounded hover:text-white hover:border-white transition-colors">SKIP BOOT [ESC]</button>
    </div>
  );
};

// Command Palette
const CommandPalette = ({ isOpen, onClose, scrollTo, toggleAudio, audioEnabled, copyEmail }) => {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
        inputRef.current?.focus();
        setSearch("");
    }
  }, [isOpen]);

  const items = [
    { label: "Go to Home", action: () => scrollTo('hero'), icon: <Monitor className="w-4 h-4"/> },
    { label: "Go to About", action: () => scrollTo('about'), icon: <FileText className="w-4 h-4"/> },
    { label: "Go to Experience", action: () => scrollTo('experience'), icon: <Activity className="w-4 h-4"/> },
    { label: "Go to Projects", action: () => scrollTo('projects'), icon: <Layers className="w-4 h-4"/> },
    { label: "Go to Contact", action: () => scrollTo('contact'), icon: <Mail className="w-4 h-4"/> },
    { label: "Copy Email", action: () => copyEmail(), icon: <Copy className="w-4 h-4"/> },
    { label: audioEnabled ? "Mute Audio" : "Enable Audio", action: toggleAudio, icon: audioEnabled ? <VolumeX className="w-4 h-4"/> : <Volume2 className="w-4 h-4"/> },
  ].filter(item => item.label.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (action) => {
    action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[20vh] px-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
            <Search className="w-5 h-5 text-neutral-500" />
            <input 
                ref={inputRef}
                type="text" 
                placeholder="Type a command..." 
                className="bg-transparent w-full text-white outline-none placeholder-neutral-600 font-mono"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <div className="px-2 py-0.5 bg-neutral-800 rounded text-xs text-neutral-500 font-mono">ESC</div>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
            {items.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => handleSelect(item.action)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:bg-red-900/20 hover:text-white rounded transition-colors text-left font-mono group"
                >
                    <span className="text-neutral-500 group-hover:text-red-500">{item.icon}</span>
                    {item.label}
                </button>
            ))}
            {items.length === 0 && <div className="p-4 text-center text-neutral-600 font-mono text-sm">NO COMMANDS FOUND</div>}
        </div>
      </div>
    </div>
  );
};

// System Log
const SystemLog = () => {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        const events = [
            { type: "INFO", msg: "Traffic analysis normal" },
            { type: "SYS", msg: "CPU temp 42°C" },
            { type: "SEC", msg: "Port 443 handshake" },
            { type: "NET", msg: "Packet verified" },
            { type: "INFO", msg: "Garbage collection" },
            { type: "WARN", msg: "Latency spike 12ms" }
        ];
        const interval = setInterval(() => {
            const newEvent = events[Math.floor(Math.random() * events.length)];
            const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
            setLogs(prev => {
                const updated = [...prev, { ...newEvent, time, id: Date.now() }];
                return updated.slice(-4); 
            });
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-6 left-6 z-40 hidden xl:block font-mono text-[10px] text-neutral-500 pointer-events-none">
            <div className="border-l border-red-900/50 pl-2 space-y-1">
                {logs.map(log => (
                    <div key={log.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-neutral-600">[{log.time}]</span> 
                        <span className={`mx-1 ${log.type === 'WARN' ? 'text-yellow-500' : 'text-red-900'}`}>{log.type}</span> 
                        <span className="text-neutral-400">{log.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HackerText = ({ text, className, playType }) => {
  const { displayText, trigger } = useHackerEffect(text);
  return (
    <span 
        onMouseEnter={() => { trigger(); playType && playType(); }} 
        className={`cursor-default inline-block font-mono ${className}`}
    >
      {displayText}
    </span>
  );
};

const ShimmerText = ({ text, className }) => {
  return (
    <span className={`relative inline-block cursor-pointer group ${className}`}>
      <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-[length:200%_auto] group-hover:animate-shimmer transition-all">
        {text}
      </span>
      <span className="absolute inset-0 blur-lg bg-red-600/0 group-hover:bg-red-600/30 transition-all duration-500"></span>
    </span>
  );
};

const RadarNav = ({ activeSection, scrollTo }) => {
    return (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-6 items-center">
            <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-red-900 to-transparent absolute top-0 left-1/2 -translate-x-1/2 -z-10" />
            <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-red-900 to-transparent absolute bottom-0 left-1/2 -translate-x-1/2 -z-10" />
            
            {SECTIONS.map((id) => (
                <button 
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`group relative flex items-center justify-center w-4 h-4 transition-all duration-300`}
                >
                    <div className={`absolute w-2 h-2 rounded-full transition-all duration-300 ${activeSection === id ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-neutral-800 group-hover:bg-neutral-600'}`} />
                    <div className={`absolute w-8 h-8 border border-red-600/50 rounded-full transition-all duration-500 ${activeSection === id ? 'scale-100 opacity-100 rotate-90' : 'scale-0 opacity-0 rotate-0'}`} />
                    <div className={`absolute w-12 h-12 border-x border-red-600/20 rounded-full transition-all duration-700 delay-75 ${activeSection === id ? 'scale-100 opacity-100 -rotate-45' : 'scale-0 opacity-0 rotate-0'}`} />
                    <span className="absolute right-8 text-[10px] font-mono text-red-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-1 border border-red-900/50 rounded">
                        {id.toUpperCase()}
                    </span>
                </button>
            ))}
        </div>
    );
};

const SpotlightCard = ({ children, className = "", playHover }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { setOpacity(1); playHover && playHover(); }}
      onMouseLeave={() => setOpacity(0)}
      className={`relative rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(220, 38, 38, 0.15), transparent 40%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300"
        style={{
          opacity,
          border: '1px solid rgba(220, 38, 38, 0.5)',
          maskImage: `radial-gradient(300px circle at ${position.x}px ${position.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(300px circle at ${position.x}px ${position.y}px, black, transparent)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

const HexGridBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const handleMouseMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    const a = 2 * Math.PI / 6;
    const r = 30;
    const drawHexagon = (x, y, color) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { ctx.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i)); }
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.stroke();
    };
    const draw = () => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const dx = r * (1 + Math.cos(a));
      const dy = r * Math.sin(a);
      const rows = Math.ceil(canvas.height / dy);
      const cols = Math.ceil(canvas.width / dx);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * dx * 1.5 + (row % 2) * (dx * 0.75);
          const y = row * dy;
          const dist = Math.hypot(x - mouseRef.current.x, y - mouseRef.current.y);
          const maxDist = 300;
          let alpha = 0.05;
          if (dist < maxDist) alpha += (1 - dist / maxDist) * 0.3;
          alpha += Math.sin(time + x * 0.01 + y * 0.01) * 0.02;
          drawHexagon(x, y, `rgba(220, 38, 38, ${Math.max(0, alpha)})`);
        }
      }
      time += 0.02;
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
};

const ProgressBar = ({ label, end, suffix, color }) => {
  const { count, ref } = useCounter(end);
  return (
    <div ref={ref} className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-sm text-neutral-400">{label}</span>
        <span className={`font-mono font-bold ${color.replace('bg-', 'text-')}`}>{count}{suffix}</span>
      </div>
      <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
        <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${count}%` }} />
      </div>
    </div>
  );
};

const SecureContactForm = ({ playSuccess, playClick }) => {
  const [status, setStatus] = useState('idle');
  const handleSubmit = (e) => {
    e.preventDefault();
    if(playClick) playClick();
    setStatus('encrypting');
    setTimeout(() => {
      setStatus('sent');
      if(playSuccess) playSuccess();
      setTimeout(() => setStatus('idle'), 3000);
    }, 2000);
  };
  return (
    <SpotlightCard className="p-8">
      <div className="flex items-center gap-2 mb-6 text-red-500 border-b border-red-900/30 pb-4">
        <Lock className="w-5 h-5" />
        <h3 className="font-bold font-mono">SECURE_TRANSMISSION_PROTOCOL</h3>
      </div>
      {status === 'idle' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neutral-500 mb-1">IDENTITY_ID (NAME)</label>
            <input required type="text" className="w-full bg-black border border-neutral-800 rounded p-2 text-white focus:border-red-600 outline-none transition-colors" placeholder="Enter identification..." />
          </div>
          <div>
            <label className="block text-xs font-mono text-neutral-500 mb-1">FREQUENCY (EMAIL)</label>
            <input required type="email" className="w-full bg-black border border-neutral-800 rounded p-2 text-white focus:border-red-600 outline-none transition-colors" placeholder="Enter frequency..." />
          </div>
          <div>
            <label className="block text-xs font-mono text-neutral-500 mb-1">PAYLOAD (MESSAGE)</label>
            <textarea required rows="4" className="w-full bg-black border border-neutral-800 rounded p-2 text-white focus:border-red-600 outline-none transition-colors" placeholder="Enter encrypted payload..." />
          </div>
          <button type="submit" className="w-full bg-red-900/20 border border-red-600 text-red-500 py-3 rounded hover:bg-red-600 hover:text-white transition-all font-mono font-bold flex items-center justify-center gap-2 group">
            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            INITIATE_UPLINK
          </button>
        </form>
      ) : status === 'encrypting' ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Database className="w-12 h-12 text-red-600 animate-pulse" />
          <div className="font-mono text-red-500 text-sm">ENCRYPTING PACKET DATA...</div>
          <div className="w-48 bg-neutral-900 h-1 rounded-full overflow-hidden">
             <div className="h-full bg-red-600 animate-[progress_2s_ease-in-out_infinite]" style={{width: '100%'}}></div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Check className="w-12 h-12 text-green-500" />
          <div className="font-mono text-green-500 text-sm">TRANSMISSION SUCCESSFUL</div>
          <p className="text-neutral-500 text-xs text-center">The secure channel has received your packet.<br/>Response latency estimated: 1-2 hours.</p>
        </div>
      )}
    </SpotlightCard>
  );
};

// Terminal Modal
const TerminalModal = ({ isOpen, onClose, playType, playSuccess }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setHistory([
        "Initializing SYSTEM_CORE v3.0...", 
        "Establishing Secure Connection...",
        "Identity Verified: GUEST_USER",
        "Type 'help' to navigate."
      ]);
    }
  }, [isOpen]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      let response = "";
      
      if(playSuccess) playSuccess();

      switch (cmd) {
        case 'help': response = "COMMANDS: about, skills, exp, contact, clear, exit"; break;
        case 'about': response = "Dilshad Liyawdeen. Systems Engineer. Expert in HPC & Network Security."; break;
        case 'skills': response = "CORE: Cisco, Fortinet, OpenStack, Linux, AWS, GPU Config."; break;
        case 'exp': response = "LATEST: H Connect (Present), Aethermind (2025)."; break;
        case 'contact': response = "dilshadliyawdeen@gmail.com | +94 76 963 7774"; break;
        case 'clear': setHistory([]); setInput(''); return;
        case 'exit': onClose(); return;
        default: response = `ERR: Command '${cmd}' not recognized.`;
      }
      setHistory(prev => [...prev, `> ${input}`, response]);
      setInput('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } else {
        if(playType) playType();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-900 border border-red-900/50 rounded-lg shadow-2xl shadow-red-900/20 overflow-hidden font-mono text-sm md:text-base ring-1 ring-red-500/20">
        <div className="bg-neutral-800 px-4 py-2 flex justify-between items-center border-b border-neutral-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-neutral-400 text-xs">root@dilshad-system:~</span>
          <button onClick={onClose}><X className="w-4 h-4 text-neutral-400 hover:text-white" /></button>
        </div>
        
        <div className="p-4 h-80 overflow-y-auto text-green-400 scrollbar-hide font-mono">
          {history.map((line, i) => (
            <div key={i} className="mb-1 opacity-90">{line}</div>
          ))}
          <div ref={messagesEndRef} />
          <div className="flex items-center mt-2">
            <span className="mr-2 text-red-500 font-bold">{'>'}</span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleCommand}
              autoFocus
              className="bg-transparent border-none outline-none text-white w-full font-mono placeholder-neutral-700"
              placeholder="Enter command..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * -------------------------------------------
 * MAIN APP COMPONENT
 * -------------------------------------------
 */
export default function Portfolio() {
  const [isLoaded, setIsLoaded] = useState(false); // Controls Boot Sequence
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false); // Command Palette
  
  const { enabled: audioEnabled, toggle: toggleAudio, playHover, playClick, playType, playSuccess } = useSound();
  const { copied, copyText } = useClipboard(playSuccess);
  const { ref: tiltRef, handleMouseMove: tiltMove, handleMouseLeave: tiltLeave } = useTilt();
  const activeSection = useScrollSpy(SECTIONS);

  // Command Palette Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            setIsPaletteOpen(prev => !prev);
        }
        if (e.key === 'Escape') {
            setIsPaletteOpen(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollTo = (id) => {
    if(playClick) playClick();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {!isLoaded && <BootSequence onComplete={() => setIsLoaded(true)} />}
      
      {isLoaded && (
        <div className="relative min-h-screen bg-neutral-950 text-white overflow-x-hidden font-sans selection:bg-red-900 selection:text-white animate-in fade-in duration-1000">
          <HexGridBackground />
          <TerminalModal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} playType={playType} playSuccess={playSuccess} />
          <CommandPalette 
            isOpen={isPaletteOpen} 
            onClose={() => setIsPaletteOpen(false)} 
            scrollTo={scrollTo} 
            toggleAudio={toggleAudio} 
            audioEnabled={audioEnabled}
            copyEmail={() => copyText("dilshadliyawdeen@gmail.com")}
          />
          <RadarNav activeSection={activeSection} scrollTo={scrollTo} />
          <SystemLog />

          {/* Navigation */}
          <nav className="fixed top-0 w-full z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
              <div className="text-xl font-bold tracking-tighter flex items-center gap-2 group cursor-pointer" onClick={() => scrollTo('hero')}>
                <ShieldCheck className="text-red-600 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:block group-hover:text-red-500 transition-colors">SYS_ADMIN</span>
              </div>
              <div className="flex items-center gap-4">
                {/* Audio Toggle */}
                <button 
                    onClick={toggleAudio}
                    className={`p-2 rounded-full transition-colors ${audioEnabled ? 'text-red-500 bg-red-900/20' : 'text-neutral-500 hover:text-white'}`}
                    title={audioEnabled ? "Mute System Audio" : "Enable System Audio"}
                >
                    {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                {/* Hint for Palette */}
                <div 
                    onClick={() => setIsPaletteOpen(true)}
                    className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-600 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded cursor-pointer hover:border-neutral-600 hover:text-neutral-400 transition-all"
                >
                    <Command className="w-3 h-3" />
                    <span>CTRL+K</span>
                </div>
                <a 
                    href="/Dilshad_Liyawdeen-Network_Administrator_Resume_250811_180305.pdf" 
                    download
                    className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                >
                    <FileText className="w-4 h-4" /> RESUME.PDF
                </a>
                <button 
                    onClick={() => { setIsTerminalOpen(true); playClick && playClick(); }}
                    className="flex items-center gap-2 px-4 py-1 border border-red-600/50 rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-all text-sm font-mono group"
                >
                    <Terminal className="w-4 h-4" />
                    <span className="group-hover:translate-x-1 transition-transform">TERMINAL</span>
                </button>
              </div>
            </div>
          </nav>

          {/* HERO SECTION */}
          <header id="hero" className="relative h-screen flex flex-col justify-center items-center z-10 px-4">
              <div 
                ref={tiltRef}
                onMouseMove={tiltMove}
                onMouseLeave={tiltLeave}
                className="text-center will-change-transform"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-950/30 border border-green-800/50 mb-8 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-mono text-green-400 tracking-wider">SYSTEM STATUS: ONLINE</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-4 text-white drop-shadow-2xl">
                  <div className="flex flex-col md:block">
                    <HackerText text="DILSHAD" playType={playType} />
                    <span className="md:ml-4">
                        <ShimmerText text="LIYAWDEEN" />
                    </span>
                  </div>
                </h1>

                <p className="text-lg md:text-2xl text-zinc-400 font-mono tracking-widest uppercase">
                  Network Architect <span className="text-red-600 animate-pulse">|</span> Systems Engineer
                </p>
              </div>

            <div className="absolute bottom-10 animate-bounce text-neutral-500">
              <ChevronDown className="w-8 h-8" />
            </div>
          </header>

          {/* MARQUEE */}
          <div 
            className="relative z-20 py-4 bg-neutral-950 border-y-2 border-red-600 overflow-hidden transform -rotate-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)] my-8"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                #000000,
                #000000 20px,
                #450a0a 20px,
                #450a0a 40px
              )`
            }}
          >
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="flex w-full relative z-10">
              <div className="animate-marquee flex gap-8 min-w-full items-center">
                {[...SKILLS, ...SKILLS].map((skill, i) => (
                  <div key={i} className="flex items-center gap-8">
                    <span className="text-xl md:text-2xl font-black font-mono text-white tracking-tighter uppercase drop-shadow-md">
                      {skill}
                    </span>
                    <span className="text-red-600/60 font-mono text-xs tracking-[0.2em] font-bold">
                      // CAUTION: CLASSIFIED //
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ABOUT & DIAGNOSTICS SECTION */}
          <section id="about" className="relative z-20 py-24 container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left Column: Bio & Certs */}
              <div className="space-y-8">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-red-600 rounded-sm" />
                    COMMAND CENTER
                    </h2>
                    <p className="text-neutral-400 leading-relaxed text-lg mb-4">
                    Infrastructure specialist with 7+ years of experience in building high-availability networks and computing systems. Proven track record in <span className="text-white">Active Directory</span> management, <span className="text-white">OpenStack</span> deployment, and <span className="text-white">HPC</span> optimization.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CERTIFICATIONS.map((cert, idx) => (
                        <SpotlightCard key={idx} playHover={playHover} className="p-4 flex flex-col justify-between h-32 group hover:bg-neutral-900 transition-colors">
                            <div className="flex justify-between items-start">
                                <Key className={`w-6 h-6 ${cert.text}`} />
                                <span className="text-[10px] font-mono border border-neutral-700 px-1 rounded text-neutral-500">VERIFIED</span>
                            </div>
                            <div>
                                <div className={`text-sm font-bold text-white group-hover:${cert.text} transition-colors`}>{cert.name}</div>
                                <div className="text-xs font-mono text-neutral-500 mt-1">{cert.code}</div>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
              </div>

              {/* Right Column: System Diagnostics Dashboard */}
              <SpotlightCard className="p-8 bg-black/60 backdrop-blur-sm" playHover={playHover}>
                <div className="flex justify-between items-start mb-8 border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-red-600 animate-pulse" />
                    <h3 className="text-xl font-bold text-white">SYSTEM DIAGNOSTICS</h3>
                  </div>
                  <span className="font-mono text-xs text-neutral-500 border border-neutral-800 px-2 py-1 rounded">LIVE METRICS</span>
                </div>
                
                <div className="space-y-2">
                    {STATS.map((stat, i) => (
                        <ProgressBar key={i} {...stat} />
                    ))}
                </div>
              </SpotlightCard>
            </div>
          </section>

          {/* EXPERIENCE TIMELINE */}
          <section id="experience" className="relative z-20 py-24 bg-neutral-900/20 border-y border-neutral-900">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">DEPLOYMENT HISTORY</h2>
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto rounded-full" />
              </div>

              <div className="relative max-w-5xl mx-auto">
                {/* Center Line with Moving Packets */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-neutral-800 md:-ml-0.5 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-transparent via-red-500 to-transparent animate-packet" />
                    <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-transparent via-red-500 to-transparent animate-packet delay-1000" />
                </div>

                <div className="space-y-12">
                  {EXPERIENCE.map((job, index) => (
                    <div 
                      key={job.id}
                      className={`relative flex flex-col md:flex-row gap-8 ${
                        index % 2 === 0 ? 'md:flex-row-reverse' : ''
                      }`}
                    >
                      <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-black border-2 border-red-600 rounded-full z-10 md:-translate-x-1/2 -translate-x-[9px] mt-6 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                      <div className={`hidden md:block w-1/2 pt-5 font-mono text-sm text-red-500/80 ${index % 2 === 0 ? 'text-left pl-16' : 'text-right pr-16'}`}>
                        {job.period}
                      </div>
                      <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                        <SpotlightCard className="p-6 h-full group bg-black hover:bg-neutral-900 transition-colors" playHover={playHover}>
                          <span className="md:hidden text-xs text-red-500 font-mono mb-2 block">{job.period}</span>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-white group-hover:text-red-500 transition-colors">{job.role}</h3>
                              <p className="text-zinc-500 text-sm font-mono">{job.company}</p>
                            </div>
                            <div className="p-2 bg-neutral-900 rounded border border-neutral-800 text-red-500">
                              {job.icon}
                            </div>
                          </div>
                          <p className="text-neutral-400 text-sm leading-relaxed border-t border-neutral-900 pt-3 mt-3">
                            {job.desc}
                          </p>
                        </SpotlightCard>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* PROJECTS GRID */}
          <section id="projects" className="relative z-20 py-24 container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
              <Layers className="text-red-600" />
              SYSTEM PROTOCOLS (PROJECTS)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {PROJECTS.map((project, i) => (
                <SpotlightCard 
                  key={i} 
                  playHover={playHover}
                  className="h-full p-8"
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-red-600/10 rounded-lg text-red-500">
                          {project.icon}
                        </div>
                        <div className="text-xs font-mono text-neutral-600 border border-neutral-800 px-2 py-1 rounded">SECURE</div>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-white">{project.title}</h3>
                      <div className="text-xs font-mono text-red-400 mb-4 tracking-wider">{project.tech.toUpperCase()}</div>
                      <p className="text-neutral-400 leading-relaxed text-sm">{project.desc}</p>
                    </div>
                </SpotlightCard>
              ))}
            </div>
          </section>

          {/* FOOTER & CONTACT */}
          <footer id="contact" className="relative z-20 bg-neutral-950 border-t border-neutral-900 pt-20 pb-10">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                <div className="text-left">
                    <h2 className="text-4xl font-bold mb-4">INITIALIZE UPLINK</h2>
                    <p className="text-neutral-500 max-w-md mb-8">Ready to secure and optimize your infrastructure? Establishing a secure channel is just one click away.</p>
                    
                    <div className="flex gap-4">
                        <button 
                        onClick={() => copyText("dilshadliyawdeen@gmail.com")}
                        className="flex items-center gap-2 px-6 py-3 bg-neutral-900 border border-neutral-800 hover:border-white rounded text-sm font-bold transition-all"
                        >
                        <Mail className="w-4 h-4" />
                        {copied ? "COPIED TO CLIPBOARD" : "COPY EMAIL"}
                        </button>
                        <a 
                        href="https://linkedin.com/in/dilshad-liyawdeen-66886421qar"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-[#0077b5] text-white rounded text-sm font-bold hover:bg-[#006097] transition-all"
                        >
                        <Linkedin className="w-4 h-4" />
                        LINKEDIN
                        </a>
                    </div>
                </div>

                <SecureContactForm playSuccess={playSuccess} playClick={playClick} />
              </div>

              <div className="text-neutral-600 text-sm font-mono border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p>&copy; {new Date().getFullYear()} DILSHAD LIYAWDEEN. ALL SYSTEMS OPERATIONAL.</p>
                <div className="flex gap-6">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> SERVER: ONLINE</span>
                    <span className="flex items-center gap-2"> LATENCY: 12ms</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Global Styles */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes progress { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        .animate-shimmer { animation: shimmer 3s linear infinite; }
        @keyframes packet { 0% { top: -10%; opacity: 0; } 20% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        .animate-packet { animation: packet 4s linear infinite; }
        .delay-1000 { animation-delay: 2s; }
      `}</style>
    </>
  );
}