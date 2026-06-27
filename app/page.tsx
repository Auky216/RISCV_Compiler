"use client";

import { useAuth } from "@/lib/auth-context";
import { UserService } from "@/domain/user/service";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Cpu, Terminal, ShieldCheck, ArrowRight, Server, Database, Code, Cog } from "lucide-react";



const IconGithub = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5 0-1.4-.5-2.6-1.5-3.5.2-.5.7-1.7-.1-3.5 0 0-1.2-.4-3.8 1.4A13 13 0 0 0 12 3a13 13 0 0 0-3.3.4c-2.6-1.8-3.8-1.4-3.8-1.4-.8 1.8-.3 3-.1 3.5-1 .9-1.5 2.1-1.5 3.5 0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
  </svg>
);

const FEATURES = [
  {
    icon: <Terminal className="w-8 h-8" />,
    title: "Assembler",
    description: "> CAPSTONE DISASSEMBLER INTEGRATED.",
    animation: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2 } }
  },
  {
    icon: <Cpu className="w-8 h-8" />,
    title: "Cycle-Accurate CPU",
    description: "> FULL RV32I ISA SUPPORT DETECTED.",
    animation: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5 } }
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Cloud Sync",
    description: "> UPLINK ESTABLISHED. DATA SECURED.",
    animation: { opacity: [1, 0.5, 1], transition: { repeat: Infinity, duration: 2 } }
  },
  {
    icon: <Database className="w-8 h-8" />,
    title: "Memory Mapper",
    description: "> 1MB VIRTUAL SPACE ALLOCATED.",
    animation: { y: [0, 5, 0], transition: { repeat: Infinity, duration: 3 } }
  },
  {
    icon: <Server className="w-8 h-8" />,
    title: "Datapath Viewer",
    description: "> REAL-TIME MULTIPLEXER ROUTING.",
    animation: { x: [0, -3, 3, 0], transition: { repeat: Infinity, duration: 0.5, repeatDelay: 2 } }
  },
  {
    icon: <Cog className="w-8 h-8" />,
    title: "ABI Conventions",
    description: "> REGISTER ALIASES LOADED.",
    animation: { rotate: 360, transition: { repeat: Infinity, duration: 4, ease: "linear" } }
  },
];

const TypewriterText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayed}</span>;
};

const TerminalGrid = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-15 pointer-events-none flex flex-wrap gap-2 p-4 text-xs font-mono text-primary">
      {Array.from({ length: 200 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        >
          {Math.random() > 0.5 ? "0x" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase() : Math.random() > 0.5 ? "1" : "0"}
        </motion.div>
      ))}
    </div>
  );
};

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const handleCTA = () => {
    if (isAuthenticated) {
      router.push("/ide");
    } else {
      UserService.loginWithGoogle();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-background flex flex-col font-mono relative">
      <TerminalGrid />
      
      {/* Navbar */}
      <nav className="relative z-50 w-full px-6 py-4 flex items-center justify-between border-b-[4px] border-primary bg-background">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-8 h-8 bg-primary text-background flex items-center justify-center font-bold text-lg font-pixel-title"
          >
            R
          </motion.div>
          <span className="font-pixel-title text-xl tracking-widest uppercase text-primary">RISC-V OS</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/Auky216/RISCV_Compiler" target="_blank" rel="noreferrer" className="text-primary hover:opacity-70 transition-colors">
            <IconGithub />
          </a>
          <button
            onClick={handleCTA}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border-[3px] border-primary text-primary text-sm font-bold uppercase hover:bg-primary hover:text-background transition-all disabled:opacity-50 font-pixel-title shadow-[4px_4px_0_var(--color-primary)] active:shadow-[0_0_0_var(--color-primary)] active:translate-y-1 active:translate-x-1"
          >
            {isLoading ? "WAIT..." : isAuthenticated ? "BOOT_IDE" : "INGRESAR"}
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center z-10 relative">
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-6 pt-32 pb-20 flex flex-col items-start border-b-[4px] border-primary border-dashed">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-8 border-[3px] border-primary bg-background text-xs font-pixel-title text-primary uppercase shadow-[4px_4px_0_var(--color-primary)]"
          >
            <motion.span 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
              className="w-3 h-3 bg-primary" 
            />
            SYSTEM_ONLINE // V2.0
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-pixel-title leading-tight text-primary mb-6 uppercase">
            <TypewriterText text="INITIALIZING" delay={0} /><br/>
            <span className="text-muted-foreground"><TypewriterText text="RISC-V SIMULATOR..." delay={1000} /></span>
            <motion.span 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-6 h-10 bg-primary ml-2 align-middle"
            />
          </h1>

          <p className="text-xl md:text-2xl text-primary/80 max-w-2xl mb-12 leading-relaxed uppercase tracking-widest bg-background/90 p-4 border-l-[6px] border-primary">
            {`> Cycle-Accurate hardware simulation.`}<br/>
            {`> Full memory map access.`}<br/>
            {`> Step-by-step visual execution.`}<br/>
            {`> Prepare for uplink.`}
          </p>

            <button
              onClick={handleCTA}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-primary text-background font-pixel-title text-lg border-[3px] border-primary hover:bg-background hover:text-primary transition-all uppercase group shadow-[8px_8px_0_var(--color-primary)] active:shadow-[0_0_0_var(--color-primary)] active:translate-x-2 active:translate-y-2"
            >
              {"INGRESAR AL IDE"}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </button>
        </section>

        {/* Mock Terminal Interface */}
        <section className="w-full max-w-5xl mx-auto px-6 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full border-[4px] border-primary bg-background overflow-hidden relative shadow-[16px_16px_0_var(--color-primary)]"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b-[4px] border-primary bg-primary/20">
              <div className="font-pixel-title text-[12px] text-primary">{`C:\\RISCV_OS\\BIN>`}</div>
              <div className="flex gap-2">
                <div className="w-4 h-4 border-2 border-primary bg-background" />
                <div className="w-4 h-4 border-2 border-primary bg-background" />
                <div className="w-4 h-4 bg-primary" />
              </div>
            </div>
            
            {/* Terminal Body */}
            <div className="p-6 font-mono text-lg leading-relaxed text-primary h-[350px] overflow-hidden flex flex-col relative bg-background">
              <div className="opacity-80">{`> compiling main.s...`}</div>
              <div className="opacity-80 mt-1">{`> running pass 1 (label resolution)...`}</div>
              <div className="opacity-80 mt-1">{`> running pass 2 (opcode emission)...`}</div>
              <div className="mt-2 flex items-center gap-2 text-foreground font-bold">
                <span className="text-primary bg-primary/20 px-1">[OK]</span> Binary generated (2048 bytes)
              </div>
              <div className="opacity-80 mt-4">{`> starting debug session...`}</div>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-[3px] border-primary/50 border-dashed bg-primary/5">
                <div><span className="text-muted-foreground">PC:</span> 0x00000000</div>
                <div><span className="text-muted-foreground">a0:</span> 0x000007EA</div>
                <div><span className="text-muted-foreground">a7:</span> 0x00000001</div>
                <div><span className="text-muted-foreground">sp:</span> 0x000FFFFC</div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-primary font-bold">
                <span className="bg-primary text-background px-1">[ASM]</span> 0x0000000C: ecall
              </div>
              
              <div className="mt-auto flex items-center">
                <span className="mr-2 text-primary font-bold">{`C:\RISCV_OS\BIN>`}</span>
                <motion.div 
                  animate={{ opacity: [0, 1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-4 h-6 bg-primary"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Technical Specs Section */}
        <section className="w-full bg-primary/10 border-y-[4px] border-primary border-dashed">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="mb-12 flex items-center gap-4">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-8 h-8 bg-primary" 
              />
              <h2 className="text-2xl font-pixel-title text-primary uppercase">Supported Instructions</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-lg text-primary">
              <div className="border-[3px] border-primary p-4 shadow-[6px_6px_0_var(--color-primary)] bg-background hover:-translate-y-1 transition-transform">add, sub, and, or, xor</div>
              <div className="border-[3px] border-primary p-4 shadow-[6px_6px_0_var(--color-primary)] bg-background hover:-translate-y-1 transition-transform">addi, andi, ori, xori</div>
              <div className="border-[3px] border-primary p-4 shadow-[6px_6px_0_var(--color-primary)] bg-background hover:-translate-y-1 transition-transform">sll, srl, sra, slli</div>
              <div className="border-[3px] border-primary p-4 shadow-[6px_6px_0_var(--color-primary)] bg-background hover:-translate-y-1 transition-transform">lw, sw, lh, sh, lb, sb</div>
              <div className="border-[3px] border-primary p-4 shadow-[6px_6px_0_var(--color-primary)] bg-background hover:-translate-y-1 transition-transform">beq, bne, blt, bge</div>
              <div className="border-[3px] border-primary p-4 shadow-[6px_6px_0_var(--color-primary)] bg-background hover:-translate-y-1 transition-transform">jal, jalr</div>
              <div className="border-[3px] border-primary p-4 shadow-[6px_6px_0_var(--color-primary)] bg-background hover:-translate-y-1 transition-transform">lui, auipc</div>
              <div className="border-[3px] border-primary p-4 shadow-[6px_6px_0_var(--color-primary)] bg-primary text-background font-bold hover:-translate-y-1 transition-transform">ecall (Syscalls)</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-5xl mx-auto px-6 py-24">
          <div className="mb-12 border-b-[4px] border-primary pb-4">
            <h2 className="text-2xl font-pixel-title text-primary uppercase">System_Modules</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-8 border-[3px] border-primary bg-background shadow-[8px_8px_0_var(--color-primary)] hover:shadow-[4px_4px_0_var(--color-primary)] hover:translate-x-1 hover:translate-y-1 transition-all group relative"
              >
                <motion.div 
                  animate={feature.animation as any}
                  className="mb-6 text-primary"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="font-pixel-title text-md text-primary mb-4 uppercase bg-primary/10 inline-block px-2 py-1">{feature.title}</h3>
                <p className="text-md text-primary/80 leading-relaxed font-mono">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-50 border-t-[4px] border-primary py-8 px-6 text-center text-xs font-pixel-title text-primary/80 flex flex-col md:flex-row items-center justify-between max-w-5xl w-full mx-auto uppercase bg-background">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="w-6 h-6 border-[3px] border-primary text-primary flex items-center justify-center font-bold text-[10px]">R</div>
          <span>© 2026 RISC-V CORE ARCHITECTURE</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-background hover:bg-primary transition-colors px-2 py-1">{`[DOCS]`}</a>
          <a href="https://github.com/Auky216/RISCV_Compiler" target="_blank" rel="noreferrer" className="hover:text-background hover:bg-primary transition-colors px-2 py-1">{`[SRC]`}</a>
          <a href="#" className="hover:text-background hover:bg-primary transition-colors px-2 py-1">{`[SYS]`}</a>
        </div>
      </footer>
    </div>
  );
}
