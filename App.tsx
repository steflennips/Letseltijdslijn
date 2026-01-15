
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArchitectureNode, ChatMessage, ComplianceRule } from './types';
import { GoogleGenAI } from "@google/genai";

// --- Components ---

const Header: React.FC = () => (
  <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 p-2 rounded-lg text-white">
        <i className="fas fa-project-diagram text-xl"></i>
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lestel Domein: BW naar Fabric</h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Migratie Tijdlijn & Task-Board</p>
      </div>
    </div>
    <div className="flex gap-4 items-center">
      <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
        NL Compliance Check OK
      </span>
      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
        <i className="fas fa-download mr-2"></i> Export Tijdlijn
      </button>
    </div>
  </header>
);

const NodeCard: React.FC<{ node: ArchitectureNode; isActive: boolean; onClick: () => void }> = ({ node, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`diagram-node cursor-pointer p-3 rounded-xl border-2 transition-all ${
      isActive ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-white bg-white shadow-sm hover:border-blue-200'
    }`}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 text-white text-xs ${node.color}`}>
      <i className={`fas ${node.icon}`}></i>
    </div>
    <h3 className="font-bold text-gray-800 text-[11px] mb-0.5">{node.label}</h3>
  </div>
);

const TaskList: React.FC<{ tasks: string[]; color: string }> = ({ tasks, color }) => (
  <ul className="mt-2 space-y-1.5">
    {tasks.map((task, i) => (
      <li key={i} className="flex items-start gap-2 text-[10px] text-gray-600 leading-tight">
        <i className={`fas fa-check-circle mt-0.5 ${color}`}></i>
        <span>{task}</span>
      </li>
    ))}
  </ul>
);

const UnifiedTimeline: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-4">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <i className="fas fa-route text-blue-600"></i>
          Migratie Tijdlijn & Team Taken
        </h3>
        <p className="text-xs text-gray-500">Chronologisch overzicht van acties voor beide teams</p>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-[10px] font-bold text-red-600">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span> TEAM INVENTARISATIE
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span> TEAM MODELLERING
        </div>
      </div>
    </div>

    <div className="relative">
      {/* Central Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-100 -ml-0.25 hidden md:block"></div>

      <div className="space-y-16">
        
        {/* Phase 1: Voorbereiding */}
        <div className="relative">
          <div className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-gray-800 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter z-10 hidden md:block">Fase 1: Discovery</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl relative">
              <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-2">
                <i className="fas fa-search"></i> Inventarisatie Taken
              </h4>
              <TaskList color="text-red-500" tasks={[
                "Listing InfoCubes & DSO's binnen Lestel domein",
                "Extractie van huidige ABAP/Query logica",
                "Identificatie van brondata eigenaars"
              ]} />
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
              <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                <i className="fas fa-layer-group"></i> Modellering Taken
              </h4>
              <TaskList color="text-blue-500" tasks={[
                "Inrichting Fabric Landing Zone (OneLake)",
                "Configuratie Workspace Security (BIO richtlijn)",
                "Drafting Medallion Schema (Bronze/Silver)"
              ]} />
            </div>
          </div>
        </div>

        {/* Phase 2: Design & Deep Dive */}
        <div className="relative">
          <div className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-gray-400 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter z-10 hidden md:block">Fase 2: Design</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl">
              <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-2">
                <i className="fas fa-file-signature"></i> Compliance & Lineage
              </h4>
              <TaskList color="text-red-500" tasks={[
                "Documentatie data-lineage voor Purview",
                "Check AVG/GDPR bewaartermijnen per object",
                "Functionele validatie requirements"
              ]} />
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
              <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                <i className="fas fa-vials"></i> Data Science & AI Ready
              </h4>
              <TaskList color="text-blue-500" tasks={[
                "Ontwerp Gold Layer Star Schema's",
                "Setup Spark Notebooks voor ML modellen",
                "Voorbereiding Vector Search indexen"
              ]} />
            </div>
          </div>
        </div>

        {/* Convergence: De Sync */}
        <div className="relative flex justify-center">
          <div className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 p-[2px] rounded-2xl shadow-xl">
            <div className="bg-white px-8 py-4 rounded-[14px] text-center max-w-md">
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1 italic">Samenkomstpunt</h4>
              <p className="text-[11px] text-gray-600 leading-tight">
                <strong>Het Mapping Moment:</strong> De legacy logica van Team 1 wordt gematcht met het technische target model van Team 2. 
                Vanaf hier wordt de data daadwerkelijk 'geladen'.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 3: Build & Agentic Implementation */}
        <div className="relative">
          <div className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-indigo-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter z-10 hidden md:block">Fase 3: Implementation</div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 border-r border-indigo-100 pr-4">
                <h5 className="text-[11px] font-bold text-indigo-900 mb-2 uppercase">Integratie & Data</h5>
                <TaskList color="text-indigo-600" tasks={[
                  "Deployment Fabric Pipelines (BW Data)",
                  "Validatie Bronze naar Gold flow",
                  "Lineage koppeling in Purview"
                ]} />
              </div>
              <div className="col-span-1 border-r border-indigo-100 pr-4">
                <h5 className="text-[11px] font-bold text-indigo-900 mb-2 uppercase">Agentic AI (Target)</h5>
                <TaskList color="text-indigo-600" tasks={[
                  "Configuratie 'Brain' (GPT-4o)",
                  "Koppeling Agent Tools aan Fabric SQL",
                  "Testen Planning & Orchestration"
                ]} />
              </div>
              <div className="col-span-1">
                <h5 className="text-[11px] font-bold text-indigo-900 mb-2 uppercase">Reporting & DS</h5>
                <TaskList color="text-indigo-600" tasks={[
                  "Power BI Direct Lake koppeling",
                  "Vrijgave voor Data Analisten",
                  "Monitorering Model Accuracy"
                ]} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
);

// --- Fix: Added missing ComplianceShield component ---
const ComplianceShield: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <i className="fas fa-shield-alt text-green-600"></i>
      Compliance Dashboard
    </h4>
    <div className="space-y-3">
      {Object.values(ComplianceRule).map((rule) => (
        <div key={rule} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-green-500 text-[10px]"></i>
            <span className="text-[10px] font-medium text-gray-700">{rule}</span>
          </div>
          <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Active</span>
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
    { id: 'sap-bw', label: 'Legacy BW', category: 'Source', description: 'De huidige bron die we migreren naar de cloud.', icon: 'fa-server', color: 'bg-red-500' },
    { id: 'fabric-df', label: 'Data Factory', category: 'Ingestion', description: 'Pipeline orkestratie for SAP BW extractie via SHIR.', icon: 'fa-industry', color: 'bg-orange-500' },
    { id: 'fabric-onelake', label: 'OneLake', category: 'Storage', description: 'De "OneDrive for Data". Bronze, Silver en Gold lagen.', icon: 'fa-cloud', color: 'bg-blue-600' },
    { id: 'fabric-notebooks', label: 'Data Science', category: 'Processing', description: 'Spark Notebooks for ML modellen.', icon: 'fa-vials', color: 'bg-purple-500' },
    { id: 'fabric-warehouse', label: 'SQL Warehouse', category: 'Serving', description: 'Analytische laag for SQL queries.', icon: 'fa-table', color: 'bg-cyan-500' },
    { id: 'powerbi', label: 'Power BI', category: 'Serving', description: 'Direct Lake rapportages.', icon: 'fa-chart-pie', color: 'bg-yellow-500' },
    { id: 'agentic-ai', label: 'Agentic AI', category: 'AI', description: 'Smart agents die tools aanroepen.', icon: 'fa-robot', color: 'bg-indigo-600' },
    { id: 'purview', label: 'Purview', category: 'Governance', description: 'Data catalogus & Lineage.', icon: 'fa-search', color: 'bg-teal-500' },
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
      // Create a new instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...chatHistory, userMsg].map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `Je bent een Senior Azure & Fabric Architect. 
          Focus op de specifieke taken in de tijdlijn:
          - Team 1 (Inventarisatie) doet het legacy speurwerk.
          - Team 2 (Modellering) bouwt het nieuwe huis.
          - In Fase 3 komen Agentic AI en Data Science samen op de Gold laag.
          Help de gebruiker bepalen wat de prioriteiten zijn binnen deze takenlijst.`,
        },
      });

      const aiText = response.text || "Sorry, ik kon geen antwoord genereren.";
      setChatHistory(prev => [...prev, { role: 'model', content: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', content: "Er is een fout opgetreden." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Visualization and Details */}
        <div className="lg:col-span-8 space-y-6">
          
          <UnifiedTimeline />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Architectuur Componenten</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {nodes.map(node => (
                <NodeCard key={node.id} node={node} isActive={activeNodeId === node.id} onClick={() => setActiveNodeId(node.id)} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <i className={`fas ${activeNode?.icon} text-blue-600`}></i>
                  Focus: {activeNode?.label}
                </h4>
                <p className="text-gray-600 text-[11px] leading-relaxed mb-4">
                  {activeNode?.description} In de huidige fase van de tijdlijn is dit component cruciaal for de overdracht van Team 1 naar Team 2.
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500 uppercase font-bold">BIO Compliance</span>
                  <span className="text-green-600 font-bold">VERIFIED</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500 uppercase font-bold">Data Residency</span>
                  <span className="text-blue-600 font-bold">NL WEST</span>
                </div>
              </div>
            </div>
            <ComplianceShield />
          </div>
        </div>

        {/* Right Side: Chat Assistant */}
        <div className="lg:col-span-4 flex flex-col h-[calc(100vh-140px)]">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-gray-900 text-white flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <i className="fas fa-microchip"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">Task Orchestrator AI</h3>
                <p className="text-[10px] text-gray-400">Vraag advies over specifieke taken</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {chatHistory.length === 0 && (
                <div className="text-center py-10">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <i className="fas fa-tasks text-blue-400"></i>
                  </div>
                  <p className="text-gray-500 text-[11px] px-6">
                    Ik help bij de taakverdeling tussen de teams. Vraag me bijvoorbeeld: <br/>
                    <em className="text-[10px] block mt-2 text-blue-600">"Welke BW objecten moet Team 1 als eerste inventariseren for Power BI?"</em>
                  </p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-gray-400 animate-pulse">AI is aan het nadenken...</div>}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Vraag over de takenlijst..."
                  className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button onClick={handleSendMessage} disabled={!userInput.trim() || isTyping} className="bg-blue-600 text-white p-2 rounded-xl w-10 h-10 flex items-center justify-center shadow-lg shadow-blue-200 active:scale-95 transition-transform">
                  <i className="fas fa-bolt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
