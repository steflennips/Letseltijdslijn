
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
        <h1 className="text-xl font-bold text-gray-900">Azure & Fabric Architectuur</h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Lestel Domein Migratie (BW -> Azure)</p>
      </div>
    </div>
    <div className="flex gap-4 items-center">
      <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
        NL Compliance OK
      </span>
      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
        <i className="fas fa-download mr-2"></i> Export Plaat
      </button>
    </div>
  </header>
);

const NodeCard: React.FC<{ node: ArchitectureNode; isActive: boolean; onClick: () => void }> = ({ node, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`diagram-node cursor-pointer p-4 rounded-xl border-2 transition-all ${
      isActive ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-white bg-white shadow-sm hover:border-blue-200'
    }`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white ${node.color}`}>
      <i className={`fas ${node.icon}`}></i>
    </div>
    <h3 className="font-bold text-gray-800 text-sm mb-1">{node.label}</h3>
    <p className="text-xs text-gray-500 line-clamp-2">{node.description}</p>
  </div>
);

const ComplianceShield: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
      <i className="fas fa-shield-halved text-blue-600"></i>
      Nederlandse Richtlijnen & Compliance
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.values(ComplianceRule).map((rule) => (
        <div key={rule} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <i className="fas fa-check-circle text-green-500"></i>
          <span className="text-sm font-medium text-gray-700">{rule}</span>
        </div>
      ))}
    </div>
  </div>
);

const AgentFrameworkPanel: React.FC = () => (
  <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-xl mb-8">
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <i className="fas fa-robot text-indigo-300"></i>
          Agentic AI Framework
        </h3>
        <p className="text-indigo-200 text-sm max-w-2xl">
          Conform Microsoft Agent Framework: Integratie van Brain, Memory, Planning en Tools binnen het Fabric Ecosysteem.
        </p>
      </div>
      <div className="bg-indigo-800 px-3 py-1 rounded text-xs font-mono">v1.0.0-preview</div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: 'Brain', icon: 'fa-brain', desc: 'Azure OpenAI (GPT-4o/o1)', color: 'bg-indigo-700' },
        { label: 'Memory', icon: 'fa-database', desc: 'OneLake & Vector DB', color: 'bg-indigo-700' },
        { label: 'Planning', icon: 'fa-route', desc: 'Semantic Kernel / LangGraph', color: 'bg-indigo-700' },
        { label: 'Tools', icon: 'fa-tools', desc: 'Fabric API & Notebooks', color: 'bg-indigo-700' },
      ].map(item => (
        <div key={item.label} className={`${item.color} p-4 rounded-xl border border-indigo-500/30`}>
          <i className={`fas ${item.icon} mb-2 text-indigo-300`}></i>
          <div className="font-bold text-sm">{item.label}</div>
          <div className="text-[10px] text-indigo-200 mt-1 uppercase tracking-tighter">{item.desc}</div>
        </div>
      ))}
    </div>
  </div>
);

const TimelineRoadmap: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
    <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
      <i className="fas fa-clock text-orange-600"></i>
      Migratie Tijdlijn & Team-Flow
    </h3>

    <div className="flex-1 relative">
      {/* Central Vertical Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-100 -ml-0.5 rounded-full hidden md:block"></div>

      <div className="space-y-12 relative z-10">
        
        {/* Phase 1: Initiation */}
        <div className="relative">
          <div className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-0.5 rounded-full hidden md:block">T-0: Start</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Team 1 - Left */}
            <div className="md:pr-8 md:text-right">
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">Team Inventarisatie</span>
                <h4 className="font-bold text-sm text-red-900 mt-1">Legacy Discovery</h4>
                <p className="text-[11px] text-gray-600 mt-1 italic">Inventarisatie van SAP BW InfoCubes & Query logic.</p>
              </div>
            </div>
            {/* Team 2 - Right */}
            <div className="md:pl-8">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Team Modellering</span>
                <h4 className="font-bold text-sm text-blue-900 mt-1">Fabric Blueprint</h4>
                <p className="text-[11px] text-gray-600 mt-1 italic">Opzetten OneLake Medallion architectuur & naamgeving.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2: Deep Dive */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Team 1 - Left */}
            <div className="md:pr-8 md:text-right">
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl shadow-sm">
                <h4 className="font-bold text-sm text-red-900">Data Lineage mapping</h4>
                <p className="text-[11px] text-gray-600 mt-1 italic">Bepalen van 'Sources of Truth' en juridische bewaartermijnen.</p>
              </div>
            </div>
            {/* Team 2 - Right */}
            <div className="md:pl-8">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl shadow-sm">
                <h4 className="font-bold text-sm text-blue-900">Semantic Layer Prep</h4>
                <p className="text-[11px] text-gray-600 mt-1 italic">Design van Direct Lake datasets & dummy Gold models.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Convergence Bar */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t-2 border-purple-200 border-dashed"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-purple-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-3">
              <i className="fas fa-compress-alt animate-pulse"></i>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75">Integratie & Sync</span>
                <span className="text-xs font-bold">Mapping Legacy requirements naar Target Fabric Model</span>
              </div>
              <i className="fas fa-expand-alt animate-pulse"></i>
            </div>
          </div>
        </div>

        {/* Phase 3: Build & Refine (Unified) */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-6 rounded-2xl shadow-sm text-center">
            <div className="flex justify-center gap-3 mb-4">
              <i className="fas fa-industry text-purple-600"></i>
              <i className="fas fa-arrow-right text-gray-300"></i>
              <i className="fas fa-robot text-indigo-600"></i>
              <i className="fas fa-arrow-right text-gray-300"></i>
              <i className="fas fa-chart-pie text-yellow-500"></i>
            </div>
            <h4 className="font-bold text-base text-purple-900 mb-2">Gezamenlijke Oplevering</h4>
            <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
              De inventarisatie van Team 1 wordt geautomatiseerd naar het model van Team 2. 
              Gezamenlijk richten zij de <strong>Agentic AI</strong> laag in op verrijkte data en valideren zij de <strong>Power BI</strong> rapportages tegen de BIO-richtlijnen.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="px-2 py-1 bg-white border border-purple-200 text-[10px] rounded-lg font-bold text-purple-700">Sprint 1: Landing</span>
              <span className="px-2 py-1 bg-white border border-purple-200 text-[10px] rounded-lg font-bold text-purple-700">Sprint 2: Science</span>
              <span className="px-2 py-1 bg-white border border-purple-200 text-[10px] rounded-lg font-bold text-purple-700">Sprint 3: AI Agents</span>
            </div>
          </div>
        </div>

      </div>
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
    { id: 'sap-bw', label: 'Legacy SAP BW', category: 'Source', description: 'De huidige bron die we migreren naar de cloud.', icon: 'fa-server', color: 'bg-red-500' },
    { id: 'fabric-df', label: 'Data Factory', category: 'Ingestion', description: 'Pipeline orkestratie voor SAP BW extractie via SHIR.', icon: 'fa-industry', color: 'bg-orange-500' },
    { id: 'fabric-onelake', label: 'OneLake (Medallion)', category: 'Storage', description: 'De "OneDrive for Data". Bronze, Silver en Gold lagen.', icon: 'fa-cloud', color: 'bg-blue-600' },
    { id: 'fabric-notebooks', label: 'Data Science', category: 'Processing', description: 'Spark Notebooks voor ML modellen en Geavanceerde Analytics.', icon: 'fa-vials', color: 'bg-purple-500' },
    { id: 'fabric-warehouse', label: 'SQL Warehouse', category: 'Serving', description: 'De analytische laag waar data analisten direct queryen.', icon: 'fa-table', color: 'bg-cyan-500' },
    { id: 'powerbi', label: 'Power BI / Direct Lake', category: 'Serving', description: 'Real-time rapportages direct op de Gold laag.', icon: 'fa-chart-pie', color: 'bg-yellow-500' },
    { id: 'agentic-ai', label: 'Agentic AI Layer', category: 'AI', description: 'Smart agents die tools aanroepen en data verwerken.', icon: 'fa-robot', color: 'bg-indigo-600' },
    { id: 'purview', label: 'MS Purview', category: 'Governance', description: 'Data catalogus, lineage en compliance beheer.', icon: 'fa-search', color: 'bg-teal-500' },
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
          systemInstruction: `Je bent een Senior Azure & Microsoft Fabric Architect gespecialiseerd in het "Lestel" (Juridisch/Wettelijk) domein. 
          De gebruiker werkt met een parallelle tijdlijn:
          - Team 1: Inventarisatie SAP BW (Legacy focus).
          - Team 2: Modellering Fabric Target (Cloud native focus).
          
          Focus op de tijdlijn:
          1. Hoe de teams synchroon kunnen lopen.
          2. Waarom de samenkomst (Convergence) cruciaal is voor de Gold laag.
          3. Hoe Agentic AI pas echt waarde toevoegt nadat de data gemodelleerd is.
          4. De rol van BIO en AVG tijdens de gehele tijdlijn.
          
          Antwoord in het Nederlands en verwijs naar de visuele tijdlijn op de plaat.`,
        },
      });

      const aiText = response.text || "Sorry, ik kon geen antwoord genereren.";
      setChatHistory(prev => [...prev, { role: 'model', content: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', content: "Er is een fout opgetreden bij het contacten van de architect-AI." }]);
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
          
          <AgentFrameworkPanel />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <i className="fas fa-sitemap text-blue-600"></i>
              Data Estate Visualisatie
            </h3>
            
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0 rounded-full hidden md:block"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Bronnen</div>
                  {nodes.filter(n => n.category === 'Source').map(node => (
                    <NodeCard key={node.id} node={node} isActive={activeNodeId === node.id} onClick={() => setActiveNodeId(node.id)} />
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Fabric Core</div>
                  {nodes.filter(n => ['Ingestion', 'Storage'].includes(n.category)).map(node => (
                    <NodeCard key={node.id} node={node} isActive={activeNodeId === node.id} onClick={() => setActiveNodeId(node.id)} />
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Compute & AI</div>
                  {nodes.filter(n => ['Processing', 'AI'].includes(n.category)).map(node => (
                    <NodeCard key={node.id} node={node} isActive={activeNodeId === node.id} onClick={() => setActiveNodeId(node.id)} />
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Output & Governance</div>
                  {nodes.filter(n => ['Serving', 'Governance'].includes(n.category)).map(node => (
                    <NodeCard key={node.id} node={node} isActive={activeNodeId === node.id} onClick={() => setActiveNodeId(node.id)} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <i className={`fas ${activeNode?.icon} text-blue-600`}></i>
                  Focus: {activeNode?.label}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {activeNode?.description} Dit component wordt door de twee teams vanuit verschillende invalshoeken benaderd in de tijdlijn.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs border-b pb-2">
                    <span className="text-gray-500 uppercase">Team 1 Inzet</span>
                    <span className="font-semibold">Contextualisering & Lineage</span>
                  </div>
                  <div className="flex justify-between text-xs border-b pb-2">
                    <span className="text-gray-500 uppercase">Team 2 Inzet</span>
                    <span className="font-semibold">Technisch Design & Schema</span>
                  </div>
                </div>
              </div>
              <ComplianceShield />
            </div>
            <TimelineRoadmap />
          </div>
        </div>

        {/* Right Side: AI Architect Chat */}
        <div className="lg:col-span-4 flex flex-col h-[calc(100vh-140px)]">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-gray-900 text-white flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <i className="fas fa-magic"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">Architect Assistent</h3>
                <p className="text-[10px] text-gray-400">Tijdlijn & Teamadvies</p>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
            >
              {chatHistory.length === 0 && (
                <div className="text-center py-10">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <i className="fas fa-history text-blue-400"></i>
                  </div>
                  <p className="text-gray-500 text-sm px-6">
                    Hoi! Ik help bij de synchronisatie van de tijdlijn. Vraag me bijvoorbeeld: <br/>
                    <em className="text-xs block mt-2 text-blue-600">"Wanneer in de tijdlijn moeten de teams voor het eerst bij elkaar komen?"</em>
                  </p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Vraag advies over de tijdlijn..."
                  className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors w-10 h-10 flex items-center justify-center"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">Powered by Gemini 3.0 Pro & Azure AI Services</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="md:hidden bg-white border-t border-gray-200 p-4 sticky bottom-0 flex justify-around">
        <i className="fas fa-home text-blue-600"></i>
        <i className="fas fa-chart-line text-gray-400"></i>
        <i className="fas fa-cog text-gray-400"></i>
      </footer>
    </div>
  );
}
