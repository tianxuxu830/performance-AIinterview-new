
import React, { useState } from 'react';
import { 
  Mic, Video, Share, Users, MessageSquare, 
  Layout, ChevronRight, Sparkles, FileText, 
  BookOpen, MoreHorizontal, Settings, CheckSquare, Square,
  Zap, CheckCircle2, AlertCircle, BarChart, Activity, Target, ThumbsUp, TrendingUp, Wand2, AlertTriangle,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InterviewSession, DimensionItem } from '../types';
import { MOCK_TEMPLATES, MOCK_ASSESSMENT_DETAILS } from '../constants';
import PerformanceAnalysisSummary from './PerformanceAnalysisSummary';

interface InterviewExecutionProps {
  session: InterviewSession;
  onEndMeeting: () => void;
}

const InterviewExecution: React.FC<InterviewExecutionProps> = ({ session, onEndMeeting }) => {
  const [activeTab, setActiveTab] = useState<'outline' | 'analysis' | 'reference' | 'notes'>('analysis');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const template = MOCK_TEMPLATES.find(t => t.id === session.templateId) || MOCK_TEMPLATES[0];
  const assessmentDetail = MOCK_ASSESSMENT_DETAILS[session.employeeId] || MOCK_ASSESSMENT_DETAILS['default'];

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({...prev, [id]: !prev[id]}));
  };

  const totalFields = template.sections.reduce((acc, section) => acc + section.fields.length, 0);

  // Helper function to render items in Focus Area as "Notes" (Adapted for Sidebar)
  const renderFocusNote = (item: any, type: 'controversy' | 'improvement' | 'highlight') => {
    let config = {
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-900',
        iconColor: 'text-purple-600',
        badgeBg: 'bg-purple-100',
        badgeText: '重点沟通',
        icon: AlertTriangle,
        actionLabel: '查看冲突',
    };

    if (type === 'improvement') {
        config = {
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-900',
            iconColor: 'text-orange-600',
            badgeBg: 'bg-orange-100',
            badgeText: '待改进',
            icon: TrendingUp,
            actionLabel: '',
        };
    } else if (type === 'highlight') {
        config = {
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-900',
            iconColor: 'text-green-600',
            badgeBg: 'bg-green-100',
            badgeText: '业绩亮点',
            icon: ThumbsUp,
            actionLabel: '',
        };
    }

    return (
        <div key={item.id} className={`rounded-xl border p-3 flex flex-col ${config.bgColor} ${config.borderColor} shadow-sm relative overflow-hidden transition-all hover:shadow-md`}>
            {/* Top Badge */}
            <div className="flex justify-between items-start mb-2">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${config.badgeBg} ${config.textColor}`}>
                    <config.icon size={10} className={`mr-1 ${config.iconColor}`} /> {config.badgeText}
                </span>
                {type === 'controversy' && (
                    <span className="text-[10px] font-bold text-red-500 bg-white/80 px-1.5 py-0.5 rounded shadow-sm border border-red-100">
                        分差 {Math.abs(item.selfScore - item.managerScore)}
                    </span>
                )}
            </div>
            
            {/* Content */}
            <div className="flex-1 mb-2">
                <h5 className={`font-bold text-xs ${config.textColor} mb-1 line-clamp-1`} title={item.name}>{item.name}</h5>
                <div className="text-[10px] text-gray-600 space-y-0.5">
                    <div className="flex justify-between">
                        <span>自评: <span className="font-medium">{item.selfScore}</span></span>
                        <span>他评: <span className="font-medium">{item.managerScore}</span></span>
                    </div>
                    {item.description && (
                        <p className="line-clamp-2 opacity-80 mt-1 italic leading-tight">"{item.description}"</p>
                    )}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Left: Video Area (Taking up roughly 70% when sidebar is open) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative`}>
        {/* Meeting Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
             <div className="flex items-center text-white pointer-events-auto">
                 <div className="bg-red-500 p-1.5 rounded mr-2 flex items-center justify-center animate-pulse">
                     <span className="w-2 h-2 bg-white rounded-full"></span>
                 </div>
                 <div>
                     <h2 className="font-medium text-sm text-shadow-sm">{session.period} 绩效面谈 - {session.employeeName}</h2>
                     <div className="text-xs text-gray-300 flex items-center mt-0.5 font-mono">
                         00:15:42
                     </div>
                 </div>
             </div>
             <div className="flex space-x-2 pointer-events-auto">
                 <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-colors"><Layout size={18} /></button>
                 <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-colors"><Settings size={18} /></button>
             </div>
        </div>

        {/* Video Placeholder */}
        <div className="flex-1 flex items-center justify-center p-4 bg-black">
             <div className="grid grid-cols-1 w-full h-full max-h-[90vh] gap-4">
                 {/* Main Speaker */}
                 <div className="relative bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center border border-gray-700">
                     <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" alt="Speaker" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                     <div className="relative z-10 flex flex-col items-center">
                         <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mb-4 ring-4 ring-blue-500/30 shadow-xl">
                             {session.employeeName.charAt(0)}
                         </div>
                     </div>
                     <div className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/40 px-3 py-1 rounded backdrop-blur-md">
                         {session.employeeName}
                     </div>
                 </div>
                 
                 {/* Self View (Floating) */}
                 <div className="absolute bottom-20 right-6 w-48 aspect-video bg-gray-900 rounded-lg border border-gray-700 shadow-2xl overflow-hidden group cursor-move">
                     <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-xs">Me</div>
                     </div>
                     <div className="absolute bottom-2 left-2 text-white text-[10px] font-medium bg-black/40 px-2 py-0.5 rounded">
                         我
                     </div>
                 </div>
             </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="h-20 bg-gray-900 border-t border-gray-800 flex justify-center items-center px-6 gap-4 shrink-0 z-20">
            <div className="flex space-x-3">
                <ControlButton icon={Mic} label="静音" />
                <ControlButton icon={Video} label="停止视频" />
            </div>
            
            <div className="flex-1 flex justify-center space-x-3">
                <ControlButton icon={Share} label="共享屏幕" />
                <ControlButton icon={Users} label="成员(2)" />
                <ControlButton icon={MessageSquare} label="聊天" />
                <ControlButton icon={Sparkles} label="AI助手" active />
            </div>

            <div className="flex items-center space-x-3">
                <button 
                    onClick={onEndMeeting}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-bold shadow-lg shadow-red-900/20 transition-all hover:scale-105"
                >
                    结束会议
                </button>
                <div className="w-px h-8 bg-gray-700 mx-2"></div>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`p-2.5 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors ${isSidebarOpen ? 'bg-gray-800 text-white' : ''}`}
                >
                    {isSidebarOpen ? <ChevronRight size={20} /> : <Layout size={20} />}
                </button>
            </div>
        </div>
      </div>

      {/* Right: Sidebar (30% width) */}
      {isSidebarOpen && (
        <div className="w-[30%] min-w-[350px] max-w-[450px] bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
            {/* Sidebar Header Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
                <TabButton active={activeTab === 'outline'} onClick={() => setActiveTab('outline')} icon={FileText} label="大纲" />
                <TabButton active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={BarChart} label="总结" />
                <TabButton active={activeTab === 'reference'} onClick={() => setActiveTab('reference')} icon={BookOpen} label="资料" />
                <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={MessageSquare} label="备注" />
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                {activeTab === 'outline' && (
                    <div className="p-5 space-y-6">
                        {/* Status Tracker */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2 px-1">
                             <span className="font-medium">面谈进度</span>
                             <span className="text-blue-600 font-bold">{Object.keys(checkedItems).length}/{totalFields}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(Object.keys(checkedItems).length / totalFields) * 100}%` }}></div>
                        </div>

                        {/* Outline Sections */}
                        <div className="space-y-6">
                             {template.sections.map((section) => (
                                 <div key={section.id}>
                                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{section.title}</h4>
                                     <div className="space-y-3 relative pl-3 border-l-2 border-gray-100">
                                        {section.fields.map((field) => (
                                            <div key={field.id} className={`bg-white p-3 rounded-lg border shadow-sm transition-all cursor-pointer group ${checkedItems[field.id] ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`} onClick={() => toggleCheck(field.id)}>
                                                <div className="flex items-start">
                                                    <div className={`mt-0.5 mr-3 text-gray-300 group-hover:text-blue-400 ${checkedItems[field.id] ? 'text-green-500' : ''}`}>
                                                        {checkedItems[field.id] ? <CheckSquare size={16} /> : <Square size={16} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className={`text-sm font-medium block mb-2 ${checkedItems[field.id] ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                                            {field.label}
                                                        </label>
                                                        {/* Inline Note */}
                                                        {!checkedItems[field.id] && (
                                                            <textarea 
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full bg-gray-50 border-none rounded p-2 text-xs focus:ring-1 focus:ring-blue-200 min-h-[40px] resize-none placeholder-gray-400 text-gray-600"
                                                                placeholder="记录关键点..."
                                                            ></textarea>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}
                
                {activeTab === 'analysis' && (
                    <div className="p-4 h-full overflow-y-auto custom-scrollbar bg-gray-50/50">
                        <PerformanceAnalysisSummary assessmentDetail={assessmentDetail} />
                    </div>
                )}

                {activeTab === 'reference' && (
                    <div className="p-4 space-y-4">
                        <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wide px-1">附件证明</div>
                        {assessmentDetail.attachments.map(att => (
                            <div key={att.id} className="bg-gray-50 p-3 rounded border border-gray-200 text-sm mb-2 flex items-center cursor-pointer hover:bg-white hover:shadow-sm transition-all">
                                <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[10px] font-bold text-gray-500 mr-3 border">
                                    {att.type}
                                </div>
                                <div className="flex-1 truncate text-xs text-gray-700">{att.name}</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="p-4 h-full flex flex-col">
                        <div className="flex-1 bg-yellow-50/50 border border-yellow-100 rounded-lg p-4 mb-4 overflow-y-auto">
                            <p className="text-xs text-gray-400 mb-2 text-center">- 会议开始 10:00 -</p>
                            <div className="space-y-3">
                                <div className="bg-white p-2 rounded shadow-sm text-xs text-gray-700">
                                    <span className="text-blue-500 font-bold mr-1">10:05</span>
                                    确认了Q3的核心指标完成情况，数据无误。
                                </div>
                                <div className="bg-white p-2 rounded shadow-sm text-xs text-gray-700">
                                    <span className="text-blue-500 font-bold mr-1">10:12</span>
                                    员工提到供应链系统经常崩溃，导致效率低下，需要IT跟进。
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <textarea 
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                                placeholder="输入实时备注..."
                            ></textarea>
                            <button className="absolute bottom-2 right-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-3 text-xs font-medium flex items-center justify-center transition-colors border-b-2 ${
            active 
            ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
            : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700'
        }`}
    >
        <Icon size={14} className="mr-1.5" />
        {label}
    </button>
);

const ControlButton = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
    <button className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-all ${active ? 'bg-gray-800 text-blue-400' : ''}`}>
        <Icon size={20} className="mb-1" />
        <span className="text-[9px]">{label}</span>
    </button>
);

export default InterviewExecution;
