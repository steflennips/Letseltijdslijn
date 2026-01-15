
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArchitectureNode, ChatMessage, KnowledgeDoc } from './types';
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
        <span className="text-[10px] text-gray-400 font-medium">Gemini 3 Pro Architecture AI</span>
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
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  
  // Knowledge Base State
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([
    { 
      id: '1', 
      title: 'Lestel Naming Conventions', 
      content: 'Alle Fabric Workspaces moeten beginnen met "LSTL-". Lakehouses gebruiken de suffix "_LH". Bronze data is altijd Raw Parquet. Silver data is Delta format.', 
      isActive: true 
    }
  ]);
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  const getChat = () => {
    if (chatRef.current) return chatRef.current;
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `Je bent de "Lestel Architecture Bot", een Senior Solution Architect. Je past RAG (Retrieval-Augmented Generation) toe om advies te geven over de migratie van SAP BW naar Microsoft Azure Fabric.

BELANGRIJKSTE REGELS:
1. Gebruik ALTIJD de actieve documenten uit de 'Knowledge Base' (indien meegeleverd in de prompt) als je primaire bron.
2. Noem de bronnen expliciet (bijv: "Volgens de documentatie over 'Naming Conventions'...").
3. Als de bronnen geen antwoord bieden, gebruik dan je uitgebreide kennis over SAP ODP, ADSO, Fabric OneLake, Medallion Architectuur en de Nederlandse BIO-richtlijnen.
4. Wees technisch nauwkeurig maar praktisch.
5. Taal: Nederlands.`,
      },
    });
    return chatRef.current;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping) return;

    const activeDocs = knowledgeDocs.filter(d => d.isActive).map(d => `BRON [${d.title}]: ${d.content}`).join('\n\n');
    const promptWithContext = activeDocs 
      ? `HIERONDER VOLGEN DE KENNISBRONNEN:\n${activeDocs}\n\nGEBRUIKERSVRAAG: ${userInput}`
      : userInput;

    const userMsg: ChatMessage = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      const chat = getChat();
      const options: any = {};
      if (useSearch) {
        options.tools = [{ googleSearch: {} }];
      }

      const result = await chat.sendMessage({ 
        message: promptWithContext,
      });
      
      setChatHistory(prev => [...prev, { role: 'model', content: result.text || "Geen reactie ontvangen." }]);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', content: "Oeps! Er ging iets mis. Controleer je internetverbinding of API-instellingen." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSaveKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDocTitle.trim() && newDocContent.trim()) {
      const newDoc: KnowledgeDoc = {
        id: Date.now().toString(),
        title: newDocTitle,
        content: newDocContent,
        isActive: true
      };
      setKnowledgeDocs(prev => [...prev, newDoc]);
      setNewDocTitle('');
      setNewDocContent('');
      setIsAddingKnowledge(false);
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
              extraInfo={<p className="text-[11px] text-gray-500">Focus op ODP extractors en Delta-mechanismen.</p>}
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
              extraInfo={<p className="text-[11px] text-gray-500">Landing via Fabric Pipelines en Managed Private Endpoints.</p>}
            />
          </div>

          <TimelineStep 
            number={3} 
            title="Data Modellering (Medallion)" 
            owner="Data Engineers"
            icon="fa-sitemap"
            colorClass="bg-green-600"
            description="Transformatie naar Silver (Schoon) en Gold (Business)."
            milestones={["Delta Lake", "Lakehouse"]}
            isActive={activeStepId === 3}
            isExporting={isExporting}
            onClick={() => setActiveStepId(3)}
            extraInfo={<p className="text-[11px] text-gray-500">Gebruik van dbt of Spark Notebooks voor transformaties.</p>}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimelineStep 
              number={4} 
              title="Data Science & AI" 
              owner="Data Scientists"
              icon="fa-flask"
              colorClass="bg-purple-600"
              description="Machine Learning modellen op de Gold layer."
              milestones={["MLFlow", "Notebooks"]}
              isActive={activeStepId === 4}
              isExporting={isExporting}
              onClick={() => setActiveStepId(4)}
              extraInfo={<p className="text-[11px] text-gray-500">Predictive analytics direct op de OneLake data.</p>}
            />
            <TimelineStep 
              number={5} 
              title="Governance & Purview" 
              owner="Compliance"
              icon="fa-shield-halved"
              colorClass="bg-slate-700"
              description="Data catalogus en lineage bewaking."
              milestones={["Lineage", "Classification"]}
              isActive={activeStepId === 5}
              isExporting={isExporting}
              onClick={() => setActiveStepId(5)}
              extraInfo={<p className="text-[11px] text-gray-500">BIO-compliance via Microsoft Purview scanning.</p>}
            />
          </div>
        </div>

        <div className="lg:col-span-4 h-[calc(100vh-140px)] sticky top-[100px] no-print">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 flex flex-col h-full overflow-hidden">
            {/* Tab Header */}
            <div className="flex border-b border-gray-100 bg-slate-900">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <i className="fas fa-comments mr-2"></i> Architect Chat
              </button>
              <button 
                onClick={() => setActiveTab('knowledge')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'knowledge' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <i className="fas fa-book mr-2"></i> Bronnen (RAG)
              </button>
            </div>

            {activeTab === 'chat' ? (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                  {chatHistory.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-robot text-blue-600 text-2xl"></i>
                      </div>
                      <h4 className="font-bold text-slate-800">RAG-Enabled Architect</h4>
                      <p className="text-xs text-slate-500 mt-2">Stel een vraag. Ik gebruik je actieve bronnen voor een context-bewust antwoord.</p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] p-4 rounded-3xl text-xs leading-relaxed ${
                        msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-md' : 'bg-white border border-gray-200 text-slate-800 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-2 items-center text-[10px] text-slate-400 px-4 animate-pulse">
                      <i className="fas fa-microchip"></i>
                      <span>Architect analyseert scenario en bronnen...</span>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <button 
                      onClick={() => setUseSearch(!useSearch)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${useSearch ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'}`}
                    >
                      <i className={`fas ${useSearch ? 'fa-globe' : 'fa-circle-dot opacity-30'}`}></i>
                      Live Search {useSearch ? 'AAN' : 'UIT'}
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium">
                      <i className="fas fa-link mr-1"></i> {knowledgeDocs.filter(d => d.isActive).length} Bronnen actief
                    </span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Stel je vraag..."
                      className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 text-xs focus:ring-2 focus:ring-blue-500 outline-none pr-12 shadow-inner"
                      disabled={isTyping}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!userInput.trim() || isTyping}
                      className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-4 rounded-xl shadow-lg disabled:opacity-50 transition-all hover:bg-blue-700 active:scale-95"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Knowledge Base</h4>
                  <button 
                    onClick={() => setIsAddingKnowledge(!isAddingKnowledge)}
                    className={`p-2 rounded-lg transition-all ${isAddingKnowledge ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                  >
                    <i className={`fas ${isAddingKnowledge ? 'fa-times' : 'fa-plus'}`}></i>
                  </button>
                </div>
                
                {isAddingKnowledge && (
                  <form onSubmit={handleSaveKnowledge} className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3 animate-in slide-in-from-top-4 duration-300">
                    <h5 className="text-[10px] font-black text-blue-800 uppercase">Nieuwe Bron Toevoegen</h5>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Titel van het document"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea 
                      placeholder="Inhoud (bijv. beleidstekst of snippets)"
                      value={newDocContent}
                      onChange={(e) => setNewDocContent(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />
                    <button 
                      type="submit"
                      disabled={!newDocTitle || !newDocContent}
                      className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md active:scale-95 transition-all"
                    >
                      Bron Opslaan
                    </button>
                  </form>
                )}

                {knowledgeDocs.length === 0 && !isAddingKnowledge && (
                  <p className="text-xs text-slate-400 text-center py-8 italic">Geen bronnen toegevoegd.</p>
                )}

                <div className="space-y-3">
                  {knowledgeDocs.map(doc => (
                    <div key={doc.id} className={`p-4 rounded-2xl border-2 transition-all ${doc.isActive ? 'border-blue-100 bg-blue-50/30 shadow-sm' : 'border-slate-50 opacity-60'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-1 flex-1 pr-2">{doc.title}</h5>
                        <input 
                          type="checkbox" 
                          checked={doc.isActive}
                          onChange={() => setKnowledgeDocs(prev => prev.map(d => d.id === doc.id ? {...d, isActive: !d.isActive} : d))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-600 line-clamp-3 leading-relaxed mb-3">{doc.content}</p>
                      <button 
                        onClick={() => setKnowledgeDocs(prev => prev.filter(d => d.id !== doc.id))}
                        className="text-[9px] text-red-400 font-bold hover:text-red-600 transition-colors uppercase tracking-widest"
                      >
                        <i className="fas fa-trash mr-1"></i> Verwijderen
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <h6 className="text-[10px] font-black text-orange-800 uppercase mb-2 flex items-center gap-2">
                    <i className="fas fa-info-circle"></i> Hoe werkt RAG?
                  </h6>
                  <p className="text-[10px] text-orange-700 leading-relaxed">
                    Kopieer tekst uit jullie eigen architectuurplannen of migratie-documenten hiernaartoe. De AI "leest" deze documenten eerst voordat hij je vraag beantwoordt. Dit garandeert dat het advies past binnen de specifieke kaders van Lestel.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
