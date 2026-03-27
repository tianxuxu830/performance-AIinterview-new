
import React, { useState, useEffect, useRef } from 'react';
import { 
    ChevronLeft, MoreHorizontal, Filter, Clock, ChevronRight, 
    User, Calendar, FileText, CheckCircle2, Star, Mic, Camera, 
    Send, LayoutGrid, Users, Briefcase, Search, Bell, Video, Edit3,
    MapPin, AlignLeft, BarChart2, Info, Sparkles, Target, Activity,
    ChevronDown, AlertTriangle, TrendingUp, Eye, ThumbsUp, Minus, X, RotateCw,
    Plus, Paperclip, MessageSquare
} from 'lucide-react';
import { InterviewSession, Status } from '../types';
import { MOCK_TEMPLATES, MOCK_ASSESSMENT_DETAILS, MOCK_HISTORY_RECORDS, MOCK_PERFORMANCE_TRENDS } from '../constants';
import InterviewDetailMobile from './InterviewDetailMobile';

interface MobileAppProps {
  sessions: InterviewSession[];
  onClose: () => void;
}

interface MobileFilterState {
  employeeName: string;
  managerName: string;
  topic: string;
  startDate: string;
  endDate: string;
}

const initialFilters: MobileFilterState = {
  employeeName: '',
  managerName: '',
  topic: '',
  startDate: '',
  endDate: '',
};

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
  
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);

  // Filter State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState<MobileFilterState>(initialFilters);
  const [tempFilters, setTempFilters] = useState<MobileFilterState>(initialFilters);

  // Feedback Form State
  const [feedbackFormValues, setFeedbackFormValues] = useState<Record<string, string>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);
  const [hasGeneratedAI, setHasGeneratedAI] = useState(false);
  
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
      // Tab filtering
      let tabMatch = false;
      if (interviewListTab === 'schedule') tabMatch = session.status === Status.NotStarted && (session.schedulingStatus === 'pending' || !session.schedulingStatus);
      else if (interviewListTab === 'start') tabMatch = session.status === Status.NotStarted && session.schedulingStatus === 'scheduled';
      else if (interviewListTab === 'feedback') tabMatch = session.status === Status.InProgress;
      else if (interviewListTab === 'confirm') tabMatch = session.status === Status.PendingConfirmation;
      else if (interviewListTab === 'done') tabMatch = session.status === Status.Completed;
      
      if (!tabMatch) return false;

      // Custom filters
      if (mobileFilters.employeeName && !session.employeeName.toLowerCase().includes(mobileFilters.employeeName.toLowerCase())) return false;
      if (mobileFilters.managerName && !session.managerName.toLowerCase().includes(mobileFilters.managerName.toLowerCase())) return false;
      if (mobileFilters.topic && !session.period.toLowerCase().includes(mobileFilters.topic.toLowerCase())) return false;
      
      if (mobileFilters.startDate || mobileFilters.endDate) {
          const dateToCompare = session.date ? session.date.split(' ')[0] : session.deadline;
          if (!dateToCompare) return false;
          
          const sessionDate = new Date(dateToCompare);
          if (mobileFilters.startDate && sessionDate < new Date(mobileFilters.startDate)) return false;
          if (mobileFilters.endDate && sessionDate > new Date(mobileFilters.endDate)) return false;
      }

      return true;
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
          totalAssessments: 99,
          status: '已完成'
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
          totalAssessments: 99,
          status: '待面谈'
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
          totalAssessments: 85,
          status: '已完成'
      },
  ];

  // Mock My Assessments
  const myAssessments = [
      { id: 'm1', name: '2025 Q4 绩效考核', period: '2025 Q4', status: 'active', deadline: '2025-12-31', stage: '自评中' },
      { id: 'm2', name: '2025 360互评', period: '2025 360', status: 'active', deadline: '2025-12-25', stage: '待评价' },
      { id: 'm3', name: '2025 Q3 绩效考核', period: '2025 Q3', status: 'completed', deadline: '2025-10-15', stage: '已归档', score: 92, grade: 'A' },
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
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    确认预约
                </button>
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
                    <span className="text-base font-bold text-gray-800">绩效面谈 ({mobileFilteredSessions.length})</span>
                    <Filter 
                        size={20} 
                        className={`cursor-pointer transition-colors ${Object.values(mobileFilters).some(v => v !== '') ? 'text-blue-600' : 'text-gray-600'}`} 
                        onClick={() => {
                            setTempFilters(mobileFilters);
                            setIsFilterDrawerOpen(true);
                        }}
                    />
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
                                            <CheckCircle2 size={14} className="mr-1.5" /> 确认结果
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
      } else if (workbenchView === 'feedback' || workbenchView === 'prepare' || workbenchView === 'confirm') {
          return selectedSession ? (
              <InterviewDetailMobile 
                  session={selectedSession} 
                  mode={workbenchView} 
                  onBack={() => setWorkbenchView('interviewList')}
                  onSubmit={() => {
                      setWorkbenchView('interviewList');
                  }}
              />
          ) : null;
      }
      return null;
  };

  const renderHistoryRecordDetail = () => {
      if (!selectedHistoryRecord) return null;
      const member = teamMembers.find(m => m.id === selectedTeamMember);
      
      // Mock breakdown data for the detailed view, matching AssessmentDetailMobile style
      const mockBreakdown = [
          {
              id: 'd1',
              name: '业绩指标',
              weight: 60,
              indicators: [
                  { id: 'i1', name: '销售额达成率', weight: 40, target: '100%', actual: '105%', score: 100 },
                  { id: 'i2', name: '新客户开发数', weight: 20, target: '10个', actual: '12个', score: 100 }
              ]
          },
          {
              id: 'd2',
              name: '能力素质',
              weight: 40,
              indicators: [
                  { id: 'i3', name: '团队协作', weight: 20, target: '良好', actual: '优秀', score: 95 },
                  { id: 'i4', name: '专业技能', weight: 20, target: '达标', actual: '达标', score: 90 }
              ]
          }
      ];

      return (
          <div className="flex-1 bg-[#F7F8FA] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 relative z-30">
              {/* Header */}
              <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm shrink-0 z-10 border-b border-gray-100 sticky top-0">
                  <ChevronLeft 
                      size={24} 
                      className="text-[#1D2129] cursor-pointer mr-2" 
                      onClick={() => setTeamMemberView('detail')} 
                  />
                  <span className="text-base font-bold text-[#1D2129] flex-1">考核详情</span>
                  <div className="flex items-center">
                      <span className="text-[11px] text-[#86909C] mr-1.5">明细</span>
                      <div className="w-8 h-4 bg-[#00B294] rounded-full relative">
                          <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                      </div>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {/* Basic Info Summary */}
                  <div className="bg-white p-4 mb-3">
                      <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-[#E6F7F4] text-[#00B294] flex items-center justify-center font-bold text-lg mr-3 shrink-0 border border-[#B3EBE1]">
                              {member?.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-bold text-[#1D2129] text-base">{member?.name}</h3>
                                  <span className="text-lg font-bold text-[#00B294]">{selectedHistoryRecord.grade}</span>
                              </div>
                              <div className="flex items-center text-xs text-[#86909C]">
                                  <span>{member?.employeeId}</span>
                                  <span className="mx-2">|</span>
                                  <span>{selectedHistoryRecord.date}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-50">
                          <div className="text-center">
                              <div className="text-[10px] text-[#86909C] mb-1">最终得分</div>
                              <div className="text-sm font-bold text-[#1D2129]">{selectedHistoryRecord.score}</div>
                          </div>
                          <div className="text-center border-x border-gray-50">
                              <div className="text-[10px] text-[#86909C] mb-1">考核等级</div>
                              <div className="text-sm font-bold text-[#1D2129]">{selectedHistoryRecord.grade}</div>
                          </div>
                          <div className="text-center">
                              <div className="text-[10px] text-[#86909C] mb-1">面谈状态</div>
                              <div className="text-sm font-bold text-[#00B294]">已完成</div>
                          </div>
                      </div>
                  </div>

                  {/* Breakdown Sections */}
                  <div className="px-3 pb-6 space-y-3">
                      {mockBreakdown.map((dim) => (
                          <div key={dim.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                                  <h4 className="text-[13px] font-bold text-[#1D2129]">
                                      {dim.name} <span className="text-[#86909C] font-normal text-[11px]">({dim.weight}%)</span>
                                  </h4>
                                  <span className="text-[11px] text-[#00B294] font-medium">得分: {dim.indicators.reduce((acc, i) => acc + i.score, 0) / dim.indicators.length}</span>
                              </div>
                              <div className="p-4 space-y-5">
                                  {dim.indicators.map((indicator, iIdx) => (
                                      <div key={indicator.id} className="relative">
                                          <div className="flex items-start mb-3">
                                              <div className="w-[3px] h-[14px] bg-[#00B294] rounded-full mr-2 mt-[3px] shrink-0" />
                                              <div className="flex-1">
                                                  <div className="flex items-center justify-between mb-1">
                                                      <h5 className="text-[13px] font-bold text-[#1D2129]">{indicator.name}</h5>
                                                      <span className="text-[12px] font-bold text-[#1D2129]">{indicator.score}分</span>
                                                  </div>
                                                  <div className="inline-flex px-2 py-0.5 bg-[#F2F3F5] rounded text-[10px] text-[#4E5969] font-medium">
                                                      权重 {indicator.weight}%
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="space-y-2 pl-[11px]">
                                              <div className="flex items-center text-[12px]">
                                                  <span className="text-[#86909C] w-16">目标值</span>
                                                  <span className="text-[#4E5969]">{indicator.target}</span>
                                              </div>
                                              <div className="flex items-center text-[12px]">
                                                  <span className="text-[#86909C] w-16">实际完成</span>
                                                  <span className="text-[#4E5969] font-medium">{indicator.actual}</span>
                                              </div>
                                          </div>
                                          {iIdx < dim.indicators.length - 1 && (
                                              <div className="mt-5 border-t border-dashed border-gray-100" />
                                          )}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}

                      {/* Summary Section */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                          <h4 className="text-[13px] font-bold text-[#1D2129] mb-3 flex items-center">
                              <Sparkles size={14} className="text-orange-400 mr-1.5" />
                              面谈总结
                          </h4>
                          <div className="text-[12px] text-[#4E5969] leading-relaxed bg-[#F9FAFB] p-3 rounded-lg border border-gray-50">
                              {selectedHistoryRecord.summary}
                          </div>
                      </div>
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
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar pb-20">
                  {teamMemberDetailTab === 'assessment' && (
                      <div className="space-y-3 animate-in fade-in">
                          {historyAssessments.length > 0 ? (
                              historyAssessments.map((record, index) => (
                                  <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center active:bg-gray-50 transition-colors">
                                      <div className="flex items-center">
                                          <div className="w-1 h-10 bg-[#00B294] rounded-full mr-3" />
                                          <div>
                                              <div className="font-bold text-[#1D2129] text-[13px] mb-1">{record.period} 绩效考核</div>
                                              <div className="text-[11px] text-[#86909C]">考核周期: {record.period}</div>
                                          </div>
                                      </div>
                                      <div className="flex flex-col items-end">
                                          <span className={`text-base font-bold ${
                                              ['S', 'A', 'A+'].includes(record.grade) ? 'text-[#00B294]' : 
                                              ['B+', 'B'].includes(record.grade) ? 'text-[#165DFF]' : 'text-[#FF7D00]'
                                          }`}>
                                              {record.grade}
                                          </span>
                                          <span className="text-[11px] text-[#86909C]">得分: {record.score}</span>
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
                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer hover:border-[#00B294]/30"
                                    onClick={() => {
                                        setSelectedHistoryRecord(record);
                                        setTeamMemberView('record');
                                    }}
                                  >
                                      <div className="flex justify-between items-center mb-3">
                                          <div className="flex items-center">
                                              <div className="w-8 h-8 rounded-lg bg-[#E6F7F4] flex items-center justify-center text-[#00B294] mr-2">
                                                  <Users size={16} />
                                              </div>
                                              <div className="font-bold text-[#1D2129] text-[13px]">{record.type}</div>
                                          </div>
                                          <span className="text-[11px] text-[#86909C]">{record.date}</span>
                                      </div>
                                      <div className="flex items-center text-[11px] text-[#4E5969] mb-3">
                                          <span className="bg-[#F2F3F5] px-2 py-0.5 rounded mr-2">面谈官: {record.manager}</span>
                                          <span className="bg-[#F2F3F5] px-2 py-0.5 rounded">状态: 已完成</span>
                                      </div>
                                      <div className="bg-[#F7F8FA] p-3 rounded-lg text-[11px] text-[#4E5969] leading-relaxed line-clamp-2 border border-gray-50">
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

          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {teamTab === 'subordinate' ? (
                  <div className="space-y-3">
                      {teamMembers.map(member => (
                          <div 
                            key={member.id} 
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 active:scale-[0.98] transition-all cursor-pointer hover:border-[#00B294]/30"
                            onClick={() => {
                                setSelectedTeamMember(member.id);
                                setTeamMemberView('detail');
                            }}
                          >
                              {/* Header: Avatar, Name, ID, Dept/Role */}
                              <div className="flex items-center mb-4">
                                  <div className="relative">
                                      <img src={member.avatar} alt="" className="w-12 h-12 rounded-full border border-gray-100 mr-3 shrink-0" />
                                      <div className={`absolute bottom-0 right-3 w-3 h-3 rounded-full border-2 border-white ${member.status === '已完成' ? 'bg-[#00B294]' : 'bg-[#FF7D00]'}`} />
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                          <span className="font-bold text-[#1D2129] text-[13px]">{member.name}</span>
                                          <span className="text-[11px] text-[#86909C]">工号: {member.employeeId}</span>
                                      </div>
                                      <div className="text-[11px] text-[#86909C]">{member.department} | {member.role}</div>
                                  </div>
                              </div>
                              
                              {/* Details Section */}
                              <div className="bg-[#F7F8FA] p-3 rounded-lg border border-gray-50 space-y-2">
                                  <div className="flex items-center text-[11px]">
                                      <span className="text-[#86909C] w-28">最近一次考核周期:</span>
                                      <span className="text-[#4E5969] font-medium">{member.latestCycle}</span>
                                  </div>
                                  <div className="flex items-center text-[11px]">
                                      <span className="text-[#86909C] w-28">最近一次考核结果:</span>
                                      <div className="flex space-x-1">
                                          <span className="bg-[#E8F3FF] text-[#165DFF] px-1.5 py-0.5 rounded text-[10px] border border-[#BEDAFF] font-bold">{member.latestScoreTag}</span>
                                          <span className="bg-[#E8F3FF] text-[#165DFF] px-1.5 py-0.5 rounded text-[10px] border border-[#BEDAFF] font-bold">{member.latestGradeTag}</span>
                                      </div>
                                  </div>
                                  <div className="flex items-center text-[11px]">
                                      <span className="text-[#86909C] w-28">总计参与考核数:</span>
                                      <span className="text-[#4E5969] font-bold">{member.totalAssessments}</span>
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

          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar pb-20">
              {meTab === 'active' ? (
                  <div className="space-y-3">
                      {myAssessments.filter(item => item.status === 'active').map(item => (
                          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-all">
                              <div className="flex items-center mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-[#E8F3FF] text-[#165DFF] flex items-center justify-center mr-3">
                                      <Clock size={16} />
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex items-center justify-between mb-0.5">
                                          <h4 className="font-bold text-[#1D2129] text-[13px]">{item.name}</h4>
                                          <span className="text-[10px] text-[#FF7D00] font-bold">待处理</span>
                                      </div>
                                      <div className="text-[11px] text-[#86909C]">截止日期: {item.deadline}</div>
                                  </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                  <div className="flex items-center space-x-4">
                                      <div>
                                          <div className="text-[9px] text-[#86909C] uppercase mb-0.5">当前阶段</div>
                                          <div className="text-[11px] font-medium text-[#4E5969]">{item.stage}</div>
                                      </div>
                                  </div>
                                  <button className="bg-[#00B294] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm active:bg-[#00967c]">
                                      去处理
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="space-y-3">
                      {myAssessments.filter(item => item.status === 'completed').map(item => (
                          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-all">
                              <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                                  <div className="absolute top-2 right-[-14px] bg-[#00B294] text-white text-[8px] font-bold py-0.5 px-4 rotate-45 shadow-sm">
                                      已完成
                                  </div>
                              </div>
                              <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-bold text-[#1D2129] text-[13px]">{item.name}</h4>
                                  <span className="text-xl font-bold text-[#00B294]">{item.grade}</span>
                              </div>
                              <div className="text-[11px] text-[#86909C]">{item.deadline} 归档</div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );

  const renderFilterDrawer = () => {
      if (!isFilterDrawerOpen) return null;

      return (
          <div className="fixed inset-0 bg-black/60 z-[110] flex items-end justify-center animate-in fade-in duration-300">
              <div className="bg-white rounded-t-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh]">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 flex items-center text-lg">
                          <Filter size={20} className="mr-2 text-blue-600" />
                          筛选条件
                      </h3>
                      <button 
                        onClick={() => setIsFilterDrawerOpen(false)} 
                        className="text-gray-400 p-2 active:scale-90 transition-transform"
                      >
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto space-y-6">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">面谈对象</label>
                          <input 
                              type="text" 
                              placeholder="搜索员工姓名"
                              value={tempFilters.employeeName}
                              onChange={(e) => setTempFilters({...tempFilters, employeeName: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition-colors"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">面谈官</label>
                          <input 
                              type="text" 
                              placeholder="搜索面谈官姓名"
                              value={tempFilters.managerName}
                              onChange={(e) => setTempFilters({...tempFilters, managerName: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition-colors"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">面谈主题</label>
                          <input 
                              type="text" 
                              placeholder="搜索面谈主题"
                              value={tempFilters.topic}
                              onChange={(e) => setTempFilters({...tempFilters, topic: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition-colors"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">日期范围</label>
                          <div className="grid grid-cols-2 gap-3">
                              <div className="relative">
                                  <input 
                                      type="date" 
                                      value={tempFilters.startDate}
                                      onChange={(e) => setTempFilters({...tempFilters, startDate: e.target.value})}
                                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none"
                                  />
                                  <Calendar size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                              </div>
                              <div className="relative">
                                  <input 
                                      type="date" 
                                      value={tempFilters.endDate}
                                      onChange={(e) => setTempFilters({...tempFilters, endDate: e.target.value})}
                                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none"
                                  />
                                  <Calendar size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="px-6 py-6 border-t border-gray-100 flex space-x-4 bg-white pb-10">
                      <button 
                          onClick={() => {
                              setTempFilters(initialFilters);
                              setMobileFilters(initialFilters);
                              setIsFilterDrawerOpen(false);
                          }}
                          className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-2xl text-base font-bold active:scale-95 transition-transform"
                      >
                          重置
                      </button>
                      <button 
                          onClick={() => {
                              setMobileFilters(tempFilters);
                              setIsFilterDrawerOpen(false);
                          }}
                          className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-base font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                      >
                          查看结果
                      </button>
                  </div>
              </div>
          </div>
      );
  };

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
            {renderFilterDrawer()}

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
