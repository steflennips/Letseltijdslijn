
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
  extraInfo: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ number, title, description, owner, colorClass, icon, milestones, extraInfo, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer overflow-hidden ${
      isActive 
        ? `bg-white ${colorClass.split(' ')[0].replace('border-', 'ring-4 ring-')} scale-[1.02] shadow-xl z-20` 
        : `bg-white ${colorClass.split(' ')[0]} shadow-sm hover:shadow-md z-10`
    }`}
  >
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${colorClass.split(' ')[1]}`}>
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Stap {number}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase">{owner}</span>
          </div>
          <i className={`fas ${isActive ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px] opacity-40`}></i>
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

        {/* Extra Information Section */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isActive ? 'max-h-[500px] mt-6 pt-6 border-t border-gray-100 opacity-100' : 'max-h-0 opacity-0'}`}>
          {extraInfo}
        </div>
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
  const [activeStepId, setActiveStepId] = useState<number | null>(1);
  const [activeNodeId, setActiveNodeId] = useState<string | null>('sap-bw');
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
          Help de gebruiker met de 7-stappen strategie voor het Lestel domein.
          Stel specifiek vragen over de context van de huidige actieve stap in de visualisatie (Stap ${activeStepId}).`,
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

  const handleStepClick = (stepId: number) => {
    setActiveStepId(activeStepId === stepId ? null : stepId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full">
        {/* Left Side: Timeline and Specs */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. BW Bronnen */}
              <TimelineStep 
                number={1} 
                title="BW Bronnen - Analyse" 
                owner="Technisch team"
                icon="fa-search"
                colorClass="border-blue-100 bg-blue-600"
                description="Alle bestaande BW-bronnen worden in kaart gebracht. Analyse van technische structuur en businesslogica."
                milestones={["Data mapping", "Structuur inzicht", "Kwaliteitschecks"]}
                isActive={activeStepId === 1}
                onClick={() => handleStepClick(1)}
                extraInfo={
                  <div className="space-y-3">
                    <p className="text-[11px] text-gray-500 leading-relaxed italic border-l-2 border-blue-200 pl-3">
                      Het team voert een "Readiness Assessment" uit. We kijken specifiek naar InfoCubes en DSO's binnen het Lestel domein die juridische bewaartermijnen bevatten.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <span className="text-[9px] font-black block mb-1">Legacy ABAP Scan</span>
                        <p className="text-[10px] text-gray-600">Complexiteits-analyse van bestaande transformatie-logica.</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <span className="text-[9px] font-black block mb-1">Metadata Discovery</span>
                        <p className="text-[10px] text-gray-600">Mapping van technisch veld naar business-concept.</p>
                      </div>
                    </div>
                  </div>
                }
              />
              {/* 2. Ontsluiten */}
              <TimelineStep 
                number={2} 
                title="Ontsluiten naar Azure" 
                owner="Cloud Engineering"
                icon="fa-cloud-arrow-up"
                colorClass="border-blue-100 bg-blue-600"
                description="Data uit BW toegankelijk maken in Azure. Veilig en efficiënt overbrengen naar OneLake."
                milestones={["Rechtenbeheer", "Technische ontsluiting", "Data tracking"]}
                isActive={activeStepId === 2}
                onClick={() => handleStepClick(2)}
                extraInfo={
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <h5 className="text-[10px] font-black mb-2 uppercase">Ontsluitings-strategie</h5>
                      <ul className="text-[10px] text-gray-600 space-y-1">
                        <li>• Gebruik van SAP CDC connectors voor real-time sync.</li>
                        <li>• OneLake "Shortcuts" voor hybride ontsluiting.</li>
                        <li>• Azure Data Factory pipelines voor bulk-historie.</li>
                      </ul>
                    </div>
                    <p className="text-[10px] text-gray-400">Security: Integratie met Azure Private Links voor een gesloten netwerkverbinding.</p>
                  </div>
                }
              />
            </div>

            {/* 3. Modellering */}
            <TimelineStep 
              number={3} 
              title="Data Modellering op Azure" 
              owner="Engineers & Architecten"
              icon="fa-sitemap"
              colorClass="border-green-100 bg-green-600"
              description="Domeingerichte modellen maken, zoals Data Marts. Gezamenlijk ontwerp in de Silver layer."
              milestones={["Datakwaliteit", "Standaardisatie", "Mapping brondata"]}
              isActive={activeStepId === 3}
              onClick={() => handleStepClick(3)}
              extraInfo={
                <div className="flex gap-4 items-center">
                  <div className="flex-1 bg-green-50 p-4 rounded-2xl border border-green-100">
                    <h5 className="text-[10px] font-black mb-2 uppercase text-green-800">Medallion Architectuur</h5>
                    <p className="text-[10px] text-green-700 leading-relaxed">
                      Hier vindt de transformatie plaats van de ruwe 'Bronze' data naar de opgeschoonde 'Silver' data. We passen uniforme business-regels toe die specifiek zijn voor het Lestel domein (bijv. berekening van doorlooptijden).
                    </p>
                  </div>
                  <div className="w-24 h-24 bg-white rounded-xl border-2 border-dashed border-green-200 flex items-center justify-center">
                     <i className="fas fa-layer-group text-green-300 text-3xl"></i>
                  </div>
                </div>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 4. Bouwen Golden Layer */}
              <TimelineStep 
                number={4} 
                title="Bouwen van de Golden Layer" 
                owner="Data engineers"
                icon="fa-industry"
                colorClass="border-yellow-100 bg-yellow-500"
                description="Gestructureerde ETL-processen/pipelines in Fabric. Transformatie naar een consistente eindlaag."
                milestones={["Governance", "Datakwaliteit", "Monitoring & Logging"]}
                isActive={activeStepId === 4}
                onClick={() => handleStepClick(4)}
                extraInfo={
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                       <span className="text-[9px] font-bold text-yellow-700 uppercase">Productie-omgeving</span>
                    </div>
                    <p className="text-[10px] text-gray-600 italic">"Pipelines worden zo ingericht dat elke verwerking volledig traceerbaar is (auditing)."</p>
                    <div className="bg-yellow-50/50 p-2 rounded-lg border border-yellow-100">
                      <span className="text-[9px] font-black block">Fabric Notebooks</span>
                      <p className="text-[10px] text-gray-500">Spark-gebaseerde verwerking voor maximale schaalbaarheid.</p>
                    </div>
                  </div>
                }
              />
              {/* 5. Golden Layer Definitie */}
              <TimelineStep 
                number={5} 
                title="Golden Layer - Definitieve Dataset" 
                owner="Allen betrokken"
                icon="fa-trophy"
                colorClass="border-yellow-100 bg-yellow-500"
                description="De gezuiverde, beheerde eindlaag. Het vertrekpunt voor alle analyses en AI."
                milestones={["Governance", "Versiebeheer", "Traceerbaarheid"]}
                isActive={activeStepId === 5}
                onClick={() => handleStepClick(5)}
                extraInfo={
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black uppercase text-yellow-800">Consumer Interface</h5>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-center border border-yellow-100">
                        <i className="fas fa-table text-yellow-600 mb-1 text-[10px]"></i>
                        <span className="text-[8px] font-bold block">SQL Endpoints</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg shadow-sm text-center border border-yellow-100">
                        <i className="fas fa-database text-yellow-600 mb-1 text-[10px]"></i>
                        <span className="text-[8px] font-bold block">Delta Lake</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg shadow-sm text-center border border-yellow-100">
                        <i className="fas fa-vial text-yellow-600 mb-1 text-[10px]"></i>
                        <span className="text-[8px] font-bold block">OneLake</span>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>

            {/* 6. Gebruik */}
            <TimelineStep 
              number={6} 
              title="Gebruik: PowerBI & Agentic AI" 
              owner="BI-team / AI-team"
              icon="fa-robot"
              colorClass="border-orange-100 bg-orange-600"
              description="Rapportages en exploratory analysis. Agentic AI voor geautomatiseerde beslissingen."
              milestones={["Feedback loops", "AI-keuzes", "Dataverrijking"]}
              isActive={activeStepId === 6}
              onClick={() => handleStepClick(6)}
              extraInfo={
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-4">
                  <div className="flex justify-between items-center border-b border-orange-200 pb-2">
                    <h5 className="text-[10px] font-black text-orange-900 uppercase">Agentic AI Framework</h5>
                    <span className="text-[8px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Microsoft Framework</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-orange-800 uppercase flex items-center gap-1">
                        <i className="fas fa-brain"></i> The Brain
                      </span>
                      <p className="text-[10px] text-gray-600">OpenAI o1-mini model voor redeneren over juridische data.</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-orange-800 uppercase flex items-center gap-1">
                        <i className="fas fa-memory"></i> Memory
                      </span>
                      <p className="text-[10px] text-gray-600">Vector Search indexen op de Golden Layer data.</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-orange-700 italic">"Power BI dashboards tonen de real-time status, terwijl de AI-agenten pro-actief afwijkingen signaleren."</p>
                </div>
              }
            />

            {/* 7. Koppelmomenten Overlay */}
            <div 
              onClick={() => handleStepClick(7)}
              className={`bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden transition-all cursor-pointer ${activeStepId === 7 ? 'scale-[1.02] ring-4 ring-indigo-500' : ''}`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <i className="fas fa-shield-halved text-[100px]"></i>
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-link text-indigo-400"></i> Stap 7: Koppelmomenten & Overlays
                  </h4>
                  <i className={`fas ${activeStepId === 7 ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px] opacity-40`}></i>
                </div>
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
                
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${activeStepId === 7 ? 'max-h-[300px] mt-8 pt-6 border-t border-white/10 opacity-100' : 'max-h-0 opacity-0'}`}>
                   <h5 className="text-[11px] font-black text-indigo-300 mb-3 uppercase tracking-widest">Detail-overzicht Governance</h5>
                   <p className="text-xs text-slate-300 leading-relaxed mb-4">
                     Governance is niet een stap achteraf, maar een continu proces. We implementeren <strong>Microsoft Purview</strong> over de gehele keten om <em>end-to-end lineage</em> te garanderen van SAP BW tot aan de AI-output.
                   </p>
                   <div className="flex gap-4">
                      <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] font-black block mb-1 uppercase">Auditing</span>
                        <p className="text-[10px] text-slate-400">Elke toegang tot de Golden Layer wordt gelogd conform de BIO-richtlijnen.</p>
                      </div>
                      <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] font-black block mb-1 uppercase">SLA Monitoring</span>
                        <p className="text-[10px] text-slate-400">Real-time dashboards over data-versheid en pipeline performance.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Interactieve Componenten</h3>
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
                  {activeNode?.description} Dit component speelt een cruciale rol in het Lestel domein, met name in Stap {activeStepId || '...'}.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-50 text-[9px] font-bold rounded-lg text-blue-700 uppercase">Lestel Proof</span>
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
                  <h4 className="font-bold text-slate-800 mb-2">Hulp bij Stap {activeStepId}?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Je hebt nu {activeStepId ? `Stap ${activeStepId}` : 'geen stap'} geselecteerd. Stel me een vraag over de specifieke koppelmomenten of implementatie-details.
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
                  placeholder="Vraag advies over deze stap..."
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
