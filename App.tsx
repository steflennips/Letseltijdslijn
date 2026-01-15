
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArchitectureNode, ChatMessage, ComplianceRule } from './types';
import { GoogleGenAI } from "@google/genai";

// --- Components ---

const Header: React.FC = () => (
  <header className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
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
        <span className="text-[10px] text-gray-400 font-medium">Data Residency: NL West</span>
      </div>
      <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-100 flex items-center gap-2">
        <i className="fas fa-file-export"></i> Export Plaat
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
}> = ({ number, title, description, owner, colorClass, icon, milestones }) => (
  <div className={`relative p-6 rounded-[2rem] border-2 bg-white ${colorClass.split(' ')[0]} shadow-sm hover:shadow-md transition-all`}>
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${colorClass.split(' ')[1]}`}>
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Stap {number}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-[10px] font-bold text-gray-500 uppercase">{owner}</span>
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
      </div>
    </div>
  </div>
);

const SevenStepTimeline: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. BW Bronnen */}
      <TimelineStep 
        number={1} 
        title="BW Bronnen - Analyse" 
        owner="Technisch team"
        icon="fa-search"
        colorClass="border-blue-100 bg-blue-600"
        description="Alle bestaande BW-bronnen worden in kaart gebracht. Analyse van technische structuur en businesslogica om kwaliteit, volledigheid en geschiktheid te bepalen."
        milestones={["Data mapping", "Structuur inzicht", "Kwaliteitschecks"]}
      />
      {/* 2. Ontsluiten */}
      <TimelineStep 
        number={2} 
        title="Ontsluiten naar Azure" 
        owner="Cloud Engineering"
        icon="fa-cloud-arrow-up"
        colorClass="border-blue-100 bg-blue-600"
        description="Data uit BW toegankelijk maken in Azure (Fabric/OneLake). Focus op veilig en efficiënt overbrengen voor verdere modellering."
        milestones={["Rechtenbeheer", "Technische ontsluiting", "Data tracking"]}
      />
    </div>

    {/* 3. Modellering */}
    <TimelineStep 
      number={3} 
      title="Data Modellering op Azure" 
      owner="Data engineers bouwen, wij ontwerpen"
      icon="fa-sitemap"
      colorClass="border-green-100 bg-green-600"
      description="Domeingerichte modellen maken, zoals Data Marts. Gezamenlijk ontwerp waarbij data engineers de modellen technisch bouwen in de golden layer voorbereiding."
      milestones={["Datakwaliteit", "Standaardisatie", "Mapping brondata"]}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 4. Bouwen Golden Layer (Technisch proces nu eerst) */}
      <TimelineStep 
        number={4} 
        title="Bouwen van de Golden Layer" 
        owner="Data engineers"
        icon="fa-industry"
        colorClass="border-yellow-100 bg-yellow-500"
        description="Gestructureerde ETL-processen/pipelines in Fabric of Synapse die data uit de gemodelleerde laag transformeren naar een consistente eindlaag."
        milestones={["Governance", "Datakwaliteit", "Monitoring & Logging"]}
      />
      {/* 5. Golden Layer Definitie (Resultaat nu stap 5) */}
      <TimelineStep 
        number={5} 
        title="Golden Layer - Definitieve Dataset" 
        owner="Allen betrokken"
        icon="fa-trophy"
        colorClass="border-yellow-100 bg-yellow-500"
        description="De gezuiverde, beheerde eindlaag. Het eindpunt van modellering en het vertrekpunt voor alle analyses, PowerBI en AI-agents."
        milestones={["Governance", "Versiebeheer", "Traceerbaarheid"]}
      />
    </div>

    {/* 6. Gebruik */}
    <TimelineStep 
      number={6} 
      title="Gebruik: PowerBI & Agentic AI" 
      owner="BI-team / AI-team"
      icon="fa-robot"
      colorClass="border-orange-100 bg-orange-600"
      description="PowerBI voor visualisaties en Agentic AI voor exploratory analysis en geautomatiseerde beslissingen. POC's voor AI verkenning."
      milestones={["Feedback loops", "AI-keuzes", "Dataverrijking"]}
    />

    {/* 7. Koppelmomenten Overlay */}
    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <i className="fas fa-shield-halved text-[100px]"></i>
      </div>
      <div className="relative z-10">
        <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <i className="fas fa-link text-indigo-400"></i> Stap 7: Koppelmomenten & Overlays
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Data Mapping', icon: 'fa-map-signs' },
            { label: 'Rechtenbeheer', icon: 'fa-user-shield' },
            { label: 'Datakwaliteit', icon: 'fa-vial-circle-check' },
            { label: 'Governance & Security', icon: 'fa-fingerprint' }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
              <i className={`fas ${item.icon} mb-2 text-indigo-400`}></i>
              <span className="text-[10px] font-bold uppercase">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-400 italic">Deze transversale aspecten waarborgen de integriteit van het gehele proces van BW naar AI.</p>
      </div>
    </div>
  </div>
);

const ComplianceDashboard: React.FC = () => (
  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <i className="fas fa-shield-alt text-green-600"></i>
      Lestel Compliance Status
    </h4>
    <div className="space-y-3">
      {[
        { rule: ComplianceRule.BIO, icon: 'fa-building-columns' },
        { rule: ComplianceRule.AVG, icon: 'fa-user-lock' },
        { rule: ComplianceRule.DATA_RESIDENCY, icon: 'fa-map-location-dot' },
        { rule: ComplianceRule.PURVIEW, icon: 'fa-eye' }
      ].map((item) => (
        <div key={item.rule} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-3">
            <i className={`fas ${item.icon} text-gray-400 text-xs`}></i>
            <span className="text-[10px] font-bold text-gray-700">{item.rule}</span>
          </div>
          <span className="text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase">Active</span>
        </div>
      ))}
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>('fabric-onelake');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const nodes: ArchitectureNode[] = [
    { id: 'sap-bw', label: 'BW Sources', category: 'Source', description: 'Basis voor analyse en inventarisatie.', icon: 'fa-database', color: 'bg-blue-600' },
    { id: 'fabric-df', label: 'Ontsluiting', category: 'Ingestion', description: 'Verplaatsen van data naar Azure.', icon: 'fa-shuffle', color: 'bg-blue-600' },
    { id: 'fabric-onelake', label: 'Lakehouse', category: 'Storage', description: 'Data Landing & Storage.', icon: 'fa-cloud', color: 'bg-blue-400' },
    { id: 'fabric-modeling', label: 'Modellering', category: 'Processing', description: 'Opzet van Data Marts.', icon: 'fa-sitemap', color: 'bg-green-600' },
    { id: 'golden-layer-process', label: 'Bouw Proces', category: 'Processing', description: 'ETL Pipelines voor de Golden Layer.', icon: 'fa-gears', color: 'bg-yellow-600' },
    { id: 'golden-layer', label: 'Golden Layer', category: 'Serving', description: 'De definitieve dataset.', icon: 'fa-star', color: 'bg-yellow-500' },
    { id: 'powerbi', label: 'Power BI', category: 'Serving', description: 'Rapporten & Visualisaties.', icon: 'fa-chart-pie', color: 'bg-orange-500' },
    { id: 'agentic-ai', label: 'Agentic AI', category: 'AI', description: 'Automatisering & POCs.', icon: 'fa-robot', color: 'bg-orange-600' },
  ];

  const activeNode = nodes.find(n => n.id === activeNodeId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...chatHistory, userMsg].map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `Je bent een Senior Azure & Fabric Architect. 
          Help de gebruiker met de 7-stappen strategie voor het Lestel domein:
          1. BW Analyse (Blauw)
          2. Ontsluiten naar Azure (Blauw)
          3. Modellering (Groen)
          4. Bouwen van de Golden Layer (Geel) - ETL/Pipelines
          5. Golden Layer Definitieve Dataset (Geel) - Resultaat
          6. Gebruik in PowerBI & Agentic AI (Oranje)
          7. Koppelmomenten (Governance/Security/Kwaliteit)
          
          Focus op het feit dat Stap 4 het proces is en Stap 5 het resultaat.`,
        },
      });

      const aiText = response.text || "Sorry, de architect kon geen antwoord genereren.";
      setChatHistory(prev => [...prev, { role: 'model', content: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', content: "Fout bij communicatie met AI." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full">
        {/* Left Side: Timeline and Specs */}
        <div className="lg:col-span-8 space-y-8">
          
          <SevenStepTimeline />

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Architectuur Componenten</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
              {nodes.map(node => (
                <NodeCard key={node.id} node={node} isActive={activeNodeId === node.id} onClick={() => setActiveNodeId(node.id)} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-tight text-sm">
                  <i className={`fas ${activeNode?.icon} text-blue-600`}></i>
                  Focus: {activeNode?.label}
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed mb-6">
                  {activeNode?.description} In de transitie van BW naar Azure is dit een essentieel onderdeel van het Lestel domein ecosysteem.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-50 text-[9px] font-bold rounded-lg text-blue-700 uppercase">Audit Proof</span>
                <span className="px-2 py-1 bg-green-50 text-[9px] font-bold rounded-lg text-green-700 uppercase">Scalable</span>
              </div>
            </div>
            <ComplianceDashboard />
          </div>
        </div>

        {/* Right Side: AI Assistant */}
        <div className="lg:col-span-4 h-[calc(100vh-140px)] sticky top-[100px]">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 flex flex-col h-full overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl">
                <i className="fas fa-brain"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">Architect Assistent</h3>
                <p className="text-[10px] text-slate-400 font-medium">Lestel Domein Orchestrator</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {chatHistory.length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="bg-white w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                    <i className="fas fa-route text-blue-500 text-xl"></i>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">Hulp bij de 7 stappen?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Stel vragen over het bouwproces van de Golden Layer (Stap 4) of de definitieve ontsluiting (Stap 5).
                  </p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-xs leading-relaxed ${
                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-gray-400 animate-pulse flex gap-1 p-4"><i className="fas fa-circle text-[4px] mt-1.5"></i> AI denkt na...</div>}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Vraag advies over een stap..."
                  className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 text-xs focus:ring-2 focus:ring-blue-500 outline-none pr-12 shadow-inner"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isTyping}
                  className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-4 rounded-xl shadow-lg disabled:opacity-50 transition-all active:scale-95"
                >
                  <i className="fas fa-bolt"></i>
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 mt-4 font-black uppercase tracking-tighter">Powered by Gemini & Fabric AI</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
