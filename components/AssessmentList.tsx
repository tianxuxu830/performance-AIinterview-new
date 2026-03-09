
import React, { useState } from 'react';
import { 
    Search, ChevronDown, CheckCircle2, Clock, MoreHorizontal, 
    User, MessageSquarePlus, Calendar as CalendarIcon, AlertCircle, Video, 
    FileText, Trash2, Download, Archive, Edit3, X,
    TrendingUp, TrendingDown, Minus, Users, Bell,
    Briefcase, PlayCircle, CheckCircle, ArrowLeft,
    MessageSquare, Mail, AlertTriangle
} from 'lucide-react';
import { MOCK_ASSESSMENTS, MOCK_PERFORMANCE_TRENDS, MOCK_EMPLOYEES } from '../constants';
import { InterviewSession, Status } from '../types';

interface AssessmentListProps {
  onInitiateInterview: (employeeIds: string[]) => void;
  sessions: InterviewSession[];
  onScheduleSession: (session: InterviewSession) => void;
  onSelectSession: (session: InterviewSession) => void;
  onCancelSession: (id: string) => void;
  onBatchUpdateSessions: (ids: string[], updates: Partial<InterviewSession>) => void;
  onBack?: () => void; // New prop for navigation
  taskName?: string; // New prop for dynamic title
}

const AssessmentList: React.FC<AssessmentListProps> = ({ 
    onInitiateInterview, 
    sessions, 
    onScheduleSession, 
    onSelectSession,
    onCancelSession,
    onBatchUpdateSessions,
    onBack,
    taskName = '业绩考核5月'
}) => {
  const [activeTab, setActiveTab] = useState<'assessment' | 'interview'>('assessment');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [interviewSelectedIds, setInterviewSelectedIds] = useState<Set<string>>(new Set());
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Modal States
  const [isBatchTimeModalOpen, setIsBatchTimeModalOpen] = useState(false);
  const [isBatchInterviewerModalOpen, setIsBatchInterviewerModalOpen] = useState(false);
  const [isBatchRemindModalOpen, setIsBatchRemindModalOpen] = useState(false);
  const [isBatchCancelModalOpen, setIsBatchCancelModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<InterviewSession | null>(null);

  // Single Remind Modal State
  const [isRemindModalOpen, setIsRemindModalOpen] = useState(false);
  const [remindSession, setRemindSession] = useState<InterviewSession | null>(null);
  const [remindChannels, setRemindChannels] = useState<string[]>(['message']);
  const [remindNote, setRemindNote] = useState('');

  // Single Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState<InterviewSession | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [notifyStakeholders, setNotifyStakeholders] = useState(true);

  // Form States for Modals
  const [batchDate, setBatchDate] = useState('');
  const [batchDeadline, setBatchDeadline] = useState('');
  const [batchInterviewers, setBatchInterviewers] = useState<string[]>(['直属上级']);
  const [isBatchInterviewerDropdownOpen, setIsBatchInterviewerDropdownOpen] = useState(false);
  const [batchRemindChannels, setBatchRemindChannels] = useState<string[]>(['message']);
  const [batchRemindUnreadOnly, setBatchRemindUnreadOnly] = useState(true);
  const [batchCancelReason, setBatchCancelReason] = useState('');
  const [batchNotifyStakeholders, setBatchNotifyStakeholders] = useState(true);

  const [editForm, setEditForm] = useState({
      topic: '',
      managerName: '',
      date: '',
      deadline: ''
  });

  // Filter sessions specifically for this Assessment Cycle ("业绩考核5月")
  // In a real app, this would use taskName or an ID. For mock purposes, we loosely filter.
  const contextSessions = sessions.filter(s => s.period.includes('考核') || s.assessmentCycle === taskName);



  const steps = [
    { label: '开始', status: 'completed' },
    { label: '目标设定', status: 'completed' },
    { label: '上级审批', status: 'completed' },
    { label: '自评', status: 'current', pending: 3 },
    { label: '上级评估', status: 'pending', pending: 6 },
    { label: '结果校准', status: 'pending', pending: 337 },
    { label: '员工确认', status: 'pending' },
    { label: '结束', status: 'pending' },
  ];

  // Assessment Table Selection Logic
  const handleCheckboxChange = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(MOCK_ASSESSMENTS.map(item => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Interview Table Selection Logic
  const handleInterviewCheckboxChange = (id: string) => {
      const newSet = new Set(interviewSelectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setInterviewSelectedIds(newSet);
  };

  const handleInterviewSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setInterviewSelectedIds(new Set(contextSessions.map(s => s.id)));
      } else {
          setInterviewSelectedIds(new Set());
      }
  };

  const handleInitiateClick = (specificId?: string) => {
    if (specificId) {
       const assessment = MOCK_ASSESSMENTS.find(a => a.id === specificId);
       if(assessment) onInitiateInterview([assessment.employeeId]);
    } else if (selectedIds.size > 0) {
      const selectedAssessmentItems = MOCK_ASSESSMENTS.filter(a => selectedIds.has(a.id));
      const employeeIds = selectedAssessmentItems.map(a => a.employeeId);
      const uniqueEmployeeIds = Array.from(new Set(employeeIds));
      onInitiateInterview(uniqueEmployeeIds);
    }
  };

  const handleRemind = (e: React.MouseEvent, session: InterviewSession) => {
      e.stopPropagation();
      setRemindSession(session);
      setIsRemindModalOpen(true);
  };

  const confirmRemind = () => {
      if (remindSession) {
          alert(`催办已发送，可在通知记录中查看送达状态。`);
          setIsRemindModalOpen(false);
          setRemindSession(null);
      }
  };

  const handleBatchRemind = () => {
      if (interviewSelectedIds.size === 0) return;
      setIsBatchRemindModalOpen(true);
  };

  const confirmBatchRemind = () => {
      alert(`催办发送成功，共发送 ${interviewSelectedIds.size} 条提醒。`);
      setIsBatchRemindModalOpen(false);
      setInterviewSelectedIds(new Set());
  };

  const handleBatchCancel = () => {
      if (interviewSelectedIds.size === 0) return;
      setIsBatchCancelModalOpen(true);
  };

  const confirmBatchCancel = () => {
      if (!batchCancelReason.trim()) {
          alert('请填写取消原因');
          return;
      }
      alert(`批量取消成功，共取消 ${interviewSelectedIds.size} 条任务。`);
      setIsBatchCancelModalOpen(false);
      setInterviewSelectedIds(new Set());
      setBatchCancelReason('');
  };

  // --- Batch Update Handlers ---
  const submitBatchTime = () => {
      const updates: Partial<InterviewSession> = {};
      updates.deadline = batchDeadline;
      updates.schedulingStatus = 'pending';
      onBatchUpdateSessions(Array.from(interviewSelectedIds), updates);
      setIsBatchTimeModalOpen(false);
      setInterviewSelectedIds(new Set());
  };

  const submitBatchInterviewer = () => {
      onBatchUpdateSessions(Array.from(interviewSelectedIds), { managerName: batchInterviewers.join('、') });
      setIsBatchInterviewerModalOpen(false);
      setInterviewSelectedIds(new Set());
  };

  // --- Single Cancel Handlers ---
  const handleCancelClick = (e: React.MouseEvent, session: InterviewSession) => {
      e.stopPropagation();
      setSessionToCancel(session);
      setCancelModalOpen(true);
  };

  const confirmCancel = () => {
      if (!cancelReason.trim() || cancelReason.length < 2 || cancelReason.length > 200) {
          alert('请填写2~200字的取消原因。');
          return;
      }
      if (sessionToCancel) {
          onCancelSession(sessionToCancel.id);
          alert('面谈任务已取消，并已从业务列表移除。');
          setCancelModalOpen(false);
          setSessionToCancel(null);
          setCancelReason('');
      }
  };

  // --- Single Edit Handlers ---
  const handleEditSession = (session: InterviewSession) => {
      setEditingSession(session);
      setEditForm({
          topic: session.period,
          managerName: session.managerName,
          date: session.date,
          deadline: session.deadline || ''
      });
      setIsEditModalOpen(true);
      setOpenActionId(null);
  };

  const submitEditSession = () => {
      if (editingSession) {
          onBatchUpdateSessions([editingSession.id], {
              period: editForm.topic,
              managerName: editForm.managerName,
              date: editForm.date,
              deadline: editForm.deadline,
              schedulingStatus: editForm.date ? 'scheduled' : 'pending'
          });
          setIsEditModalOpen(false);
          setEditingSession(null);
      }
  };

  // Helper to render Liquid Grade Badge
  const renderLiquidGrade = (grade: string, employeeId: string) => {
      // Determine style based on grade
      let bgGradient = 'from-gray-100 to-gray-200';
      let textColor = 'text-gray-600';
      let shadowColor = 'shadow-gray-200';

      if (['S', 'A', 'A+'].includes(grade)) {
          bgGradient = 'from-green-100 to-emerald-200';
          textColor = 'text-emerald-700';
          shadowColor = 'shadow-emerald-200';
      } else if (['B+', 'B'].includes(grade)) {
          bgGradient = 'from-blue-100 to-indigo-200';
          textColor = 'text-blue-700';
          shadowColor = 'shadow-blue-200';
      } else if (['C', 'D'].includes(grade)) {
          bgGradient = 'from-orange-100 to-red-200';
          textColor = 'text-red-700';
          shadowColor = 'shadow-red-200';
      }

      // Mock Trend Logic
      const trendData = MOCK_PERFORMANCE_TRENDS[employeeId] || MOCK_PERFORMANCE_TRENDS['default'];
      const lastScore = trendData[trendData.length - 1]?.score || 0;
      const prevScore = trendData[trendData.length - 2]?.score || 0;
      let TrendIcon = Minus;
      let trendColor = 'text-gray-400';
      
      if (lastScore > prevScore) {
          TrendIcon = TrendingUp;
          trendColor = 'text-emerald-500'; 
      } else if (lastScore < prevScore) {
          TrendIcon = TrendingDown;
          trendColor = 'text-orange-500';
      }

      return (
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleInitiateClick(employeeId)}> {/* Clicking could show detail modal */}
              <div className={`
                  relative w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner
                  bg-gradient-to-br ${bgGradient} ${textColor}
                  border border-white/60 backdrop-blur-sm
                  group-hover:scale-110 transition-transform duration-300
              `}>
                  {/* Glossy Reflection */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-xl pointer-events-none"></div>
                  {grade}
              </div>
              
              {/* Trend Indicator */}
              <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-medium">上期对比</span>
                  <div className={`flex items-center text-xs font-bold ${trendColor}`}>
                      <TrendIcon size={12} className="mr-0.5" />
                      {Math.abs(lastScore - prevScore).toFixed(1)}
                  </div>
              </div>
          </div>
      );
  };

  const renderAssessmentTable = () => (
      <div className="bg-white border border-gray-200 shadow-sm flex-1 overflow-auto custom-scrollbar rounded-t-lg">
          <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                      <th className="p-3 border-b border-gray-200 w-10 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 cursor-pointer text-blue-600 focus:ring-blue-500"
                            onChange={handleSelectAll}
                            checked={selectedIds.size === MOCK_ASSESSMENTS.length && MOCK_ASSESSMENTS.length > 0}
                          />
                      </th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">员工姓名/角色</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">员工状态</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">当前阶段</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">状态</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">当前处理人</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">考核组</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">模板</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">指标模板</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">最终得分</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">绩效等级</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600 text-right min-w-[150px]">操作</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {MOCK_ASSESSMENTS.map((item) => (
                      <tr key={item.id} className={`hover:bg-blue-50/50 transition-colors ${selectedIds.has(item.id) ? 'bg-blue-50/30' : ''}`}>
                          <td className="p-3 text-center">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 cursor-pointer text-blue-600 focus:ring-blue-500"
                                checked={selectedIds.has(item.id)}
                                onChange={() => handleCheckboxChange(item.id)}
                              />
                          </td>
                          <td className="p-3">
                              <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs mr-2">
                                      <User size={16} />
                                  </div>
                                  <div>
                                      <div className="text-gray-900 font-medium">{item.employeeName}</div>
                                      <div className="text-xs text-gray-500">{item.role}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="p-3 text-gray-600">{item.employeeStatus}</td>
                          <td className="p-3 text-gray-600">{item.currentStage}</td>
                          <td className="p-3 text-gray-600">{item.processStatus}</td>
                          <td className="p-3 text-gray-600">{item.handler}</td>
                          <td className="p-3 text-gray-600">{item.group}</td>
                          <td className="p-3 text-gray-600">{item.templateName}</td>
                          <td className="p-3 text-gray-600">{item.indicatorTemplate}</td>
                          <td className="p-3 text-gray-900 font-medium">{item.score.toFixed(2)}</td>
                          <td className="p-3">
                              {renderLiquidGrade(item.grade, item.employeeId)}
                          </td>
                          <td className="p-3 text-right">
                              <div className="flex justify-end space-x-3 text-blue-600 text-xs">
                                  <button className="hover:underline">考核关系</button>
                                  <button className="hover:underline">调整结果</button>
                                  <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  const renderInterviewTable = () => {
      // NOTE: This empty state is theoretically unreachable if the tab is hidden when empty
      if (contextSessions.length === 0) {
          return (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-lg shadow-sm h-full">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-in fade-in zoom-in">
                      <MessageSquarePlus size={32} className="text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">暂无面谈数据</h3>
                  <p className="text-sm text-gray-500 max-w-md text-center leading-relaxed mb-6">
                      当前尚未发起任何绩效面谈任务。<br/>请前往【考核管理】标签页，勾选需要面谈的员工并点击“发起面谈”按钮。
                  </p>
                  <button 
                    onClick={() => setActiveTab('assessment')} 
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow-md flex items-center"
                  >
                      前往考核管理 <ChevronDown className="ml-2 transform -rotate-90" size={16} />
                  </button>
              </div>
          );
      }

      return (
        <div className="bg-white border border-gray-200 shadow-sm flex-1 overflow-auto custom-scrollbar rounded-t-lg pb-32">
          <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                      <th className="p-3 border-b border-gray-200 w-10 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 cursor-pointer text-blue-600 focus:ring-blue-500"
                            onChange={handleInterviewSelectAll}
                            checked={contextSessions.length > 0 && interviewSelectedIds.size === contextSessions.length}
                          />
                      </th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">被面谈人</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">部门/职位</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">最近绩效结果</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">面谈状态</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">面谈时间/截止</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">面谈方式</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600">面谈官</th>
                      <th className="p-3 border-b border-gray-200 font-medium text-gray-600 text-right min-w-[140px]">操作</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {contextSessions.map((session) => {
                      // Lookup auxiliary info
                      const employee = MOCK_EMPLOYEES.find(e => e.id === session.employeeId);
                      const assessment = MOCK_ASSESSMENTS.find(a => a.employeeId === session.employeeId);
                      const grade = session.gradeTag || assessment?.grade || '-';
                      const department = session.department || employee?.department || '-';
                      const role = employee?.role || assessment?.role || '-';

                      // Calculate urgency/date display
                      let dateDisplay = '-';
                      let urgencyTag = null;
                      if (session.date) {
                          dateDisplay = session.date;
                      } else if (session.deadline) {
                          dateDisplay = session.deadline;
                          const deadlineDate = new Date(session.deadline);
                          const today = new Date();
                          const diffTime = deadlineDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays < 0) {
                              urgencyTag = <span className="text-red-500 text-[10px] ml-2 flex items-center bg-red-50 px-1 rounded"><AlertCircle size={10} className="mr-0.5"/> 逾期</span>;
                          } else if (diffDays <= 3) {
                              urgencyTag = <span className="text-orange-500 text-[10px] ml-2 flex items-center bg-orange-50 px-1 rounded"><Clock size={10} className="mr-0.5"/> 剩{diffDays}天</span>;
                          }
                      } else {
                          dateDisplay = '待定';
                      }

                      return (
                          <tr key={session.id} className={`hover:bg-blue-50/50 transition-colors relative group ${interviewSelectedIds.has(session.id) ? 'bg-blue-50/30' : ''}`}>
                              <td className="p-3 text-center">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 cursor-pointer text-blue-600 focus:ring-blue-500"
                                    checked={interviewSelectedIds.has(session.id)}
                                    onChange={() => handleInterviewCheckboxChange(session.id)}
                                  />
                              </td>
                              <td className="p-3">
                                  <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2 font-bold">
                                          {session.employeeName.charAt(0)}
                                      </div>
                                      <div>
                                          <div className="text-gray-900 font-medium">{session.employeeName}</div>
                                          <div className="text-xs text-gray-500">{session.employeeId}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-3">
                                   <div className="text-gray-900">{department}</div>
                                   <div className="text-xs text-gray-500">{role}</div>
                              </td>
                              <td className="p-3">
                                  {renderLiquidGrade(grade, session.employeeId)}
                              </td>
                              <td className="p-3">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                      ${session.status === Status.Completed ? 'bg-green-100 text-green-700' : 
                                        session.status === Status.InProgress ? 'bg-blue-100 text-blue-700' : 
                                        'bg-gray-100 text-gray-700'}`}>
                                      {session.status}
                                  </span>
                              </td>
                              <td className="p-3 text-gray-600">
                                  <div className="flex items-center">
                                      {session.date ? <Clock size={12} className="mr-1 text-gray-400" /> : <AlertCircle size={12} className="mr-1 text-gray-400" />}
                                      <span className={session.date ? "text-gray-900" : "text-gray-500 text-xs"}>
                                         {session.date ? dateDisplay : `截止: ${dateDisplay}`}
                                      </span>
                                      {urgencyTag}
                                  </div>
                              </td>
                              <td className="p-3 text-gray-600">
                                  {session.method === 'appointment' ? '预约面谈' : session.method === 'direct' ? '直接反馈' : '-'}
                              </td>
                              <td className="p-3 text-gray-600">
                                  {session.managerName || '-'}
                              </td>
                                  <td className="p-3 text-right">
                                      {(() => {
                                          const isPendingSchedule = session.status === Status.NotStarted && (session.schedulingStatus === 'pending' || !session.schedulingStatus);
                                          const isScheduled = session.status === Status.NotStarted && session.schedulingStatus === 'scheduled';
                                          const isInProgress = session.status === Status.InProgress;
                                          const isPendingConfirmation = session.status === Status.PendingConfirmation;
                                          const isCompleted = session.status === Status.Completed;

                                          interface ActionItem {
                                              label: string;
                                              onClick: (e: React.MouseEvent) => void;
                                              variant?: 'primary' | 'danger' | 'default';
                                          }

                                          let actions: ActionItem[] = [];

                                          if (isPendingSchedule) {
                                              actions = [
                                                  { label: '预约会议', onClick: () => onScheduleSession(session), variant: 'primary' },
                                                  { label: '编辑', onClick: () => handleEditSession(session), variant: 'default' },
                                                  { label: '直接反馈', onClick: () => alert('直接反馈功能开发中'), variant: 'default' },
                                                  { label: '催办', onClick: (e) => handleRemind(e, session), variant: 'default' },
                                                  { label: '取消', onClick: (e) => handleCancelClick(e, session), variant: 'danger' },
                                              ];
                                          } else if (isScheduled) {
                                              actions = [
                                                  { label: '编辑', onClick: () => handleEditSession(session), variant: 'default' },
                                                  { label: '直接反馈', onClick: () => alert('直接反馈功能开发中'), variant: 'default' },
                                                  { label: '取消', onClick: (e) => handleCancelClick(e, session), variant: 'danger' },
                                              ];
                                          } else if (isInProgress) {
                                              actions = [
                                                  { label: '查看详情', onClick: () => onSelectSession(session), variant: 'primary' },
                                              ];
                                          } else if (isPendingConfirmation) {
                                              actions = [
                                                  { label: '详情', onClick: () => onSelectSession(session), variant: 'default' },
                                                  { label: '直接确认', onClick: () => alert('已代确认'), variant: 'primary' },
                                                  { label: '催办', onClick: (e) => handleRemind(e, session), variant: 'default' },
                                              ];
                                          } else if (isCompleted) {
                                              actions = [
                                                  { label: '查看详情', onClick: () => onSelectSession(session), variant: 'primary' },
                                              ];
                                          }

                                          const visibleActions = actions.slice(0, 2);
                                          const hiddenActions = actions.slice(2);

                                          return (
                                              <div className="flex items-center justify-end space-x-3 text-xs">
                                                  {visibleActions.map((action, idx) => (
                                                      <button
                                                          key={idx}
                                                          onClick={(e) => { e.stopPropagation(); action.onClick(e); }}
                                                          className={`font-medium whitespace-nowrap transition-colors ${
                                                              action.variant === 'primary' ? 'text-blue-600 hover:text-blue-800' :
                                                              action.variant === 'danger' ? 'text-gray-500 hover:text-red-600' :
                                                              'text-gray-500 hover:text-gray-800'
                                                          }`}
                                                      >
                                                          {action.label}
                                                      </button>
                                                  ))}
                                                  
                                                  {(visibleActions.length > 0 && hiddenActions.length > 0) && (
                                                      <div className="w-px h-3 bg-gray-300"></div>
                                                  )}

                                                  {hiddenActions.length > 0 && (
                                                      <div className="relative">
                                                          <button 
                                                              onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  setOpenActionId(openActionId === session.id ? null : session.id);
                                                              }}
                                                              className={`p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ${openActionId === session.id ? 'bg-gray-100 text-gray-600' : ''}`}
                                                          >
                                                              <MoreHorizontal size={16} />
                                                          </button>

                                                          {openActionId === session.id && (
                                                              <>
                                                                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenActionId(null); }}></div>
                                                                  <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-xs text-gray-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                                      {hiddenActions.map((action, idx) => (
                                                                          <button 
                                                                              key={idx}
                                                                              onClick={(e) => {
                                                                                  e.stopPropagation();
                                                                                  action.onClick(e);
                                                                                  setOpenActionId(null);
                                                                              }}
                                                                              className={`w-full text-left px-4 py-2 hover:bg-gray-50 block transition-colors ${
                                                                                  action.variant === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                                                                              }`}
                                                                          >
                                                                              {action.label}
                                                                          </button>
                                                                      ))}
                                                                  </div>
                                                              </>
                                                          )}
                                                      </div>
                                                  )}
                                              </div>
                                          );
                                      })()}
                                  </td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden relative">
      {/* Header Info */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center mb-4">
           {onBack && (
               <button 
                   onClick={onBack}
                   className="mr-3 p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
               >
                   <ArrowLeft size={20} />
               </button>
           )}
           <h1 className="text-xl font-bold text-gray-800">{taskName}</h1>
           <span className="ml-3 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded border border-green-200">进行中</span>
           <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded border border-orange-200">需要关注问题[3项]</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-6 border-b border-gray-100">
           <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700">进度管理</button>
           <button 
                onClick={() => setActiveTab('assessment')}
                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'assessment' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                考核管理
            </button>
           <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700">结果校准</button>
           {/* Only show Interview Tab if there are sessions created for this cycle */}
           {contextSessions.length > 0 && (
               <button 
                    onClick={() => setActiveTab('interview')}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'interview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
               >
                    绩效面谈
               </button>
           )}
        </div>
      </div>
      
      {/* Process Timeline - Only visible in Assessment Tab */}
      {activeTab === 'assessment' && (
        <div className="bg-white px-6 py-6 border-b border-gray-200 mb-4 shadow-sm overflow-x-auto">
            <div className="flex items-start justify-between min-w-[800px]">
                {steps.map((step, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center relative group">
                        {/* Line */}
                        {index < steps.length - 1 && (
                            <div className={`absolute top-3 left-1/2 w-full h-0.5 ${step.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'} -z-10`}></div>
                        )}
                        
                        {/* Circle */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 mb-2 z-10 
                            ${step.status === 'completed' ? 'bg-white border-green-500 text-green-500' : 
                            step.status === 'current' ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                            {step.status === 'completed' ? <CheckCircle2 size={14} /> : (index + 1)}
                        </div>
                        
                        {/* Label */}
                        <div className={`text-xs font-medium ${step.status === 'current' ? 'text-green-600' : 'text-gray-500'}`}>{step.label}</div>
                        
                        {/* Pending Badge */}
                        {step.pending && (
                            <div className="mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full">未完成 {step.pending}人</div>
                        )}
                    </div>
                ))}
                <div className="ml-4 text-xs text-gray-400 self-center">全部 359人</div>
            </div>
        </div>
      )}



      {/* Main Content Area */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
          {/* Controls */}
          {activeTab === 'assessment' && (
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    {selectedIds.size > 0 && (
                        <button 
                            onClick={() => handleInitiateClick()}
                            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded shadow-sm hover:bg-blue-700 flex items-center transition-all animate-in fade-in"
                        >
                            <MessageSquarePlus size={16} className="mr-2" />
                            发起面谈 ({selectedIds.size})
                        </button>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 bg-white border border-blue-300 text-blue-600 text-sm rounded hover:bg-blue-50 flex items-center">
                        添加被考核对象 <ChevronDown size={14} className="ml-1" />
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-blue-300 text-blue-600 text-sm rounded hover:bg-blue-50 flex items-center">
                        流程干预 <ChevronDown size={14} className="ml-1" />
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-blue-300 text-blue-600 text-sm rounded hover:bg-blue-50 flex items-center">
                        更多操作 <ChevronDown size={14} className="ml-1" />
                    </button>
                </div>
            </div>
          )}

          {activeTab === 'interview' && contextSessions.length > 0 && (
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center text-sm text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded mr-2 font-bold">小贴士</span>
                    面谈数据将自动同步至【待办-绩效面谈】列表中，相关人员可前往处理。
                </div>
                 <div className="flex items-center space-x-2">
                    {/* Batch Operations Dropdown */}
                    <div className="relative group">
                        <button className={`px-3 py-1.5 bg-white border border-gray-300 rounded text-sm flex items-center transition-all animate-in fade-in ${interviewSelectedIds.size === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}>
                            批量操作 ({interviewSelectedIds.size}) <ChevronDown size={14} className="ml-1.5" />
                        </button>
                        {interviewSelectedIds.size > 0 && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-sm text-gray-700 hidden group-hover:block animate-in fade-in zoom-in-95">
                                <button onClick={handleBatchRemind} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center text-orange-600 hover:bg-orange-50">
                                    <Bell size={14} className="mr-2" /> 批量催办
                                </button>
                                <button onClick={() => setIsBatchTimeModalOpen(true)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center">
                                    <CalendarIcon size={14} className="mr-2" /> 批量修改时间
                                </button>
                                <button onClick={() => setIsBatchInterviewerModalOpen(true)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center">
                                    <User size={14} className="mr-2" /> 批量更换面谈官
                                </button>
                                <button onClick={handleBatchCancel} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center text-red-600 hover:bg-red-50">
                                    <X size={14} className="mr-2" /> 批量取消
                                </button>
                            </div>
                        )}
                    </div>
                </div>
             </div>
          )}

          {/* Table Container */}
          {activeTab === 'assessment' ? renderAssessmentTable() : renderInterviewTable()}
          
          {/* Pagination */}
          {!(activeTab === 'interview' && contextSessions.length === 0) && (
            <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-end space-x-2 mt-auto rounded-b-lg">
               <button className="px-2 py-1 border rounded text-xs text-gray-600 hover:bg-gray-50">&lt;</button>
               <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded border border-blue-600">1</button>
               <button className="px-2 py-1 border rounded text-xs text-gray-600 hover:bg-gray-50">2</button>
               <button className="px-2 py-1 border rounded text-xs text-gray-600 hover:bg-gray-50">3</button>
               <span className="text-xs text-gray-400">...</span>
               <button className="px-2 py-1 border rounded text-xs text-gray-600 hover:bg-gray-50">36</button>
               <button className="px-2 py-1 border rounded text-xs text-gray-600 hover:bg-gray-50">&gt;</button>
               <select className="border border-gray-300 rounded text-xs px-1 py-1">
                   <option>10 条/页</option>
               </select>
               <span className="text-xs text-gray-500">跳至</span>
               <input type="text" className="w-10 border border-gray-300 rounded text-xs px-1 py-1 text-center" />
               <span className="text-xs text-gray-500">页</span>
            </div>
          )}
      </div>

      {/* --- Batch Remind Modal --- */}
      {isBatchRemindModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] animate-in zoom-in-95">
                  <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                          <Bell size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">批量催办提醒</h3>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6">
                      <div className="flex items-center text-sm text-orange-800">
                          <AlertCircle size={16} className="mr-2" />
                          <span>即将向 <span className="font-bold">{interviewSelectedIds.size}</span> 位面谈对象发送催办提醒</span>
                      </div>
                  </div>

                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">通知渠道</label>
                          <div className="flex space-x-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                      type="checkbox" 
                                      checked={batchRemindChannels.includes('message')}
                                      onChange={(e) => {
                                          if (e.target.checked) setBatchRemindChannels([...batchRemindChannels, 'message']);
                                          else setBatchRemindChannels(batchRemindChannels.filter(c => c !== 'message'));
                                      }}
                                      className="rounded text-orange-600 focus:ring-orange-500"
                                  />
                                  <span className="text-sm text-gray-700 flex items-center"><MessageSquare size={14} className="mr-1"/> 站内信</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                      type="checkbox" 
                                      checked={batchRemindChannels.includes('email')}
                                      onChange={(e) => {
                                          if (e.target.checked) setBatchRemindChannels([...batchRemindChannels, 'email']);
                                          else setBatchRemindChannels(batchRemindChannels.filter(c => c !== 'email'));
                                      }}
                                      className="rounded text-orange-600 focus:ring-orange-500"
                                  />
                                  <span className="text-sm text-gray-700 flex items-center"><Mail size={14} className="mr-1"/> 邮件</span>
                              </label>
                          </div>
                      </div>

                      <div>
                          <label className="flex items-center space-x-2 cursor-pointer">
                              <input 
                                  type="checkbox" 
                                  checked={batchRemindUnreadOnly}
                                  onChange={(e) => setBatchRemindUnreadOnly(e.target.checked)}
                                  className="rounded text-orange-600 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-700">仅提醒未读消息的用户</span>
                          </label>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">备注 (选填)</label>
                          <textarea 
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                              rows={3}
                              placeholder="请输入附加提醒内容..."
                          />
                      </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button onClick={() => setIsBatchRemindModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
                      <button onClick={confirmBatchRemind} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm">确认发送</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Batch Time Modal --- */}
      {isBatchTimeModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] animate-in zoom-in-95">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">批量修改截止时间</h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                      <div className="flex items-center text-sm text-blue-800">
                          <AlertCircle size={16} className="mr-2" />
                          <span>即将修改 <span className="font-bold">{interviewSelectedIds.size}</span> 条任务的截止时间</span>
                      </div>
                  </div>
                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">新的截止时间</label>
                          <input 
                            type="date" 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={batchDeadline}
                            onChange={(e) => setBatchDeadline(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button onClick={() => setIsBatchTimeModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
                      <button onClick={submitBatchTime} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">确认修改</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Batch Interviewer Modal --- */}
      {isBatchInterviewerModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] animate-in zoom-in-95">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">批量更换面谈官</h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                      <div className="flex items-center text-sm text-blue-800">
                          <AlertCircle size={16} className="mr-2" />
                          <span>即将更换 <span className="font-bold">{interviewSelectedIds.size}</span> 条任务的面谈官</span>
                      </div>
                  </div>
                  <div className="mb-6 relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">选择新的面谈官 (可多选)</label>
                      <div 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm flex justify-between items-center cursor-pointer bg-white hover:border-blue-500 transition-colors"
                        onClick={() => setIsBatchInterviewerDropdownOpen(!isBatchInterviewerDropdownOpen)}
                      >
                        <span className={batchInterviewers.length ? 'text-gray-900' : 'text-gray-400'}>
                          {batchInterviewers.length > 0 ? batchInterviewers.join('、') : '请选择面谈官'}
                        </span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isBatchInterviewerDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {isBatchInterviewerDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
                          {['直属上级', 'HRBP', '部门负责人', '隔级上级', '指定人员'].map(role => (
                              <label key={role} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                  <input 
                                      type="checkbox"
                                      checked={batchInterviewers.includes(role)}
                                      onChange={(e) => {
                                          if (e.target.checked) {
                                              setBatchInterviewers([...batchInterviewers, role]);
                                          } else {
                                              setBatchInterviewers(batchInterviewers.filter(r => r !== role));
                                          }
                                      }}
                                      className="rounded text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">{role}</span>
                              </label>
                          ))}
                        </div>
                      )}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button onClick={() => setIsBatchInterviewerModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
                      <button onClick={submitBatchInterviewer} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">确认更换</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Single Remind Modal --- */}
      {isRemindModalOpen && remindSession && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] animate-in zoom-in-95">
                  <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                          <Bell size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">发送催办提醒</h3>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-gray-500">面谈对象:</div>
                          <div className="font-medium text-gray-800">{remindSession.employeeName}</div>
                          <div className="text-gray-500">面谈主题:</div>
                          <div className="font-medium text-gray-800">{remindSession.period}</div>
                          <div className="text-gray-500">截止日期:</div>
                          <div className="font-medium text-gray-800">{remindSession.deadline || '未设置'}</div>
                      </div>
                  </div>

                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">通知渠道</label>
                          <div className="flex space-x-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                      type="checkbox" 
                                      checked={remindChannels.includes('message')}
                                      onChange={(e) => {
                                          if (e.target.checked) setRemindChannels([...remindChannels, 'message']);
                                          else setRemindChannels(remindChannels.filter(c => c !== 'message'));
                                      }}
                                      className="rounded text-orange-600 focus:ring-orange-500"
                                  />
                                  <span className="text-sm text-gray-700 flex items-center"><MessageSquare size={14} className="mr-1"/> 站内信</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                      type="checkbox" 
                                      checked={remindChannels.includes('email')}
                                      onChange={(e) => {
                                          if (e.target.checked) setRemindChannels([...remindChannels, 'email']);
                                          else setRemindChannels(remindChannels.filter(c => c !== 'email'));
                                      }}
                                      className="rounded text-orange-600 focus:ring-orange-500"
                                  />
                                  <span className="text-sm text-gray-700 flex items-center"><Mail size={14} className="mr-1"/> 邮件</span>
                              </label>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">备注 (选填)</label>
                          <textarea 
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                              rows={3}
                              placeholder="请输入附加提醒内容..."
                              value={remindNote}
                              onChange={(e) => setRemindNote(e.target.value)}
                          />
                      </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button onClick={() => setIsRemindModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
                      <button onClick={confirmRemind} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm">确认发送</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Single Edit Modal --- */}
      {isEditModalOpen && editingSession && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] animate-in zoom-in-95">
                  <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <Edit3 size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">编辑面谈任务</h3>
                  </div>

                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">面谈主题</label>
                          <input 
                              type="text"
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              value={editForm.topic}
                              onChange={(e) => setEditForm({...editForm, topic: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">面谈官</label>
                          <input 
                              type="text"
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              value={editForm.managerName}
                              onChange={(e) => setEditForm({...editForm, managerName: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                          <input 
                              type="date"
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              value={editForm.deadline}
                              onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                          />
                      </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
                      <button onClick={submitEditSession} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">保存修改</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Single Cancel Modal --- */}
      {cancelModalOpen && sessionToCancel && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                  <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                              <AlertTriangle size={20} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">确认取消面谈?</h3>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-500">面谈对象:</div>
                              <div className="font-medium text-gray-800">{sessionToCancel.employeeName}</div>
                              <div className="text-gray-500">面谈主题:</div>
                              <div className="font-medium text-gray-800">{sessionToCancel.period}</div>
                              <div className="text-gray-500">当前状态:</div>
                              <div className="font-medium text-gray-800">{sessionToCancel.status}</div>
                          </div>
                      </div>

                      <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              取消原因 <span className="text-red-500">*</span>
                          </label>
                          <textarea
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                              rows={3}
                              placeholder="请输入取消原因（2-200字）..."
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                          />
                          <div className="text-xs text-gray-400 text-right mt-1">
                              {cancelReason.length}/200
                          </div>
                      </div>

                      <div className="flex items-center">
                          <input
                              type="checkbox"
                              id="notifyStakeholders"
                              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              checked={notifyStakeholders}
                              onChange={(e) => setNotifyStakeholders(e.target.checked)}
                          />
                          <label htmlFor="notifyStakeholders" className="ml-2 text-sm text-gray-600">
                              通知相关人（面谈对象、上级）
                          </label>
                      </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
                      <button 
                          onClick={() => {
                              setCancelModalOpen(false);
                              setSessionToCancel(null);
                              setCancelReason('');
                          }}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                          暂不取消
                      </button>
                      <button 
                          onClick={confirmCancel}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm transition-colors"
                      >
                          确认取消
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Batch Cancel Modal --- */}
      {isBatchCancelModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] animate-in zoom-in-95">
                  <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                          <AlertTriangle size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">批量取消面谈</h3>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                      <div className="flex items-center text-sm text-red-800">
                          <AlertCircle size={16} className="mr-2" />
                          <span>即将取消 <span className="font-bold">{interviewSelectedIds.size}</span> 条面谈任务</span>
                      </div>
                  </div>

                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">取消原因 <span className="text-red-500">*</span></label>
                          <textarea 
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                              rows={3}
                              placeholder="请输入取消原因（2-200字）..."
                              value={batchCancelReason}
                              onChange={(e) => setBatchCancelReason(e.target.value)}
                          />
                          <div className="text-xs text-gray-400 text-right mt-1">
                              {batchCancelReason.length}/200
                          </div>
                      </div>

                      <div>
                          <label className="flex items-center space-x-2 cursor-pointer">
                              <input 
                                  type="checkbox" 
                                  checked={batchNotifyStakeholders}
                                  onChange={(e) => setBatchNotifyStakeholders(e.target.checked)}
                                  className="rounded text-red-600 focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700">通知相关人（面谈对象、上级）</span>
                          </label>
                      </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button onClick={() => setIsBatchCancelModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">暂不取消</button>
                      <button onClick={confirmBatchCancel} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm">确认取消</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Single Edit Modal --- */}
      {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] animate-in zoom-in-95">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">修改面谈信息</h3>
                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-sm text-gray-600 mb-1">面谈主题</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                            value={editForm.topic}
                            onChange={(e) => setEditForm({...editForm, topic: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm text-gray-600 mb-1">面谈官</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                            value={editForm.managerName}
                            onChange={(e) => setEditForm({...editForm, managerName: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm text-gray-600 mb-1">截止时间</label>
                              <input 
                                type="date" 
                                className="w-full border border-gray-300 rounded p-2 text-sm"
                                value={editForm.deadline}
                                onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm text-gray-600 mb-1">具体时间 (选填)</label>
                              <input 
                                type="datetime-local" 
                                className="w-full border border-gray-300 rounded p-2 text-sm"
                                value={editForm.date}
                                onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                              />
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                      <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">取消</button>
                      <button onClick={submitEditSession} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">保存修改</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default AssessmentList;
