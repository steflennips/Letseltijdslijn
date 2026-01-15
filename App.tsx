
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ArchitectureNode, ChatMessage, ComplianceRule } from './types';
import html2canvas from 'html2canvas';
import { GoogleGenAI } from "@google/genai";

// --- Components ---

const Header: React.FC<{ onExport: () => void; isExporting: boolean }> = ({ onExport, isExporting }) => (
  <header className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm no-print">
    <div className="flex items-center gap-4">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
        <i className="fas fa-project-diagram text-2xl"></i>
      </div>
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Lestel <span className="text-blue-600">Fabric</span> Blueprint</h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Transitie: SAP BW ➔ Microsoft Azure & Fabric</p>
      </div>
    </div>
    <div className="flex gap-6 items-center">
      <div className="hidden md:flex flex-col items-end">
        <span className="flex items-center gap-2 text-xs text-green-600 font-bold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          BIO & AVG Compliant
        </span>
        <span className="text-[10px] text-gray-400 font-medium">Gemini AI Powered</span>
      </div>
      <button 
        onClick={onExport}
        disabled={isExporting}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95 ${
          isExporting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
        }`}
      >
        <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
        {isExporting ? 'Exporteren...' : 'Export Plaat'}
      </button>
    </div>
  </header>
);

const NodeCard: React.FC<{ node: ArchitectureNode; isActive: boolean; onClick: () => void }> = ({ node, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`diagram-node cursor-pointer p-3 rounded-xl border-2 transition-all text-center ${
      isActive ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-white bg-white shadow-sm hover:border-blue-200'
    }`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 mx-auto text-white text-sm ${node.color}`}>
      <i className={`fas ${node.icon}`}></i>
    </div>
    <h3 className="font-bold text-gray-800 text-[10px] leading-tight">{node.label}</h3>
  </div>
);

const TimelineStep: React.FC<{
  number: number;
  title: string;
  description: string;
  owner: string;
  colorClass: string;
  icon: string;
  milestones: string[];
  extraInfo: React.ReactNode;
  isActive: boolean;
  isExporting: boolean;
  onClick: () => void;
}> = ({ number, title, description, owner, colorClass, icon, milestones, extraInfo, isActive, isExporting, onClick }) => {
  const isExpanded = isActive || isExporting;
  return (
    <div 
      onClick={onClick}
      className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer overflow-hidden ${
        isExpanded && !isExporting
          ? `bg-white ring-4 ring-blue-100 scale-[1.01] shadow-xl z-20` 
          : `bg-white border-slate-100 shadow-sm hover:shadow-md z-10`
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${colorClass}`}>
          <i className={`fas ${icon} text-xl`}></i>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Stap {number}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">{owner}</span>
            </div>
            <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px] opacity-40 no-print export-ignore`}></i>
          </div>
          <h4 className="text-lg font-black text-gray-900 mb-2">{title}</h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-4">{description}</p>
          
          <div className="flex flex-wrap gap-2">
            {milestones.map((m, i) => (
              <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-bold text-gray-500 flex items-center gap-1">
                <i className="fas fa-link text-[8px] opacity-40"></i> {m}
              </span>
            ))}
          </div>

          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] mt-6 pt-6 border-t border-gray-100 opacity-100' : 'max-h-0 opacity-0'}`}>
            {extraInfo}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeStepId, setActiveStepId] = useState<number | null>(1);
  const [activeNodeId, setActiveNodeId] = useState<string | null>('sap-bw');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatSession = useMemo(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `
          Je bent een Senior Solution Architect gespecialiseerd in het "Lestel domein" en data-transities van SAP BW naar Microsoft Azure Fabric.
          Je helpt het team bij het realiseren van de "Lestel Fabric Blueprint".
          
          Focusgebieden:
          1. Transitie van SAP BW legacy (Cubes/ABAP) naar OneLake/Lakehouse.
          2. Architectuur lagen: Bronze (landing), Silver (modeling), Gold (serving).
          3. Compliance: BIO (Basisbeveiliging Overheid) en AVG.
          4. Innovatie: PowerBI integratie en Agentic AI scenario's.

          Je antwoorden moeten professioneel, concreet en behulpzaam zijn voor BI-specialisten en architecten.
        `,
      },
    });
  }, []);

  const nodes: ArchitectureNode[] = [
    { id: 'sap-bw', label: 'BW Sources', category: 'Source', description: 'Basis voor analyse.', icon: 'fa-database', color: 'bg-blue-600' },
    { id: 'fabric-df', label: 'Ontsluiting', category: 'Ingestion', description: 'Verplaatsen naar Azure.', icon: 'fa-shuffle', color: 'bg-blue-600' },
    { id: 'fabric-onelake', label: 'Lakehouse', category: 'Storage', description: 'OneLake Landing.', icon: 'fa-cloud', color: 'bg-blue-400' },
    { id: 'fabric-modeling', label: 'Modellering', category: 'Processing', description: 'Silver Layer.', icon: 'fa-sitemap', color: 'bg-green-600' },
    { id: 'golden-layer', label: 'Golden Layer', category: 'Serving', description: 'Gezuiverde dataset.', icon: 'fa-star', color: 'bg-yellow-500' },
    { id: 'powerbi', label: 'Power BI', category: 'Serving', description: 'Business Intelligence.', icon: 'fa-chart-pie', color: 'bg-orange-500' },
    { id: 'agentic-ai', label: 'Agentic AI', category: 'AI', description: 'Slimme automatisering.', icon: 'fa-robot', color: 'bg-orange-600' },
    { id: 'purview', label: 'Purview', category: 'Governance', description: 'Data Governance.', icon: 'fa-shield-halved', color: 'bg-slate-800' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg.content });
      const responseText = result.text;
      setChatHistory(prev => [...prev, { role: 'model', content: responseText || "Geen antwoord van AI." }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', content: "Fout bij verbinden met Gemini. Controleer de API Key in Vercel." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setTimeout(async () => {
      try {
        const element = document.getElementById('architecture-plaat');
        if (element) {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#f8fafc' });
          const link = document.createElement('a');
          link.download = `Lestel-Fabric-Blueprint.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onExport={handleExport} isExporting={isExporting} />
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full">
        <div className="lg:col-span-8 space-y-8" id="architecture-plaat">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimelineStep 
              number={1} 
              title="BW Bronnen" 
              owner="Technisch team"
              icon="fa-search"
              colorClass="bg-blue-600"
              description="Analyse en inventarisatie van legacy systemen."
              milestones={["Mapping", "Kwaliteitschecks"]}
              isActive={activeStepId === 1}
              isExporting={isExporting}
              onClick={() => setActiveStepId(1)}
              extraInfo={<p className="text-[11px] text-gray-500">Doel: Inzicht in Cube structuren.</p>}
            />
            <TimelineStep 
              number={2} 
              title="Ontsluiten naar Azure" 
              owner="Infrastructuur"
              icon="fa-cloud-arrow-up"
              colorClass="bg-blue-600"
              description="Data landing in OneLake (Bronze layer)."
              milestones={["OneLake", "Security"]}
              isActive={activeStepId === 2}
              isExporting={isExporting}
              onClick={() => setActiveStepId(2)}
              extraInfo={<p className="text-[11px] text-gray-500">Landing via Fabric Dataflows Gen2.</p>}
            />
          </div>

          <TimelineStep 
            number={3} 
            title="Data Modellering" 
            owner="Data Engineers"
            icon="fa-sitemap"
            colorClass="bg-green-600"
            description="Opzet van Data Marts in de Silver Layer."
            milestones={["Star Schemas", "Delta Parquet"]}
            isActive={activeStepId === 3}
            isExporting={isExporting}
            onClick={() => setActiveStepId(3)}
            extraInfo={<p className="text-[11px] text-gray-500">Focus op domeingericht werken.</p>}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimelineStep 
              number={4} 
              title="Bouwen Golden Layer" 
              owner="Data Engineers"
              icon="fa-industry"
              colorClass="bg-yellow-500"
              description="Robuuste ETL pipelines voor Serving."
              milestones={["Notebooks", "Pipelines"]}
              isActive={activeStepId === 4}
              isExporting={isExporting}
              onClick={() => setActiveStepId(4)}
              extraInfo={<p className="text-[11px] text-gray-500">Transformatie naar de Golden standard.</p>}
            />
            <TimelineStep 
              number={5} 
              title="Golden Layer" 
              owner="Business"
              icon="fa-star"
              colorClass="bg-yellow-500"
              description="Single Source of Truth voor analytics."
              milestones={["Governance", "Kwaliteit"]}
              isActive={activeStepId === 5}
              isExporting={isExporting}
              onClick={() => setActiveStepId(5)}
              extraInfo={<p className="text-[11px] text-gray-500">Data klaar voor direct gebruik.</p>}
            />
          </div>

          <TimelineStep 
            number={6} 
            title="Gebruik: PowerBI & AI" 
            owner="End Users"
            icon="fa-robot"
            colorClass="bg-orange-600"
            description="Interactieve rapportages en AI-ondersteuning."
            milestones={["Dashboarding", "AI POC"]}
            isActive={activeStepId === 6}
            isExporting={isExporting}
            onClick={() => setActiveStepId(6)}
            extraInfo={<p className="text-[11px] text-gray-500">Inzet van Agentic AI voor data-interpretatie.</p>}
          />
        </div>

        <div className="lg:col-span-4 h-[calc(100vh-140px)] sticky top-[100px] no-print">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 flex flex-col h-full overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl">
                <i className="fas fa-brain"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">Lestel AI Expert</h3>
                <p className="text-[10px] text-slate-400 font-medium">Live Gemini Flash</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {chatHistory.length === 0 && (
                <div className="text-center py-12 px-4">
                  <i className="fas fa-sparkles text-blue-500 text-3xl mb-4"></i>
                  <h4 className="font-bold text-slate-800">Hoe kan ik helpen?</h4>
                  <p className="text-xs text-slate-500 mt-2">Vraag naar technische details, BIO compliance of de roadmap.</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-4 rounded-3xl text-xs leading-relaxed ${
                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-slate-400 px-4">Architect denkt na...</div>}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Stel een vraag..."
                  className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 text-xs focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                  disabled={isTyping}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isTyping}
                  className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-4 rounded-xl shadow-lg disabled:opacity-50"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
