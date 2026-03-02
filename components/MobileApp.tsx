
import React, { useState, useEffect, useRef } from 'react';
import { 
    ChevronLeft, MoreHorizontal, Filter, Clock, ChevronRight, 
    User, Calendar, FileText, CheckCircle2, Star, Mic, Camera, 
    Send, LayoutGrid, Users, Briefcase, Search, Bell, Video, Edit3,
    MapPin, AlignLeft, BarChart2, Info, Sparkles, Target, Activity,
    ChevronDown, AlertTriangle, TrendingUp, Eye, ThumbsUp, Minus, X, RotateCw,
    Plus, Paperclip
} from 'lucide-react';
import { InterviewSession, Status } from '../types';
import { MOCK_TEMPLATES, MOCK_AI_OUTLINE, MOCK_ASSESSMENT_DETAILS, MOCK_PERFORMANCE_TRENDS, MOCK_HISTORY_RECORDS } from '../constants';
import PerformanceAnalysisSummary from './PerformanceAnalysisSummary';

interface MobileAppProps {
  sessions: InterviewSession[];
  onClose: () => void;
}

const MobileApp: React.FC<MobileAppProps> = ({ sessions, onClose }) => {
  const [localSessions, setLocalSessions] = useState<InterviewSession[]>(sessions);
  const [activeTab, setActiveTab] = useState<'workbench' | 'team' | 'me'>('workbench');
  const [workbenchView, setWorkbenchView] = useState<'dashboard' | 'interviewList' | 'schedule' | 'feedback' | 'prepare' | 'confirm'>('dashboard');
  const [interviewListTab, setInterviewListTab] = useState<'schedule' | 'start' | 'feedback' | 'confirm' | 'done'>('schedule');
  const [teamTab, setTeamTab] = useState<'subordinate' | 'org'>('subordinate');
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);
  const [teamMemberView, setTeamMemberView] = useState<'list' | 'detail' | 'record'>('list');
  const [teamMemberDetailTab, setTeamMemberDetailTab] = useState<'assessment' | 'interview'>('assessment');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<any | null>(null);

  const [meTab, setMeTab] = useState<'active' | 'completed'>('active');
  const [prepareTab, setPrepareTab] = useState<'analysis' | 'outline' | 'info'>('analysis');
  const [feedbackTab, setFeedbackTab] = useState<'form' | 'analysis' | 'detail'>('form');
  const [confirmTab, setConfirmTab] = useState<'summary' | 'form' | 'analysis'>('summary');
  
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);

  // Feedback Form State
  const [feedbackFormValues, setFeedbackFormValues] = useState<Record<string, string>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);
  const [hasGeneratedAI, setHasGeneratedAI] = useState(false);
  
  // Submit Confirmation Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitPermission, setSubmitPermission] = useState<'read' | 'edit'>('read');

  // Signature Modal State
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setIsHeaderCollapsed(false);
  }, [workbenchView]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalAIGenerate = async () => {
    setIsGeneratingAI('global');
    
    const mockResponses: Record<string, any> = {
        'summary': "基于该员工本周期的表现，整体业绩达成率较高，但在跨部门协作方面仍有提升空间。建议后续加强与产品团队的沟通频次，确保需求理解的一致性。同时，在项目管理方面表现出色，能够有效把控进度风险。",
        'achievements': "1. 成功主导了 Q4 核心版本的发布，上线后用户活跃度提升 15%。\n2. 优化了前端构建流程，打包速度提升 40%。\n3. 输出了 3 篇高质量的技术分享文档，帮助团队成员快速成长。",
        'improvements': "1. 跨部门沟通时需更加主动，避免信息滞后。\n2. 代码注释规范性有待加强，建议遵循团队最新规范。\n3. 对新技术的探索深度不够，建议投入更多时间进行技术预研。",
        'plan': "1. 制定详细的 Q1 个人成长计划，重点攻克 Serverless 架构落地。\n2. 每周组织一次代码走查，提升代码质量。\n3. 参与开源社区贡献，提升个人及团队影响力。",
        'date': new Date().toISOString().split('T')[0],
        'select': '正式绩效', // Default for select
        'number': '92',
        'graph': { radar: [80, 90, 85, 70, 95] }, // Mock graph data
        'attachment': [{ name: 'Q4述职报告.pdf', size: '2.4MB' }]
    };

    // Identify target fields and their content
    const targets: {id: string, type: string, value: any}[] = [];
    if (selectedSession) {
         const template = MOCK_TEMPLATES.find(t => t.id === selectedSession.templateId) || MOCK_TEMPLATES[0];
         template.sections.forEach(section => {
             section.fields.forEach(field => {
                 let value: any = "";
                 if (field.type === 'textarea' || field.type === 'text') {
                     if (field.id.includes('summary')) value = mockResponses['summary'];
                     else if (field.id.includes('achievement')) value = mockResponses['achievements'];
                     else if (field.id.includes('improvement')) value = mockResponses['improvements'];
                     else if (field.id.includes('plan')) value = mockResponses['plan'];
                     else if (field.label.includes('行动')) value = "完成系统架构重构";
                     else value = mockResponses['summary'];
                 } else if (field.type === 'date') {
                     value = mockResponses['date'];
                 } else if (field.type === 'select') {
                     value = field.options ? field.options[0] : '选项1';
                 } else if (field.type === 'number') {
                     value = '95';
                 } else if (field.type === 'graph') {
                     value = mockResponses['graph'];
                 } else if (field.type === 'attachment') {
                     value = mockResponses['attachment'];
                 }

                 targets.push({ id: field.id, type: field.type, value });
             });
         });
    }

    // Sequential generation
    for (const target of targets) {
        if (target.type === 'textarea' || target.type === 'text') {
            // Typing effect for text fields
            await new Promise<void>(resolve => {
                let currentText = "";
                const interval = setInterval(() => {
                    if (currentText.length < target.value.length) {
                        const charsToAdd = Math.floor(Math.random() * 4) + 2;
                        currentText = target.value.substring(0, currentText.length + charsToAdd);
                        setFeedbackFormValues(prev => ({ ...prev, [target.id]: currentText }));
                    } else {
                        clearInterval(interval);
                        resolve();
                    }
                }, 10); // Faster typing
            });
        } else {
            // Delay for other fields to simulate thinking
            await new Promise(resolve => setTimeout(resolve, 400));
            setFeedbackFormValues(prev => ({ ...prev, [target.id]: target.value }));
        }
    }

    setIsGeneratingAI(null);
    setHasGeneratedAI(true);
  };

  // Determine if Bottom Bar should be visible
  const showBottomBar = activeTab !== 'workbench' || (workbenchView === 'dashboard' || workbenchView === 'interviewList');

  // --- Data Filtering ---
  const pendingInterviews = localSessions.filter(s => 
    s.status === Status.NotStarted || 
    s.status === Status.InProgress || 
    s.status === Status.PendingConfirmation
  );

  // Filter logic for the interview list tabs
  const getMobileTabCount = (tab: string) => {
      return localSessions.filter(session => {
          if (tab === 'schedule') return session.status === Status.NotStarted && (session.schedulingStatus === 'pending' || !session.schedulingStatus);
          if (tab === 'start') return session.status === Status.NotStarted && session.schedulingStatus === 'scheduled';
          if (tab === 'feedback') return session.status === Status.InProgress;
          if (tab === 'confirm') return session.status === Status.PendingConfirmation;
          if (tab === 'done') return session.status === Status.Completed;
          return false;
      }).length;
  };

  const mobileFilteredSessions = localSessions.filter(session => {
      if (interviewListTab === 'schedule') return session.status === Status.NotStarted && (session.schedulingStatus === 'pending' || !session.schedulingStatus);
      if (interviewListTab === 'start') return session.status === Status.NotStarted && session.schedulingStatus === 'scheduled';
      if (interviewListTab === 'feedback') return session.status === Status.InProgress;
      if (interviewListTab === 'confirm') return session.status === Status.PendingConfirmation;
      if (interviewListTab === 'done') return session.status === Status.Completed;
      return false;
  });

  // Mock Team Data (Updated to match the new card design)
  const teamMembers = [
      { 
          id: 't1', 
          name: '张珊珊', 
          employeeId: '200034',
          department: '产品部',
          role: '产品经理', 
          avatar: 'https://picsum.photos/id/64/100/100',
          latestCycle: '2023年11月',
          latestScoreTag: '90-S',
          latestGradeTag: 'A',
          totalAssessments: 99
      },
      { 
          id: 't2', 
          name: '李思思', 
          employeeId: '200033',
          department: '产品部',
          role: '产品经理', 
          avatar: 'https://picsum.photos/id/338/100/100',
          latestCycle: '2023年11月',
          latestScoreTag: '90-S',
          latestGradeTag: 'A',
          totalAssessments: 99
      },
      { 
          id: 't3', 
          name: '王强', 
          employeeId: '200035',
          department: '技术部',
          role: '技术专家', 
          avatar: 'https://picsum.photos/id/12/100/100',
          latestCycle: '2023年11月',
          latestScoreTag: '95-S',
          latestGradeTag: 'S',
          totalAssessments: 85
      },
  ];

  // Mock My Assessments
  const myAssessments = [
      { id: 'm1', name: '2025 Q4 绩效考核', status: '自评中', deadline: '2025-12-31' },
      { id: 'm2', name: '2025 360互评', status: '待评价', deadline: '2025-12-25' },
  ];

  // --- Renderers ---

  const renderSchedule = () => {
      if (!selectedSession) return null;
      
      return (
        <div className="flex-1 bg-white flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 relative z-20">
            {/* Header */}
            <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm shrink-0 z-10 border-b border-gray-100">
                <ChevronLeft size={24} className="text-gray-600 cursor-pointer mr-2" onClick={() => setWorkbenchView('interviewList')} />
                <span className="text-base font-bold text-gray-800">预约面谈</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar pb-32">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-blue-600 text-sm shadow-sm border border-blue-100 mr-3">
                        {selectedSession.employeeName.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-900">{selectedSession.employeeName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{selectedSession.period}</div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">面谈主题</label>
                        <input 
                            type="text" 
                            defaultValue={selectedSession.period}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">日期</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">时间</label>
                            <div className="relative">
                                <input 
                                    type="time" 
                                    defaultValue="10:00"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">预计时长</label>
                        <div className="flex space-x-3">
                            <button className="flex-1 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold">30 分钟</button>
                            <button className="flex-1 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium">60 分钟</button>
                            <button className="flex-1 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium">90 分钟</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">面谈方式</label>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                <Video size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-gray-800">腾讯会议</div>
                                <div className="text-xs text-gray-400">自动生成会议链接</div>
                            </div>
                            <CheckCircle2 size={18} className="text-blue-500" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">备注信息</label>
                        <textarea 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                            placeholder="填写备注..."
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white pb-8 absolute bottom-0 left-0 right-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={() => {
                        // Simulate scheduling success and data flow
                        const updatedSession = { 
                            ...selectedSession, 
                            schedulingStatus: 'scheduled' as const, 
                            date: new Date().toISOString().split('T')[0] + ' 10:00' 
                        };
                        setLocalSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
                        setSelectedSession(updatedSession);
                        
                        // Jump to Prepare View
                        setWorkbenchView('prepare');
                        setPrepareTab('analysis');
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    确认预约
                </button>
            </div>
        </div>
      );
  };

  const renderPrepare = () => {
      // ... (Prepare logic remains unchanged)
      if (!selectedSession) return null;

      // Mock Data for Analysis View (Matching PC)
      const analysisData = {
          score: '88.5',
          grade: 'A',
          achievement: '95%',
          highlights: [
              { id: 'h1', title: '出勤率', self: 100, manager: 100, tag: '业绩亮点', type: 'highlight' }
          ],
          improvements: [
              { id: 'i1', title: '核心业务指标完成度', self: 80, manager: 70, tag: '待改进', type: 'improvement' }
          ],
          conflicts: [
              { 
                  id: 'c1', 
                  title: '评价冲突', 
                  self: 100, 
                  manager: 100, 
                  tag: '重点沟通', 
                  type: 'conflict',
                  quote: '“本季度主要在摸索阶段，产出有限”，但自评分数：100分。',
                  diff: 25 
              }
          ]
      };

      const renderTag = (type: string, tag: string, diff?: number) => {
          let styles = '';
          let icon = null;
          if (type === 'conflict') {
              styles = 'bg-purple-50 text-purple-700 border-purple-100';
              icon = <AlertTriangle size={10} className="mr-1" />;
          } else if (type === 'improvement') {
              styles = 'bg-orange-50 text-orange-700 border-orange-100';
              icon = <TrendingUp size={10} className="mr-1" />;
          } else {
              styles = 'bg-green-50 text-green-700 border-green-100';
              icon = <ThumbsUp size={10} className="mr-1" />;
          }

          return (
              <div className="flex items-center">
                  <span className={`flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${styles}`}>
                      {icon} {tag}
                  </span>
                  {type === 'conflict' && (
                      <span className="ml-2 text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold border border-red-100">分差 {diff || 0}</span>
                  )}
              </div>
          );
      };

      return (
        <div className="flex-1 bg-[#F5F6F8] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 relative z-20">
            {/* Header */}
            <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm shrink-0 z-10 border-b border-gray-100">
                <ChevronLeft size={24} className="text-gray-600 cursor-pointer mr-2" onClick={() => {
                    setWorkbenchView('interviewList');
                    setInterviewListTab('start'); // Go to "To Start" list
                }} />
                <span className="text-base font-bold text-gray-800">面谈准备</span>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
                
                {/* Prepare View Tabs */}
                <div className="bg-white px-4 border-b border-gray-100 flex space-x-6 sticky top-0 z-10 shadow-sm">
                    <button 
                        onClick={() => setPrepareTab('analysis')}
                        className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${prepareTab === 'analysis' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                    >
                        绩效分析
                    </button>
                    <button 
                        onClick={() => setPrepareTab('outline')}
                        className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${prepareTab === 'outline' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                    >
                        智能大纲
                    </button>
                    <button 
                        onClick={() => setPrepareTab('info')}
                        className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${prepareTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                    >
                        基本信息
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-4">
                    {prepareTab === 'analysis' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            
                            {/* User Info Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="relative">
                                        <img src="https://picsum.photos/id/338/100/100" className="w-10 h-10 rounded-full border border-gray-200 shadow-sm" alt=""/>
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-bold text-gray-900">{selectedSession.employeeName}</h3>
                                        <div className="text-xs text-gray-500">云演示组 · 工程师</div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 flex items-center shadow-sm">
                                    <span className="text-xs font-medium text-gray-700 mr-1">2025 Q4</span>
                                    <ChevronDown size={12} className="text-gray-400" />
                                </div>
                            </div>

                            {/* Overall Score Card */}
                            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">综合评分</div>
                                        <div className="flex items-baseline">
                                            <span className="text-3xl font-bold text-gray-900">{analysisData.score}</span>
                                            <span className="ml-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">等级 {analysisData.grade}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 mb-1">整体目标达成率</div>
                                        <div className="text-lg font-bold text-blue-600">{analysisData.achievement}</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center text-xs font-bold text-blue-600">
                                        <Target size={14} className="mr-1.5" /> 本周期重点
                                    </div>

                                    {/* 1. Conflict Card */}
                                    {analysisData.conflicts.map(item => (
                                        <div key={item.id} className="bg-purple-50 border border-purple-100 rounded-xl p-3 relative">
                                            <div className="flex justify-between items-start mb-2">
                                                {renderTag('conflict', item.tag, 0)} 
                                            </div>
                                            <h4 className="font-bold text-xs text-purple-900 mb-2">{item.title}</h4>
                                            <div className="flex justify-between text-[10px] text-gray-600 mb-2 bg-white/60 p-1.5 rounded">
                                                <span>自评: <span className="font-bold text-gray-800">{item.self}</span></span>
                                                <span>他评: <span className="font-bold text-gray-800">{item.manager}</span></span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 italic mb-2 leading-relaxed">
                                                {item.quote}
                                            </p>
                                            <button className="flex items-center justify-center w-full py-1.5 bg-white border border-purple-100 rounded text-[10px] font-medium text-purple-600 hover:bg-purple-50">
                                                <Eye size={10} className="mr-1.5" /> 查看冲突对比
                                            </button>
                                        </div>
                                    ))}

                                    {/* 2. Improvement Card */}
                                    {analysisData.improvements.map(item => (
                                        <div key={item.id} className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                {renderTag('improvement', item.tag)}
                                            </div>
                                            <h4 className="font-bold text-xs text-orange-900 mb-2">{item.title}</h4>
                                            <div className="flex justify-between text-[10px] text-gray-600 bg-white/60 p-1.5 rounded">
                                                <span>自评: <span className="font-bold text-gray-800">{item.self}</span></span>
                                                <span>他评: <span className="font-bold text-gray-800">{item.manager}</span></span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* 3. Highlight Card */}
                                    {analysisData.highlights.map(item => (
                                        <div key={item.id} className="bg-green-50 border border-green-100 rounded-xl p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                {renderTag('highlight', item.tag)}
                                            </div>
                                            <h4 className="font-bold text-xs text-green-900 mb-2">{item.title}</h4>
                                            <div className="flex justify-between text-[10px] text-gray-600 bg-white/60 p-1.5 rounded">
                                                <span>自评: <span className="font-bold text-gray-800">{item.self}</span></span>
                                                <span>他评: <span className="font-bold text-gray-800">{item.manager}</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* AI Summary */}
                                <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs leading-relaxed text-gray-600">
                                    <div className="flex items-center font-bold text-gray-800 mb-1">
                                        <Sparkles size={12} className="mr-1.5 text-purple-500" /> AI 总结：
                                    </div>
                                    整体表现稳健，执行力与协作力表现突出。主要矛盾集中在KPI认定规则的理解上，建议面谈时优先解决。
                                </div>
                            </div>

                            {/* History Trend */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center text-xs font-bold text-gray-800 mb-4">
                                    <Clock size={14} className="mr-1.5 text-blue-600" /> 历史趋势
                                </div>
                                <div className="h-24 w-full flex items-end justify-between px-2 text-[10px] text-gray-400">
                                    {[75, 78, 76, 78].map((val, i) => (
                                        <div key={i} className="flex flex-col items-center group w-full">
                                            <div className="relative w-full flex justify-center h-20 items-end">
                                                <div className="w-1.5 bg-blue-100 rounded-t group-hover:bg-blue-300 transition-colors" style={{ height: `${val}%` }}></div>
                                                <div className="absolute -top-6 bg-gray-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{val}</div>
                                            </div>
                                            <div className="mt-2 border-t border-gray-100 w-full text-center pt-1">
                                                Q{i+1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {prepareTab === 'outline' && (
                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center mb-3 text-purple-600">
                                <Sparkles size={16} className="mr-2" />
                                <span className="text-sm font-bold">AI 智能面谈大纲</span>
                            </div>
                            <div className="prose prose-sm max-w-none text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {MOCK_AI_OUTLINE.replace(/#/g, '')}
                            </div>
                        </div>
                    )}

                    {prepareTab === 'info' && (
                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 space-y-4">
                            <div className="flex items-center text-gray-800 text-sm font-bold mb-2">
                                <Info size={16} className="mr-2 text-blue-600" /> 面谈信息
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <div className="text-gray-400 mb-1">面谈对象</div>
                                    <div className="text-gray-800 font-medium">{selectedSession.employeeName}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 mb-1">面谈官</div>
                                    <div className="text-gray-800 font-medium">{selectedSession.managerName}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 mb-1">关联周期</div>
                                    <div className="text-gray-800 font-medium">{selectedSession.assessmentCycle || '2025 Q4'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 mb-1">面谈模板</div>
                                    <div className="text-gray-800 font-medium">标准绩效面谈模板</div>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-gray-100">
                                <div className="text-gray-400 text-xs mb-1">面谈备注</div>
                                <div className="text-gray-600 text-xs bg-gray-50 p-2 rounded">
                                    请重点沟通下季度的OKR设定思路，以及针对跨部门协作问题的解决方案。
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Enter Meeting Button - Only on Prepare View */}
            {prepareTab && (
                <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-30">
                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center">
                        <Video size={18} className="mr-2" /> 进入面谈会议
                    </button>
                </div>
            )}
        </div>
      );
  };

  const renderSubmitModal = () => {
      if (!isSubmitModalOpen || !selectedSession) return null;

      return (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
                  <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 text-lg">确认同步内容</h3>
                      <button onClick={() => setIsSubmitModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-5">
                      <p className="text-sm text-gray-500 mb-4">即将发送给 <span className="font-bold text-gray-800">{selectedSession.employeeName}</span> 确认</p>
                      
                      <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4">
                          <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                      <FileText size={16} />
                                  </div>
                                  <span className="text-sm font-bold text-gray-800">绩效面谈记录表</span>
                              </div>
                              <CheckCircle2 size={18} className="text-blue-600" />
                          </div>
                          
                          <div className="bg-white rounded-lg p-2 border border-blue-100 flex items-center justify-between">
                              <span className="text-xs text-gray-500 ml-1">员工权限:</span>
                              <div className="flex bg-gray-100 rounded p-0.5">
                                  <button 
                                      onClick={() => setSubmitPermission('read')}
                                      className={`px-2 py-1 rounded text-[10px] font-medium transition-all flex items-center ${submitPermission === 'read' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                                  >
                                      <Eye size={10} className="mr-1" /> 仅查看
                                  </button>
                                  <button 
                                      onClick={() => setSubmitPermission('edit')}
                                      className={`px-2 py-1 rounded text-[10px] font-medium transition-all flex items-center ${submitPermission === 'edit' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                                  >
                                      <Edit3 size={10} className="mr-1" /> 允许修改
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="px-5 py-4 border-t border-gray-100 flex space-x-3">
                      <button 
                          onClick={() => setIsSubmitModalOpen(false)}
                          className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                          onClick={() => {
                              setIsSubmitModalOpen(false);
                              alert("已发送给员工确认！");
                              setWorkbenchView('interviewList');
                          }}
                          className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-colors flex items-center justify-center"
                      >
                          <Send size={14} className="mr-1.5" /> 确认并发送
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const renderFeedback = () => {
      if (!selectedSession) return null;
      const template = MOCK_TEMPLATES.find(t => t.id === selectedSession.templateId) || MOCK_TEMPLATES[0];

      const assessmentDetail = MOCK_ASSESSMENT_DETAILS[selectedSession.employeeId] || MOCK_ASSESSMENT_DETAILS['default'];

      return (
        <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 relative z-20">
            {/* Header */}
            <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm shrink-0 z-10 border-b border-gray-100">
                <ChevronLeft size={24} className="text-gray-600 cursor-pointer mr-2" onClick={() => setWorkbenchView('interviewList')} />
                <span className="text-base font-bold text-gray-800">面谈反馈</span>
            </div>

            {/* Employee Info Card - Collapsible */}
            <div className={`bg-white px-4 shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isHeaderCollapsed ? 'pt-2 pb-0 h-14' : 'pt-4 pb-2 h-auto'}`}>
                {isHeaderCollapsed ? (
                    <div className="flex items-center justify-between py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs mr-2 border border-purple-100">
                                {selectedSession.employeeName.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900 mr-2">{selectedSession.employeeName}</span>
                            <span className="text-xs text-gray-400">{selectedSession.period}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded scale-90 origin-right">正在反馈</span>
                    </div>
                ) : (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">正在反馈</span>
                            <span className="text-xs font-bold text-gray-400">{new Date().toISOString().split('T')[0]}</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mr-3 border border-purple-100">
                                {selectedSession.employeeName.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">{selectedSession.employeeName}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{selectedSession.period}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white px-4 border-b border-gray-100 flex space-x-6 sticky top-0 z-10 shadow-sm">
                <button 
                    onClick={() => setFeedbackTab('form')}
                    className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${feedbackTab === 'form' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                    绩效反馈表
                </button>
                <button 
                    onClick={() => setFeedbackTab('analysis')}
                    className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${feedbackTab === 'analysis' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                    考核总结分析
                </button>
                <button 
                    onClick={() => setFeedbackTab('detail')}
                    className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${feedbackTab === 'detail' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                    考核表明细
                </button>
            </div>

            <div 
                className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-20"
                onScroll={(e) => setIsHeaderCollapsed(e.currentTarget.scrollTop > 20)}
            >

                {feedbackTab === 'form' && (
                    <div className="space-y-4 pb-4 animate-in fade-in">
                        {/* Global AI Generate Button - Compact Version */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-3 py-2 rounded-lg border border-purple-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center">
                                <Sparkles size={14} className="text-purple-600 mr-2" />
                                <span className="text-xs font-bold text-purple-900">AI 智能辅助填写</span>
                                <span className="text-[10px] text-purple-400 ml-2 scale-90 origin-left">基于员工表现自动生成</span>
                            </div>
                            <button 
                                onClick={handleGlobalAIGenerate}
                                disabled={isGeneratingAI === 'global'}
                                className="px-2.5 py-1 bg-white text-purple-600 text-[10px] font-bold rounded-md border border-purple-100 shadow-sm active:scale-95 transition-transform flex items-center"
                            >
                                {isGeneratingAI === 'global' ? (
                                    <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-purple-600 mr-1"></div>
                                ) : (
                                    hasGeneratedAI ? <RotateCw size={10} className="mr-1" /> : <Sparkles size={10} className="mr-1" />
                                )}
                                {isGeneratingAI === 'global' ? '生成中...' : (hasGeneratedAI ? '重新生成' : '一键生成')}
                            </button>
                        </div>

                        {template.sections.map((section, idx) => (
                            <div key={section.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center mb-3">
                                    <div className="w-1 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <h4 className="font-bold text-sm text-gray-800">{section.title}</h4>
                                </div>
                                
                                {section.viewType === 'table' ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {section.fields.map(field => (
                                                        <th key={field.id} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                <tr>
                                                    {section.fields.map(field => (
                                                        <td key={field.id} className="px-3 py-2 whitespace-nowrap min-w-[120px]">
                                                            {field.type === 'text' ? (
                                                                <input 
                                                                    type="text" 
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition-colors"
                                                                    placeholder={field.placeholder}
                                                                    value={feedbackFormValues[field.id] || ''}
                                                                    onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                                                                />
                                                            ) : field.type === 'date' ? (
                                                                <input 
                                                                    type="date" 
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition-colors"
                                                                    value={feedbackFormValues[field.id] || ''}
                                                                    onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                                                                />
                                                            ) : field.type === 'select' ? (
                                                                <select 
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none"
                                                                    value={feedbackFormValues[field.id] || ''}
                                                                    onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                                                                >
                                                                    <option value="">请选择</option>
                                                                    {field.options?.map(opt => (
                                                                        <option key={opt} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <div className="text-xs text-gray-400">不支持的类型</div>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                        <button className="mt-2 text-xs text-blue-600 flex items-center font-medium px-1 py-1 hover:bg-blue-50 rounded">
                                            <Plus size={12} className="mr-1" /> 添加行
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {section.fields.map(field => (
                                            <div key={field.id}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-xs font-bold text-gray-500">
                                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                </div>
                                                {field.type === 'textarea' ? (
                                                    <textarea 
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                                                        placeholder={field.placeholder || "请输入..."}
                                                        value={feedbackFormValues[field.id] || ''}
                                                        onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                                                    ></textarea>
                                                ) : field.type === 'rating' ? (
                                                    <div className="flex space-x-2">
                                                        {[1,2,3,4,5].map(i => (
                                                            <Star key={i} size={24} className="text-gray-300 hover:text-yellow-400 cursor-pointer fill-gray-100" />
                                                        ))}
                                                    </div>
                                                ) : field.type === 'date' ? (
                                                    <div className="relative">
                                                        <input 
                                                            type="date" 
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none"
                                                            value={feedbackFormValues[field.id] || ''}
                                                            onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                                                        />
                                                        <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                                    </div>
                                                ) : field.type === 'select' ? (
                                                    <div className="relative">
                                                        <select 
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none"
                                                            value={feedbackFormValues[field.id] || ''}
                                                            onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                                                        >
                                                            <option value="">{field.placeholder || "请选择"}</option>
                                                            {field.options?.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                                    </div>
                                                ) : field.type === 'number' ? (
                                                    <input 
                                                        type="number" 
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors"
                                                        placeholder={field.placeholder}
                                                        value={feedbackFormValues[field.id] || ''}
                                                        onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                                                    />
                                                ) : field.type === 'graph' ? (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center h-40">
                                                        {feedbackFormValues[field.id] ? (
                                                            <div className="text-center">
                                                                <BarChart2 size={32} className="mx-auto text-blue-500 mb-2" />
                                                                <div className="text-xs text-gray-500">能力雷达图已生成</div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-gray-400 flex flex-col items-center">
                                                                <Activity size={24} className="mb-2" />
                                                                <span>等待生成图形评价...</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : field.type === 'attachment' ? (
                                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                                                        {feedbackFormValues[field.id] ? (
                                                            <div className="flex items-center justify-center text-blue-600">
                                                                <FileText size={20} className="mr-2" />
                                                                <span className="text-sm font-medium">Q4述职报告.pdf (2.4MB)</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center text-gray-400">
                                                                <Paperclip size={20} className="mb-1" />
                                                                <span className="text-xs">点击上传附件</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <input 
                                                        type="text" 
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors"
                                                        placeholder={field.placeholder}
                                                        value={feedbackFormValues[field.id] || ''}
                                                        onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {feedbackTab === 'analysis' && (
                    <div className="space-y-4 animate-in fade-in">
                        <PerformanceAnalysisSummary 
                            assessmentDetail={assessmentDetail} 
                            onOpenIndicatorDetails={() => setFeedbackTab('detail')} 
                        />
                    </div>
                )}

                {feedbackTab === 'detail' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-sm text-gray-900">考核指标明细</h3>
                                <div className="text-xs text-gray-500">总分: <span className="font-bold text-blue-600 text-sm">{assessmentDetail.performanceScore}</span></div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {assessmentDetail.indicators?.map((indicator) => (
                                    <div key={indicator.id} className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 mr-4">
                                                <div className="flex items-center mb-1">
                                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mr-2 shrink-0">{indicator.weight}%</span>
                                                    <span className="text-sm font-bold text-gray-900 line-clamp-1">{indicator.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2">{indicator.description}</p>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                <div className="flex items-center space-x-3 text-xs mb-1">
                                                    <span className="text-gray-400">自评</span>
                                                    <span className="font-bold text-gray-700">{indicator.selfScore}</span>
                                                </div>
                                                <div className="flex items-center space-x-3 text-xs">
                                                    <span className="text-gray-400">上级</span>
                                                    <span className={`font-bold ${indicator.managerScore !== indicator.selfScore ? 'text-orange-500' : 'text-blue-600'}`}>{indicator.managerScore}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {indicator.managerScore !== indicator.selfScore && (
                                            <div className="mt-2 bg-orange-50 p-2 rounded text-[10px] text-orange-700 flex items-start">
                                                <AlertTriangle size={12} className="mr-1 mt-0.5 shrink-0" />
                                                <span>评分差异：{Math.abs(indicator.managerScore - indicator.selfScore)}分。请重点沟通。</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Action Bar - Optimized with Auto-save Status */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-30 absolute bottom-0 left-0 right-0 pb-6 flex items-center justify-between">
                 <div className="flex items-center text-[10px] text-gray-400">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                    自动保存 {currentTime}
                 </div>
                 <button 
                    onClick={() => {
                        setIsSubmitModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center"
                >
                    <Send size={16} className="mr-2" /> 发送给员工确认
                </button>
            </div>
        </div>
      );
  };

  const renderConfirm = () => {
      if (!selectedSession) return null;
      const template = MOCK_TEMPLATES.find(t => t.id === selectedSession.templateId) || MOCK_TEMPLATES[0];
      const assessmentDetail = MOCK_ASSESSMENT_DETAILS[selectedSession.employeeId] || MOCK_ASSESSMENT_DETAILS['default'];

      return (
        <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 relative z-20">
            {/* Header */}
            <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm shrink-0 z-10 border-b border-gray-100">
                <ChevronLeft size={24} className="text-gray-600 cursor-pointer mr-2" onClick={() => setWorkbenchView('interviewList')} />
                <span className="text-base font-bold text-gray-800">结果确认</span>
            </div>

            {/* Employee Info Card - Collapsible */}
            <div className={`bg-white px-4 shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isHeaderCollapsed ? 'pt-2 pb-0 h-14' : 'pt-4 pb-2 h-auto'}`}>
                {isHeaderCollapsed ? (
                    <div className="flex items-center justify-between py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs mr-2 border border-purple-100">
                                {selectedSession.employeeName.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900 mr-2">{selectedSession.employeeName}</span>
                            <span className="text-xs text-gray-400">{selectedSession.period}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded scale-90 origin-right">待确认</span>
                    </div>
                ) : (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">待确认</span>
                            <span className="text-xs font-bold text-gray-400">{new Date().toISOString().split('T')[0]}</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mr-3 border border-purple-100">
                                {selectedSession.employeeName.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">{selectedSession.employeeName}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{selectedSession.period}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white px-4 border-b border-gray-100 flex space-x-6 sticky top-0 z-10 shadow-sm">
                <button 
                    onClick={() => setConfirmTab('summary')}
                    className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${confirmTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                    智能纪要
                </button>
                <button 
                    onClick={() => setConfirmTab('form')}
                    className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${confirmTab === 'form' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                    绩效面谈表
                </button>
                <button 
                    onClick={() => setConfirmTab('analysis')}
                    className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${confirmTab === 'analysis' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
                >
                    考核总结分析
                </button>
            </div>

            <div 
                className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24"
                onScroll={(e) => setIsHeaderCollapsed(e.currentTarget.scrollTop > 20)}
            >
                {confirmTab === 'summary' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center mb-4">
                                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg mr-2">
                                    <Sparkles size={16} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">AI 智能面谈纪要</h3>
                            </div>
                            <div className="text-xs text-gray-600 leading-relaxed space-y-3">
                                <p>本次绩效面谈于 {selectedSession.date} 进行，整体氛围积极建设性。核心讨论点如下：</p>
                                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                                    <h4 className="font-bold text-blue-900 mb-2 flex items-center"><CheckCircle2 size={12} className="mr-1"/> 达成共识事项</h4>
                                    <ul className="list-disc list-inside space-y-1 text-blue-800/80">
                                        <li>确认 Q4 绩效等级为 A，核心项目 A10 表现优异获得认可。</li>
                                        <li>针对“跨部门协作”中的认知偏差达成了一致改进方案。</li>
                                        <li>下个周期的重点将向“新产品孵化”倾斜，权重调整为 40%。</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {confirmTab === 'form' && (
                    <div className="space-y-4 animate-in fade-in">
                        {template.sections.map((section) => (
                            <div key={section.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center mb-3">
                                    <div className="w-1 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <h4 className="font-bold text-sm text-gray-800">{section.title}</h4>
                                </div>
                                <div className="space-y-4">
                                    {section.fields.map(field => (
                                        <div key={field.id}>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">
                                                {field.label}
                                            </label>
                                            <div className="text-xs text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px]">
                                                {selectedSession.content?.[field.id] || '[面谈官未填写]'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {confirmTab === 'analysis' && (
                    <div className="space-y-4 animate-in fade-in">
                        <PerformanceAnalysisSummary assessmentDetail={assessmentDetail} />
                    </div>
                )}
            </div>

            {/* Bottom Action - Optimized */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-30 absolute bottom-0 left-0 right-0 flex space-x-3 pb-6">
                <button 
                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold active:scale-95 transition-transform"
                >
                    退回修正
                </button>
                <button 
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center"
                >
                    <CheckCircle2 size={16} className="mr-1.5" /> 确认结果
                </button>
            </div>
        </div>
      );
  };

  const renderSignatureModal = () => {
      if (!isSignatureModalOpen || !selectedSession) return null;

      return (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col">
                  <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center">
                          <Edit3 size={18} className="mr-2 text-blue-600" />
                          手写签名确认
                      </h3>
                      <button onClick={() => setIsSignatureModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-gray-700">签署人：{selectedSession.employeeName}</span>
                          <button 
                              onClick={() => {
                                  const canvas = canvasRef.current;
                                  if (canvas) {
                                      const ctx = canvas.getContext('2d');
                                      ctx?.clearRect(0, 0, canvas.width, canvas.height);
                                      setHasSignature(false);
                                  }
                              }}
                              className="text-xs text-gray-500 flex items-center"
                          >
                              <Minus size={12} className="mr-1" /> 清除重签
                          </button>
                      </div>
                      
                      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden relative h-40 shrink-0">
                          {!hasSignature && (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none select-none">
                                  <span className="text-sm font-medium tracking-widest">在此处手写签名</span>
                              </div>
                          )}
                          <canvas
                              ref={canvasRef}
                              width={300}
                              height={160}
                              className="w-full h-full cursor-crosshair touch-none"
                              onMouseDown={(e) => {
                                  setIsDrawing(true);
                                  const ctx = canvasRef.current?.getContext('2d');
                                  if (ctx && canvasRef.current) {
                                      const rect = canvasRef.current.getBoundingClientRect();
                                      ctx.beginPath();
                                      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                                  }
                              }}
                              onMouseMove={(e) => {
                                  if (!isDrawing) return;
                                  const ctx = canvasRef.current?.getContext('2d');
                                  if (ctx && canvasRef.current) {
                                      const rect = canvasRef.current.getBoundingClientRect();
                                      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                                      ctx.stroke();
                                      setHasSignature(true);
                                  }
                              }}
                              onMouseUp={() => setIsDrawing(false)}
                              onMouseLeave={() => setIsDrawing(false)}
                              onTouchStart={(e) => {
                                  setIsDrawing(true);
                                  const ctx = canvasRef.current?.getContext('2d');
                                  if (ctx && canvasRef.current) {
                                      const rect = canvasRef.current.getBoundingClientRect();
                                      const touch = e.touches[0];
                                      ctx.beginPath();
                                      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
                                  }
                              }}
                              onTouchMove={(e) => {
                                  if (!isDrawing) return;
                                  const ctx = canvasRef.current?.getContext('2d');
                                  if (ctx && canvasRef.current) {
                                      const rect = canvasRef.current.getBoundingClientRect();
                                      const touch = e.touches[0];
                                      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
                                      ctx.stroke();
                                      setHasSignature(true);
                                  }
                              }}
                              onTouchEnd={() => setIsDrawing(false)}
                          />
                      </div>
                      
                      <div className="mt-4 bg-blue-50/50 rounded-lg p-2.5 border border-blue-100 flex items-start">
                          <Info size={14} className="text-blue-500 shrink-0 mt-0.5 mr-1.5" />
                          <p className="text-[10px] text-blue-800/80 leading-relaxed">
                              签署即视为本人确认并同意上述绩效面谈结果。法律效力等同于纸质签名。
                          </p>
                      </div>
                  </div>

                  <div className="px-5 py-4 border-t border-gray-100 flex space-x-3 bg-gray-50">
                      <button 
                          onClick={() => setIsSignatureModalOpen(false)}
                          className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                          disabled={!hasSignature}
                          onClick={() => {
                              setIsSignatureModalOpen(false);
                              alert("签名已提交，面谈完成！");
                              setWorkbenchView('interviewList');
                              setInterviewListTab('done');
                          }}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-colors flex items-center justify-center ${
                              hasSignature ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                          }`}
                      >
                          确认签署
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const renderWorkbench = () => {
      if (workbenchView === 'dashboard') {
          return (
            <div className="flex-1 bg-[#F5F6F8] flex flex-col overflow-hidden animate-in fade-in">
                {/* Header */}
                <div className="bg-white px-4 pt-12 pb-3 flex justify-between items-center shadow-sm shrink-0 z-10">
                    <ChevronLeft className="text-gray-800" onClick={onClose} />
                    <span className="text-lg font-bold text-gray-900">考核</span>
                    <MoreHorizontal className="text-gray-800" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* Todo Card */}
                    <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">待处理</h3>
                            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex items-center">
                                <Clock size={10} className="mr-1" /> 即将到期
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-y-8 text-center">
                            <div className="flex flex-col items-center opacity-60">
                                <span className="text-2xl font-bold text-gray-900 mb-1 font-sans">13</span>
                                <span className="text-xs text-gray-500 flex items-center">计划制定</span>
                            </div>
                            <div className="flex flex-col items-center opacity-60">
                                <span className="text-2xl font-bold text-gray-900 mb-1 font-sans">1</span>
                                <span className="text-xs text-gray-500">计划审批</span>
                            </div>
                            <div className="flex flex-col items-center opacity-60">
                                <span className="text-2xl font-bold text-gray-900 mb-1 font-sans">0</span>
                                <span className="text-xs text-gray-500">完成值录入</span>
                            </div>
                            <div className="flex flex-col items-center opacity-60">
                                <span className="text-2xl font-bold text-gray-900 mb-1 font-sans">5</span>
                                <span className="text-xs text-gray-500">考核评分</span>
                            </div>
                            <div className="flex flex-col items-center opacity-60">
                                <span className="text-2xl font-bold text-gray-900 mb-1 font-sans">0</span>
                                <span className="text-xs text-gray-500">结果审核</span>
                            </div>
                            {/* Performance Interview Entry */}
                            <div 
                                className="flex flex-col items-center cursor-pointer relative group"
                                onClick={() => setWorkbenchView('interviewList')}
                            >
                                <span className="text-2xl font-bold text-blue-600 mb-1 font-sans group-hover:scale-110 transition-transform">{pendingInterviews.length}</span>
                                <span className="text-xs text-blue-600 font-bold">绩效面谈</span>
                                {pendingInterviews.length > 0 && (
                                    <span className="absolute top-0 right-4 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Banner / Ads */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg mb-4 flex items-center justify-between">
                        <div>
                            <div className="font-bold text-sm">2025 年度绩效启动</div>
                            <div className="text-[10px] opacity-80 mt-1">请各部门主管关注时间节点</div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                            <FileText size={20} className="text-white" />
                        </div>
                    </div>

                    {/* Watermark */}
                    <div className="mt-12 flex justify-center opacity-5">
                        <div className="text-5xl font-black text-gray-400 transform -rotate-12 select-none">
                            SmartPerf
                        </div>
                    </div>
                </div>
            </div>
          );
      } else if (workbenchView === 'interviewList') {
          // Interview List View
          return (
            <div className="flex-1 bg-[#F5F6F8] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="bg-white px-4 pt-12 pb-2 flex items-center justify-between shadow-sm shrink-0 z-10 border-b border-gray-100">
                    <ChevronLeft size={24} className="text-gray-600 cursor-pointer" onClick={() => setWorkbenchView('dashboard')} />
                    <span className="text-base font-bold text-gray-800">绩效面谈 ({pendingInterviews.length})</span>
                    <Filter size={20} className="text-gray-600" />
                </div>

                {/* Tabs */}
                <div className="bg-white px-4 pt-1 pb-0 flex items-center space-x-6 border-b border-gray-100 overflow-x-auto shrink-0 z-10 scrollbar-hide">
                    {['schedule', 'start', 'feedback', 'confirm', 'done'].map(tabKey => {
                        const labels: Record<string, string> = {
                            schedule: '待排期',
                            start: '待开始',
                            feedback: '待反馈',
                            confirm: '待确认',
                            done: '已完成'
                        };
                        const isActive = interviewListTab === tabKey;
                        const count = getMobileTabCount(tabKey);
                        return (
                            <button
                                key={tabKey}
                                onClick={() => setInterviewListTab(tabKey as any)}
                                className={`whitespace-nowrap pb-2 text-sm font-medium border-b-2 transition-colors flex items-center shrink-0 ${
                                    isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
                                }`}
                            >
                                {labels[tabKey]} 
                                {count > 0 && <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>{count}</span>}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {mobileFilteredSessions.map(session => (
                        <div key={session.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mr-3 border border-blue-100">
                                        {session.employeeName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{session.employeeName}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{session.period}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                    session.status === Status.Completed ? 'bg-green-50 text-green-600 border-green-200' :
                                    session.status === Status.InProgress ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                    'bg-gray-50 text-gray-600 border-gray-200'
                                }`}>
                                    {session.status}
                                </span>
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                {interviewListTab === 'schedule' || interviewListTab === 'start' ? (
                                    <>
                                        <Clock size={12} className="mr-1.5 text-orange-400" />
                                        <span className="mr-auto">
                                            {session.date ? `时间：${session.date}` : `截止：${session.deadline || '未设置'}`}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Calendar size={12} className="mr-1.5 text-gray-400" />
                                        <span className="mr-auto">考核周期：{session.assessmentCycle || '2025 Q4'}</span>
                                    </>
                                )}
                            </div>

                            {interviewListTab !== 'done' ? (
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    {interviewListTab === 'schedule' && (
                                        <>
                                            <button 
                                                onClick={() => {
                                                    setSelectedSession(session);
                                                    setWorkbenchView('schedule');
                                                }}
                                                className="flex items-center justify-center px-2 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg active:scale-95 transition-transform"
                                            >
                                                <Video size={14} className="mr-1.5" /> 预约面谈
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedSession(session);
                                                    setWorkbenchView('feedback');
                                                }}
                                                className="flex items-center justify-center px-2 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-sm shadow-blue-200 active:scale-95 transition-transform"
                                            >
                                                <Edit3 size={14} className="mr-1.5" /> 直接反馈
                                            </button>
                                        </>
                                    )}
                                    {interviewListTab === 'start' && (
                                        <button 
                                            onClick={() => {
                                                setSelectedSession(session);
                                                setWorkbenchView('prepare');
                                            }}
                                            className="col-span-2 flex items-center justify-center px-2 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-sm shadow-blue-200 active:scale-95 transition-transform"
                                        >
                                            <FileText size={14} className="mr-1.5" /> 查看详情
                                        </button>
                                    )}
                                    {interviewListTab === 'feedback' && (
                                        <button 
                                            onClick={() => {
                                                setSelectedSession(session);
                                                setWorkbenchView('feedback');
                                            }}
                                            className="col-span-2 flex items-center justify-center px-2 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-sm shadow-blue-200 active:scale-95 transition-transform"
                                        >
                                            <Edit3 size={14} className="mr-1.5" /> 填写反馈
                                        </button>
                                    )}
                                    {interviewListTab === 'confirm' && (
                                        <button 
                                            onClick={() => {
                                                setSelectedSession(session);
                                                setWorkbenchView('confirm');
                                            }}
                                            className="col-span-2 flex items-center justify-center px-2 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-sm shadow-blue-200 active:scale-95 transition-transform"
                                        >
                                            <CheckCircle2 size={14} className="mr-1.5" /> 确认面谈结果
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button 
                                    className="w-full flex items-center justify-center px-2 py-2 text-xs font-bold text-blue-600 bg-white border border-blue-200 rounded-lg active:scale-95 transition-transform"
                                >
                                    查看详情
                                </button>
                            )}
                        </div>
                    ))}
                    {mobileFilteredSessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 size={24} className="opacity-20" />
                            </div>
                            <p className="text-xs">暂无{
                                interviewListTab === 'schedule' ? '待排期' :
                                interviewListTab === 'start' ? '待开始' :
                                interviewListTab === 'feedback' ? '待反馈' :
                                interviewListTab === 'confirm' ? '待确认' : '已完成'
                            }任务</p>
                        </div>
                    )}
                </div>
            </div>
          );
      } else if (workbenchView === 'schedule') {
          return renderSchedule();
      } else if (workbenchView === 'feedback') {
          return renderFeedback();
      } else if (workbenchView === 'prepare') {
          return renderPrepare();
      } else if (workbenchView === 'confirm') {
          return renderConfirm();
      }
      return null;
  };

  const renderHistoryRecordDetail = () => {
      if (!selectedHistoryRecord) return null;
      const member = teamMembers.find(m => m.id === selectedTeamMember);
      
      // Mock template for display
      const template = MOCK_TEMPLATES[2]; // Standard Quarterly Interview

      return (
          <div className="flex-1 bg-[#F5F6F8] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 relative z-20">
              {/* Header */}
              <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm shrink-0 z-10 border-b border-gray-100">
                  <ChevronLeft 
                      size={24} 
                      className="text-gray-600 cursor-pointer mr-2" 
                      onClick={() => setTeamMemberView('detail')} 
                  />
                  <span className="text-base font-bold text-gray-800">面谈详情</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-6">
                  {/* Basic Info Card */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                      <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-3 border-dashed">
                          <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mr-3 border border-blue-100">
                                  {member?.name.charAt(0)}
                              </div>
                              <div>
                                  <div className="font-bold text-gray-900 text-sm">{member?.name}</div>
                                  <div className="text-xs text-gray-400 mt-0.5">{selectedHistoryRecord.date}</div>
                              </div>
                          </div>
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">已归档</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                          <div className="text-gray-500">面谈类型: <span className="text-gray-800 font-medium">{selectedHistoryRecord.type}</span></div>
                          <div className="text-gray-500">面谈官: <span className="text-gray-800 font-medium">{selectedHistoryRecord.manager}</span></div>
                      </div>
                  </div>

                  {/* Summary Section */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                      <div className="flex items-center mb-3">
                          <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg mr-2">
                              <Sparkles size={16} />
                          </div>
                          <h4 className="font-bold text-sm text-gray-800">面谈纪要</h4>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 leading-relaxed border border-gray-100">
                          {selectedHistoryRecord.summary}
                      </div>
                  </div>

                  {/* Form Content (Read-only Mock) */}
                  <div className="space-y-4">
                      {template.sections.map((section) => (
                          <div key={section.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                              <div className="flex items-center mb-3">
                                  <div className="w-1 h-3 bg-blue-500 rounded-full mr-2"></div>
                                  <h4 className="font-bold text-sm text-gray-800">{section.title}</h4>
                              </div>
                              <div className="space-y-4">
                                  {section.fields.map(field => (
                                      <div key={field.id}>
                                          <label className="block text-xs font-bold text-gray-500 mb-1">
                                              {field.label}
                                          </label>
                                          <div className="text-xs text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[40px]">
                                              {/* Mock content based on field label */}
                                              {field.label.includes('综述') ? selectedHistoryRecord.summary : 
                                               field.label.includes('成就') ? '1. 完成了核心模块重构\n2. 提升了系统稳定性' :
                                               field.label.includes('改进') ? '需加强跨部门沟通的主动性' :
                                               field.label.includes('目标') ? '下季度重点攻克性能优化难题' : '已达成共识'}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const renderTeamMemberDetail = () => {
      const member = teamMembers.find(m => m.id === selectedTeamMember);
      if (!member) return null;

      // Mock data mapping based on employeeId
      // In a real app, this would fetch from API
      // Using '1' for demo if no match found in mocks, or empty array
      const historyAssessments = MOCK_PERFORMANCE_TRENDS[member.employeeId] || MOCK_PERFORMANCE_TRENDS['1'] || [];
      const historyInterviews = MOCK_HISTORY_RECORDS[member.employeeId] || MOCK_HISTORY_RECORDS['1'] || [];

      return (
          <div className="flex-1 bg-[#F5F6F8] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 relative z-20">
              {/* Header */}
              <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm shrink-0 z-10 border-b border-gray-100">
                  <ChevronLeft 
                      size={24} 
                      className="text-gray-600 cursor-pointer mr-2" 
                      onClick={() => {
                          setTeamMemberView('list');
                          setSelectedTeamMember(null);
                      }} 
                  />
                  <span className="text-base font-bold text-gray-800">员工详情</span>
              </div>

              {/* Member Info Card */}
              <div className="bg-white p-4 mb-2 shadow-sm">
                  <div className="flex items-center">
                      <img src={member.avatar} alt="" className="w-12 h-12 rounded-full border border-gray-100 mr-3" />
                      <div>
                          <div className="flex items-center mb-1">
                              <span className="font-bold text-gray-900 text-base mr-2">{member.name}</span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">工号: {member.employeeId}</span>
                          </div>
                          <div className="text-xs text-gray-500">{member.department} | {member.role}</div>
                      </div>
                  </div>
              </div>

              {/* Tabs */}
              <div className="bg-white px-4 border-b border-gray-100 flex space-x-12 justify-center shadow-sm sticky top-0 z-10">
                  <button 
                      onClick={() => setTeamMemberDetailTab('assessment')}
                      className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${teamMemberDetailTab === 'assessment' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500'}`}
                  >
                      历史考核
                  </button>
                  <button 
                      onClick={() => setTeamMemberDetailTab('interview')}
                      className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${teamMemberDetailTab === 'interview' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500'}`}
                  >
                      历史面谈
                  </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-20">
                  {teamMemberDetailTab === 'assessment' && (
                      <div className="space-y-3 animate-in fade-in">
                          {historyAssessments.length > 0 ? (
                              historyAssessments.map((record, index) => (
                                  <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                      <div>
                                          <div className="font-bold text-gray-900 text-sm mb-1">{record.period} 绩效考核</div>
                                          <div className="text-xs text-gray-400">考核周期: {record.period}</div>
                                      </div>
                                      <div className="flex flex-col items-end">
                                          <span className={`text-lg font-bold ${
                                              ['S', 'A', 'A+'].includes(record.grade) ? 'text-green-600' : 
                                              ['B+', 'B'].includes(record.grade) ? 'text-blue-600' : 'text-orange-500'
                                          }`}>
                                              {record.grade}
                                          </span>
                                          <span className="text-xs text-gray-500">得分: {record.score}</span>
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <div className="text-center py-10 text-gray-400 text-xs">暂无历史考核记录</div>
                          )}
                      </div>
                  )}

                  {teamMemberDetailTab === 'interview' && (
                      <div className="space-y-3 animate-in fade-in">
                          {historyInterviews.length > 0 ? (
                              historyInterviews.map((record, index) => (
                                  <div 
                                    key={index} 
                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer"
                                    onClick={() => {
                                        setSelectedHistoryRecord(record);
                                        setTeamMemberView('record');
                                    }}
                                  >
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="font-bold text-gray-900 text-sm">{record.type}</div>
                                          <span className="text-xs text-gray-400">{record.date}</span>
                                      </div>
                                      <div className="text-xs text-gray-500 mb-2">面谈官: {record.manager}</div>
                                      <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 leading-relaxed line-clamp-2">
                                          {record.summary}
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <div className="text-center py-10 text-gray-400 text-xs">暂无历史面谈记录</div>
                          )}
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderTeam = () => {
      if (teamMemberView === 'record' && selectedHistoryRecord) {
          return renderHistoryRecordDetail();
      }
      if (teamMemberView === 'detail' && selectedTeamMember) {
          return renderTeamMemberDetail();
      }

      return (
      <div className="flex-1 bg-[#F5F6F8] flex flex-col overflow-hidden animate-in fade-in">
          {/* Header */}
          <div className="bg-white px-4 pt-12 pb-3 flex justify-between items-center shadow-sm shrink-0 z-10">
               <div className="w-6"></div>
               <span className="text-lg font-bold text-gray-900">团队绩效</span>
               <Search className="text-gray-800" size={20} />
          </div>

          {/* Tabs */}
          <div className="bg-white px-4 pt-1 flex justify-center space-x-12 text-sm text-gray-500 shrink-0 border-b border-gray-100 shadow-sm z-0">
              <button 
                onClick={() => setTeamTab('subordinate')}
                className={`pb-2 px-1 transition-colors ${teamTab === 'subordinate' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : ''}`}
              >
                  下属绩效
              </button>
              <button 
                onClick={() => setTeamTab('org')}
                className={`pb-2 px-1 transition-colors ${teamTab === 'org' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : ''}`}
              >
                  组织绩效
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {teamTab === 'subordinate' ? (
                  <div className="space-y-3">
                      {teamMembers.map(member => (
                          <div 
                            key={member.id} 
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 active:scale-95 transition-transform cursor-pointer"
                            onClick={() => {
                                setSelectedTeamMember(member.id);
                                setTeamMemberView('detail');
                            }}
                          >
                              {/* Header: Avatar, Name, ID, Dept/Role */}
                              <div className="flex items-start mb-3 pb-3 border-b border-gray-50 border-dashed">
                                  <img src={member.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-100 mr-3 mt-1" />
                                  <div>
                                      <div className="flex items-center mb-1">
                                          <span className="font-bold text-gray-900 text-sm mr-2">{member.name}</span>
                                          <span className="text-xs text-gray-400">工号: {member.employeeId}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">{member.department}/{member.role}</div>
                                  </div>
                              </div>
                              
                              {/* Details Section */}
                              <div className="space-y-2 pl-1">
                                  <div className="flex items-center text-xs">
                                      <span className="text-gray-400 w-28">最近一次考核周期:</span>
                                      <span className="text-gray-600">{member.latestCycle}</span>
                                  </div>
                                  <div className="flex items-center text-xs">
                                      <span className="text-gray-400 w-28">最近一次考核结束:</span>
                                      <div className="flex space-x-1">
                                          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">{member.latestScoreTag}</span>
                                          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">{member.latestGradeTag}</span>
                                      </div>
                                  </div>
                                  <div className="flex items-center text-xs">
                                      <span className="text-gray-400 w-28">总计参与考核数:</span>
                                      <span className="text-gray-600">{member.totalAssessments}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center text-gray-400 py-10 text-xs">
                      组织绩效数据加载中...
                  </div>
              )}
          </div>
      </div>
  );
  };

  const renderMe = () => (
      <div className="flex-1 bg-[#F5F6F8] flex flex-col overflow-hidden animate-in fade-in">
          {/* Header */}
          <div className="bg-white px-4 pt-12 pb-3 flex justify-between items-center shadow-sm shrink-0 z-10">
               <div className="w-6"></div>
               <span className="text-lg font-bold text-gray-900">我的绩效</span>
               <Bell className="text-gray-800" size={20} />
          </div>

          {/* Tabs */}
          <div className="bg-white px-4 pt-1 flex justify-center space-x-12 text-sm text-gray-500 shrink-0 border-b border-gray-100 shadow-sm z-0">
              <button 
                onClick={() => setMeTab('active')}
                className={`pb-2 px-1 transition-colors ${meTab === 'active' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : ''}`}
              >
                  进行中
              </button>
              <button 
                onClick={() => setMeTab('completed')}
                className={`pb-2 px-1 transition-colors ${meTab === 'completed' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : ''}`}
              >
                  已完成
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {meTab === 'active' ? (
                  <div className="space-y-3">
                      {myAssessments.map(item => (
                          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                              <div className="flex justify-between items-start mb-2 pl-2">
                                  <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.status}</span>
                              </div>
                              <div className="pl-2 text-xs text-gray-500 flex items-center">
                                  <Clock size={12} className="mr-1" /> 截止: {item.deadline}
                              </div>
                              <div className="mt-3 pl-2 pt-3 border-t border-gray-50 flex justify-end">
                                  <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">去处理</button>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="space-y-3">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 opacity-80">
                          <div className="flex justify-between items-center">
                              <h4 className="font-bold text-gray-900 text-sm">2025 Q3 绩效考核</h4>
                              <span className="text-xl font-bold text-gray-900">A</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">2025-10-15 归档</div>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-[375px] h-[750px] bg-[#F5F6F8] rounded-[2.5rem] overflow-hidden flex flex-col relative border-[8px] border-gray-900 shadow-2xl scale-95 lg:scale-100 transition-all">
            {/* Status Bar Mock */}
            <div className="h-11 bg-white flex justify-between items-end px-6 pb-2 shrink-0 select-none z-20">
                <span className="text-xs font-bold text-gray-900">{currentTime}</span>
                <div className="flex space-x-1.5 items-center">
                    <div className="h-2.5 w-2.5 bg-gray-900 rounded-full opacity-20"></div>
                    <div className="h-2.5 w-2.5 bg-gray-900 rounded-full opacity-20"></div>
                    <div className="w-5 h-3 bg-gray-900 rounded-[2px] opacity-20 relative">
                        <div className="absolute right-[-2px] top-[3px] h-1.5 w-[2px] bg-gray-900 rounded-r-[1px]"></div>
                    </div>
                </div>
            </div>

            {/* View Content */}
            {activeTab === 'workbench' && renderWorkbench()}
            {activeTab === 'team' && renderTeam()}
            {activeTab === 'me' && renderMe()}

            {/* Bottom Bar - Persistent */}
            {showBottomBar && (
            <div className="h-20 bg-white border-t border-gray-200 flex justify-around items-center shrink-0 pb-6 z-20 absolute bottom-0 left-0 right-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                <div 
                    className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'workbench' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setActiveTab('workbench')}
                >
                    <div className="w-6 h-6 mb-0.5 flex items-center justify-center">
                        <LayoutGrid size={22} className={activeTab === 'workbench' ? 'fill-blue-600' : ''} />
                    </div>
                    <span className="text-[10px] font-bold">工作台</span>
                </div>
                <div 
                    className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'team' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setActiveTab('team')}
                >
                    <div className="w-6 h-6 mb-0.5 flex items-center justify-center">
                        <Users size={22} className={activeTab === 'team' ? 'fill-blue-600' : ''} />
                    </div>
                    <span className="text-[10px] font-bold">团队</span>
                </div>
                <div 
                    className={`flex flex-col items-center cursor-pointer transition-colors ${activeTab === 'me' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setActiveTab('me')}
                >
                    <div className="w-6 h-6 mb-0.5 flex items-center justify-center">
                        <User size={22} className={activeTab === 'me' ? 'fill-blue-600' : ''} />
                    </div>
                    <span className="text-[10px] font-bold">我的</span>
                </div>
            </div>
            )}
            
            {/* Modal Layer */}
            {renderSubmitModal()}
            {renderSignatureModal()}

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full z-30 pointer-events-none opacity-20"></div>
        </div>
        
        {/* Exit Button */}
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md flex items-center space-x-2 text-sm font-medium border border-white/20"
        >
            <span>退出模拟</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-[10px]">✕</span>
            </div>
        </button>
    </div>
  );
};

export default MobileApp;
