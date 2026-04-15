
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Clock, ChevronDown, User,
  Edit3, AlertCircle, ArrowRight, FileText, History, X, Bell,
  Star, Paperclip, Table, Grid,
  Briefcase, CheckCircle, Calendar as CalendarIcon, PlayCircle, Trash2, MoreHorizontal, AlertTriangle,
  MessageSquare, Mail
} from 'lucide-react';
import { InterviewSession, Status, InterviewType, HistoricalRecord } from '../types';
import { MOCK_HISTORY_RECORDS, MOCK_TEMPLATES, MOCK_EMPLOYEES, MOCK_PERFORMANCE_RECORDS, MOCK_CHANGE_LOGS } from '../constants';
import ChangeLogModal from './ChangeLogModal';

interface InterviewListProps {
  sessions: InterviewSession[];
  onSelectSession: (session: InterviewSession) => void;
  onCreateNew: () => void;
  onOpenTemplates: () => void;
  onScheduleSession: (session: InterviewSession) => void;
  onDirectFeedback: (session: InterviewSession) => void;
  onCancelSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onBatchCancelSessions?: (sessionIds: string[]) => void;
}

const InterviewList: React.FC<InterviewListProps> = ({ 
  sessions, 
  onSelectSession, 
  onCreateNew, 
  onOpenTemplates, 
  onScheduleSession, 
  onDirectFeedback,
  onCancelSession,
  onDeleteSession,
  onBatchCancelSessions
}) => {
  type TabType = 'all' | 'schedule' | 'start' | 'feedback' | 'done' | 'cancelled';
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Interaction State
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null); // employeeId
  const [showTemplateFor, setShowTemplateFor] = useState<string | null>(null); // templateId
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState<InterviewSession | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [notifyStakeholders, setNotifyStakeholders] = useState(true);

  // Remind Modal State
  const [isRemindModalOpen, setIsRemindModalOpen] = useState(false);
  const [remindSession, setRemindSession] = useState<InterviewSession | null>(null);
  const [remindChannels, setRemindChannels] = useState<string[]>(['message']);
  const [remindNote, setRemindNote] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<InterviewSession | null>(null);
  const [editForm, setEditForm] = useState({
      topic: '',
      managerName: '',
      deadline: '',
      date: ''
  });

  // Change Log Modal State
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);

  // Batch Modal States
  const [isBatchTimeModalOpen, setIsBatchTimeModalOpen] = useState(false);
  const [isBatchInterviewerModalOpen, setIsBatchInterviewerModalOpen] = useState(false);
  const [isBatchRemindModalOpen, setIsBatchRemindModalOpen] = useState(false);
  const [isBatchCancelModalOpen, setIsBatchCancelModalOpen] = useState(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(0);
  const [batchDate, setBatchDate] = useState('');
  const [batchDeadline, setBatchDeadline] = useState('');
  const [batchInterviewer, setBatchInterviewer] = useState('');
  const [interviewerSearch, setInterviewerSearch] = useState('');
  const [isBatchInterviewerDropdownOpen, setIsBatchInterviewerDropdownOpen] = useState(false);
  const [batchRemindChannels, setBatchRemindChannels] = useState<string[]>(['message']);
  const [batchRemindUnreadOnly, setBatchRemindUnreadOnly] = useState(true);
  const [batchCancelReason, setBatchCancelReason] = useState('');
  const [batchNotifyStakeholders, setBatchNotifyStakeholders] = useState(true);

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    setIsBatchDeleteModalOpen(true);
    setDeleteCountdown(3);
    const timer = setInterval(() => {
      setDeleteCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmBatchDelete = () => {
    alert(`已成功删除 ${selectedIds.size} 条记录。`);
    setSelectedIds(new Set());
    setIsBatchDeleteModalOpen(false);
  };

  // Helper to render selected items summary
  const renderSelectedItemsSummary = (prefix: string, className = "text-xs text-gray-500 mb-4 px-1") => {
    const selectedSessions = sessions.filter(s => selectedIds.has(s.id));
    const names = selectedSessions.map(s => s.employeeName);
    const n = names.length;
    
    if (n === 0) return null;

    const renderTag = (name: string, i: number) => (
      <span key={i} className="px-1.5 py-0.5 bg-white/50 border border-current/20 rounded text-[10px] font-medium">
        {name}
      </span>
    );

    if (n <= 10) {
      return (
        <div className={`${className} flex flex-wrap gap-1.5 items-center`}>
          <span className="font-medium opacity-90 mr-0.5">{prefix}</span>
          {names.map((name, i) => renderTag(name, i))}
        </div>
      );
    }

    const displayedNames = names.slice(0, 10);
    const fullList = names.join('、');

    return (
      <div className={`${className} flex flex-wrap gap-1.5 items-center`}>
        <span className="font-medium opacity-90 mr-0.5">{prefix}</span>
        {displayedNames.map((name, i) => renderTag(name, i))}
        <div className="relative group">
          <span className="px-1.5 py-0.5 bg-white/80 border border-current/30 rounded text-[10px] font-bold cursor-help">
            ...等{n}人
          </span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl invisible group-hover:visible z-[100] break-all leading-relaxed text-center">
            <div className="font-bold mb-1 border-b border-white/10 pb-1">完整名单</div>
            {fullList}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    );
  };

  const handleBatchRemind = () => {
      if (selectedIds.size === 0) return;
      setIsBatchRemindModalOpen(true);
  };

  const confirmBatchRemind = () => {
      alert(`批量催办指令已发出，系统正在为 ${selectedIds.size} 位面谈对象推送提醒通知。`);
      setIsBatchRemindModalOpen(false);
      setSelectedIds(new Set());
  };

  const handleBatchCancel = () => {
      if (selectedIds.size === 0) return;
      setBatchCancelReason('');
      setBatchNotifyStakeholders(true);
      setIsBatchCancelModalOpen(true);
  };

  const confirmBatchCancel = () => {
      if (!batchCancelReason.trim() || batchCancelReason.length < 2 || batchCancelReason.length > 2000) {
          alert('请填写2~2000字的取消原因');
          return;
      }
      if (onBatchCancelSessions) {
          onBatchCancelSessions(Array.from(selectedIds));
      }
      alert(`批量取消操作已完成，共计 ${selectedIds.size} 项面谈任务已终止，相关人员将收到通知。`);
      setIsBatchCancelModalOpen(false);
      setSelectedIds(new Set());
      setBatchCancelReason('');
  };

  const submitBatchTime = () => {
      // Mock update logic
      alert(`截止日期批量调整成功，所选的 ${selectedIds.size} 项任务已同步更新。`);
      setIsBatchTimeModalOpen(false);
      setSelectedIds(new Set());
  };

  const submitBatchInterviewer = () => {
      // Mock update logic
      if (!batchInterviewer) {
          alert('请选择新面谈官');
          return;
      }
      alert(`面谈官批量更换成功，共 ${selectedIds.size} 项任务已重新分配给：${batchInterviewer}。`);
      setIsBatchInterviewerModalOpen(false);
      setSelectedIds(new Set());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = () => setOpenActionId(null);
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
  }, []);



  // Filter Logic
  const filteredSessions = sessions.filter(session => {
    // Tab Filter
    let matchesTab = false;
    switch (activeTab) {
        case 'all':
            matchesTab = true;
            break;
        case 'schedule':
            // 待排期: 未开始 且 (排期状态为 pending 或 未定义)
            matchesTab = session.status === Status.NotStarted && (session.schedulingStatus === 'pending' || !session.schedulingStatus);
            break;
        case 'start':
            // 待开始: 未开始 且 排期状态为 scheduled
            matchesTab = session.status === Status.NotStarted && session.schedulingStatus === 'scheduled';
            break;
        case 'feedback':
            // 待反馈: 进行中 或 待确认 (Manager perspective)
            matchesTab = session.status === Status.InProgress || session.status === Status.PendingConfirmation;
            break;
        case 'done':
            // 已完成: 已完成
            matchesTab = session.status === Status.Completed;
            break;
        case 'cancelled':
            matchesTab = session.status === Status.Cancelled;
            break;
    }
    
    // Search Filter
    const matchesSearch = session.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          session.managerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Calculate counts for tabs
  const getCount = (tab: TabType) => {
      if (tab === 'all') return sessions.length;
      return sessions.filter(session => {
        if (tab === 'schedule') return session.status === Status.NotStarted && (session.schedulingStatus === 'pending' || !session.schedulingStatus);
        if (tab === 'start') return session.status === Status.NotStarted && session.schedulingStatus === 'scheduled';
        if (tab === 'feedback') return session.status === Status.InProgress || session.status === Status.PendingConfirmation;
        if (tab === 'done') return session.status === Status.Completed;
        if (tab === 'cancelled') return session.status === Status.Cancelled;
        return false;
      }).length;
  };

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredSessions.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleHistoryClick = (record: HistoricalRecord, employeeId: string) => {
      const employee = MOCK_EMPLOYEES.find(e => e.id === employeeId);
      const session: InterviewSession = {
          id: record.id,
          employeeId: employeeId,
          employeeName: employee?.name || 'Unknown',
          managerName: record.manager,
          date: record.date,
          period: record.type,
          status: Status.Completed,
          type: InterviewType.Regular,
          method: 'appointment',
          templateId: 't1', // Default template for history records
          schedulingStatus: 'scheduled'
      };
      onSelectSession(session);
  };

  const handleRemind = (e: React.MouseEvent, session: InterviewSession) => {
      e.stopPropagation();
      setOpenActionId(null);
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

  const handleCancelClick = (e: React.MouseEvent, session: InterviewSession) => {
      e.stopPropagation();
      setOpenActionId(null);
      setSessionToCancel(session);
      setCancelReason('');
      setNotifyStakeholders(true);
      setCancelModalOpen(true);
  };

  const confirmCancel = () => {
      if (!cancelReason.trim() || cancelReason.length < 2 || cancelReason.length > 2000) {
          alert('请填写2~2000字的取消原因。');
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

  const handleEditClick = (e: React.MouseEvent, session: InterviewSession) => {
      e.stopPropagation();
      setOpenActionId(null);
      setEditingSession(session);
      setEditForm({
          topic: session.period,
          managerName: session.managerName,
          deadline: session.deadline || ''
      });
      setIsEditModalOpen(true);
  };

  const confirmEdit = () => {
      if (editingSession) {
          // Mock update
          alert('修改成功，最新内容已生效。');
          setIsEditModalOpen(false);
          setEditingSession(null);
      }
  };

  // Helper to determine display context for a session
  const getSessionContext = (session: InterviewSession): 'schedule' | 'start' | 'feedback' | 'done' => {
      if (session.status === Status.Completed) return 'done';
      if (session.status === Status.InProgress || session.status === Status.PendingConfirmation) return 'feedback';
      if (session.status === Status.NotStarted && session.schedulingStatus === 'scheduled') return 'start';
      return 'schedule';
  };

  // Helper for rendering columns
  const renderTime = (session: InterviewSession) => {
      const context = activeTab === 'all' ? getSessionContext(session) : activeTab;

      if (context === 'done') {
          return <div className="text-gray-500 font-mono text-sm">{session.date?.split(' ')[0] || '-'}</div>;
      }

      // Show scheduled time for "To Start" or "Feedback"
      if (session.date && (context === 'start' || context === 'feedback')) {
          return (
            <div className="flex flex-col">
                <span className="text-gray-800 font-medium font-mono text-sm">{session.date.split(' ')[0]}</span>
                <span className="text-gray-400 text-xs mt-0.5 font-mono">
                    {session.date.split(' ')[1] || '10:00'} - {session.date.split(' ')[1] ? '11:00' : '10:30'}
                </span>
            </div>
          );
      }
      
      // Show Deadline for "To Schedule"
      if (session.deadline && context === 'schedule') {
          const deadlineDate = new Date(session.deadline);
          const today = new Date();
          const diffTime = deadlineDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const isUrgent = diffDays <= 3 && diffDays >= 0;
          const isOverdue = diffDays < 0;

          return (
              <div className="flex flex-col justify-center">
                  <div className="flex items-center text-gray-500 text-xs mb-1">
                      <span className="mr-1">截止:</span>
                      <span className="font-mono">{session.deadline}</span>
                  </div>
                  
                  {isOverdue ? (
                      <span className="inline-flex items-center text-red-600 text-[10px] font-medium bg-red-50 px-1.5 py-0.5 rounded w-fit">
                          <AlertCircle size={10} className="mr-1" /> 已逾期 {Math.abs(diffDays)} 天
                      </span>
                  ) : isUrgent ? (
                      <span className="inline-flex items-center text-orange-600 text-[10px] font-medium bg-orange-50 px-1.5 py-0.5 rounded w-fit">
                          <Clock size={10} className="mr-1" /> 仅剩 {diffDays} 天
                      </span>
                  ) : (
                      <span className="text-gray-400 text-[10px]">待预约时间</span>
                  )}
              </div>
          );
      }
      return <span className="text-gray-400 text-xs">-</span>;
  };

  const renderStatusBadge = (session: InterviewSession) => {
      let label = session.status as string;
      let styleClass = '';
      let handler = '';

      // Determine Status Label & Color
      if (session.status === Status.NotStarted) {
          if (session.schedulingStatus === 'pending' || !session.schedulingStatus) {
              label = '待安排';
              styleClass = 'bg-gray-100 text-gray-600 border-gray-200';
              handler = session.managerName.split(' ')[0]; // Manager needs to schedule
          } else {
              label = '未开始';
              styleClass = 'bg-gray-100 text-gray-600 border-gray-200';
              handler = session.managerName.split(' ')[0]; // Manager needs to start
          }
      } else if (session.status === Status.InProgress) {
          label = '进行中';
          styleClass = 'bg-blue-50 text-blue-600 border-blue-100';
          handler = session.managerName.split(' ')[0]; // Manager needs to submit
      } else if (session.status === Status.PendingConfirmation) {
          label = '待确认';
          styleClass = 'bg-orange-50 text-orange-600 border-orange-100';
          handler = session.employeeName; // Employee needs to confirm
      } else if (session.status === Status.Completed) {
          label = '已完成';
          styleClass = 'bg-green-50 text-green-600 border-green-100';
          handler = ''; // No pending handler
      } else {
          // Default/Archived
          label = session.status;
          styleClass = 'bg-gray-50 text-gray-400 border-gray-200';
      }

      return (
          <div className="flex flex-col">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border w-fit ${styleClass}`}>
                  {label}
              </span>
              {handler && (
                  <span className="text-[10px] text-gray-400 mt-1 ml-0.5">
                      待处理: {handler}
                  </span>
              )}
          </div>
      );
  };

  const renderAssessmentResult = (session: InterviewSession) => {
      // Find performance record based on employeeId and assessmentCycle
      const record = MOCK_PERFORMANCE_RECORDS.find(r => r.employeeId === session.employeeId && r.period === session.assessmentCycle);

      if (!record) {
          return <span className="text-gray-400">-</span>;
      }

      // Determine style based on grade
      let gradeClass = 'bg-gray-100 text-gray-600';
      if (['S', 'A', 'A+'].includes(record.grade)) {
          gradeClass = 'bg-green-100 text-green-700 border-green-200';
      } else if (['B+', 'B'].includes(record.grade)) {
          gradeClass = 'bg-blue-100 text-blue-700 border-blue-200';
      } else if (['C', 'D'].includes(record.grade)) {
          gradeClass = 'bg-orange-100 text-orange-700 border-orange-200';
      }

      return (
          <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-800 text-sm">{record.overallScore}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${gradeClass}`}>
                  {record.grade}
              </span>
          </div>
      );
  };

  const renderAction = (session: InterviewSession) => {
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
              { label: '编辑', onClick: (e) => handleEditClick(e, session), variant: 'default' },
              { label: '直接反馈', onClick: () => onDirectFeedback(session), variant: 'default' },
              { label: '催办', onClick: (e) => handleRemind(e, session), variant: 'default' },
              { label: '取消', onClick: (e) => handleCancelClick(e, session), variant: 'danger' },
          ];
      } else if (isScheduled) {
          actions = [
              { label: '编辑', onClick: (e) => handleEditClick(e, session), variant: 'default' },
              { label: '直接反馈', onClick: () => onDirectFeedback(session), variant: 'default' },
              { label: '取消', onClick: (e) => handleCancelClick(e, session), variant: 'danger' },
          ];
      } else if (session.status === Status.Cancelled) {
          actions = [
              { label: '查看详情', onClick: () => onSelectSession(session), variant: 'primary' },
              { label: '删除', onClick: (e) => { e.stopPropagation(); onDeleteSession(session.id); }, variant: 'danger' },
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
              { label: '再次发起', onClick: () => onCreateNew(), variant: 'default' },
          ];
      }

      const visibleActions = actions.slice(0, 2);
      const hiddenActions = actions.slice(2);

      return (
          <div className="flex items-center justify-end space-x-3 text-xs">
              {visibleActions.map((action, idx) => (
                  <button
                      key={idx}
                      onClick={action.onClick}
                      className={`font-medium whitespace-nowrap transition-colors ${
                          action.variant === 'primary' ? 'text-primary hover:text-primary-700' :
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
                              <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)}></div>
                              <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-xs text-gray-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                  {hiddenActions.map((action, idx) => (
                                      <button 
                                          key={idx}
                                          onClick={(e) => {
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
  };

  return (
    <div className="p-6 h-full flex flex-col bg-white relative">
      


      {/* Top Header Section */}
      <div className="flex flex-col mb-4">
        {/* Tabs */}
        <div className="flex items-center space-x-1 border-b border-gray-300 mb-6">
            <TabItem active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="全部" count={getCount('all')} />
            <TabItem active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} label="待排期" count={getCount('schedule')} />
            <TabItem active={activeTab === 'start'} onClick={() => setActiveTab('start')} label="待开始" count={getCount('start')} />
            <TabItem active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} label="待反馈" count={getCount('feedback')} />
            <TabItem active={activeTab === 'done'} onClick={() => setActiveTab('done')} label="已完成" count={getCount('done')} />
            <TabItem active={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')} label="已取消" count={getCount('cancelled')} />
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-200/50">
            {/* Left: Search */}
            <div className="relative group ml-1">
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索姓名、面谈官..." 
                    className="pl-8 pr-4 py-1.5 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64 transition-all"
                />
                <Search className="absolute left-2.5 top-2.5 text-gray-400 group-hover:text-gray-500" size={14} />
            </div>

            {/* Right: Buttons */}
            <div className="flex items-center space-x-3 mr-1">
                <div className="relative group">
                    <button className={`px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium flex items-center transition-colors shadow-sm ${selectedIds.size === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}>
                        批量操作 ({selectedIds.size}) <ChevronDown size={14} className="ml-1.5" />
                    </button>
                    {selectedIds.size > 0 && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 text-sm text-gray-700 hidden group-hover:block animate-in fade-in zoom-in-95">
                            <button onClick={handleBatchRemind} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center text-orange-600 hover:bg-orange-50">
                                <Bell size={14} className="mr-2" /> 批量催办提醒
                            </button>
                            <button onClick={() => setIsBatchTimeModalOpen(true)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center">
                                <CalendarIcon size={14} className="mr-2" /> 批量调整截止日期
                            </button>
                            <button onClick={() => setIsBatchInterviewerModalOpen(true)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center">
                                <User size={14} className="mr-2" /> 批量重新分配面谈官
                            </button>
                            <button onClick={handleBatchCancel} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center text-red-600 hover:bg-red-50">
                                <AlertTriangle size={14} className="mr-2" /> 批量取消面谈任务
                            </button>
                            <button onClick={handleBatchDelete} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center text-red-600 hover:bg-red-50">
                                <Trash2 size={14} className="mr-2" /> 批量删除记录
                            </button>
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => setIsChangeLogOpen(true)}
                    className="px-4 py-1.5 bg-white border border-gray-300 text-gray-600 rounded text-sm font-medium hover:bg-gray-50 hover:text-primary hover:border-primary-300 transition-colors flex items-center"
                >
                    <Clock size={16} className="mr-1" />
                    变更记录
                </button>
                <button 
                    onClick={onOpenTemplates}
                    className="px-4 py-1.5 bg-white border border-gray-300 text-gray-600 rounded text-sm font-medium hover:bg-gray-50 hover:text-primary hover:border-primary-300 transition-colors"
                >
                    模板配置
                </button>
                <button 
                    onClick={onCreateNew}
                    className="px-4 py-1.5 bg-primary text-white rounded text-sm font-medium hover:bg-primary-600 transition-colors flex items-center shadow-sm"
                >
                    <Plus size={16} className="mr-1" /> 安排面谈
                </button>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar border border-gray-200 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 w-12 text-center border-b border-gray-200">
                    <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        onChange={handleSelectAll}
                        checked={selectedIds.size === filteredSessions.length && filteredSessions.length > 0}
                    />
                </th>
                <th className="px-4 py-3 border-b border-gray-200">员工姓名</th>
                <th className="px-4 py-3 border-b border-gray-200">面谈官</th>
                <th className="px-4 py-3 border-b border-gray-200">面谈主题</th>
                <th className="px-4 py-3 border-b border-gray-200">关联考核周期</th>
                <th className="px-4 py-3 border-b border-gray-200">考核结果</th>
                <th className="px-4 py-3 border-b border-gray-200">面谈时间</th>
                <th className="px-4 py-3 border-b border-gray-200">面谈状态</th>
                <th className="px-4 py-3 border-b border-gray-200 text-right min-w-[200px]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredSessions.map((session) => {
                  const templateName = MOCK_TEMPLATES.find(t => t.id === session.templateId)?.name || '标准模板';

                  return (
                    <tr key={session.id} className="hover:bg-primary-50/30 transition-colors group text-sm relative">
                      <td className="px-4 py-3 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            checked={selectedIds.has(session.id)}
                            onChange={() => handleSelectOne(session.id)}
                          />
                      </td>
                      <td className="px-4 py-3">
                          <div 
                            className="flex items-center cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded-lg transition-colors group/employee"
                            onClick={() => setShowHistoryFor(session.employeeId)}
                            title="点击查看历史面谈记录"
                          >
                              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs mr-3 font-bold border border-white shadow-sm group-hover/employee:bg-blue-50 group-hover/employee:text-blue-600 transition-colors">
                                  {session.employeeName.charAt(0)}
                              </div>
                              <div className="text-gray-900 font-medium group-hover/employee:text-blue-700 transition-colors">{session.employeeName}</div>
                          </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center">
                              <span className="truncate max-w-[120px]" title={session.managerName}>
                                  {session.managerName}
                              </span>
                          </div>
                      </td>
                      <td className="px-4 py-3">
                          <div className="flex flex-col">
                              <span className="text-gray-900 font-medium">{session.period}</span>
                              <button 
                                onClick={() => setShowTemplateFor(session.templateId)}
                                className="text-xs text-blue-500 hover:text-blue-700 flex items-center mt-0.5 w-fit"
                              >
                                  <FileText size={10} className="mr-1" /> {templateName}
                              </button>
                          </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                          {session.linkedAssessmentId ? (session.assessmentCycle || '-') : '-'}
                      </td>
                      <td className="px-4 py-3">
                          {renderAssessmentResult(session)}
                      </td>
                      <td className="px-4 py-3">
                          {renderTime(session)}
                      </td>
                      <td className="px-4 py-3">
                          {renderStatusBadge(session)}
                      </td>
                      <td className="px-4 py-3 text-right">
                         {renderAction(session)}
                      </td>
                    </tr>
                  )
              })}
              {filteredSessions.length === 0 && (
                  <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                          暂无数据
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-2">
           <div className="text-xs text-gray-500">
               共 {filteredSessions.length} 条记录
           </div>
           <div className="flex items-center space-x-2 text-xs">
                <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600 disabled:opacity-50" disabled>&lt;</button>
                <button className="px-2 py-1 bg-primary text-white rounded border border-primary">1</button>
                <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600">&gt;</button>
                <select className="border border-gray-300 rounded px-1 py-1 text-gray-600 focus:ring-primary focus:border-primary">
                    <option>10 条/页</option>
                    <option>20 条/页</option>
                </select>
           </div>
      </div>

      {/* History Slide-out */}
      {showHistoryFor && (
          <div className="absolute top-0 right-0 h-full w-[350px] bg-white shadow-2xl border-l border-gray-200 z-20 p-6 flex flex-col animate-in slide-in-from-right">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900">历史面谈记录</h3>
                  <button onClick={() => setShowHistoryFor(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                  {(MOCK_HISTORY_RECORDS[showHistoryFor] || []).map(record => (
                      <div 
                        key={record.id} 
                        className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => handleHistoryClick(record, showHistoryFor!)}
                      >
                          <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-gray-800 text-sm">{record.type}</span>
                              <span className="text-xs text-gray-500">{record.date}</span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">面谈官: {record.manager}</div>
                          <p className="text-xs text-gray-600 leading-relaxed bg-white p-2 rounded border border-gray-100 group-hover:border-blue-100">
                              {record.summary}
                          </p>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight size={14} className="text-blue-500" />
                          </div>
                      </div>
                  ))}
                  {(!MOCK_HISTORY_RECORDS[showHistoryFor]?.length) && <div className="text-center text-gray-400 text-sm mt-10">暂无历史记录</div>}
              </div>
          </div>
      )}

      {/* Template Preview Overlay (Actual Preview) */}
      {showTemplateFor && (
          <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center backdrop-blur-sm" onClick={() => setShowTemplateFor(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900">{MOCK_TEMPLATES.find(t => t.id === showTemplateFor)?.name || '模板详情'}</h3>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{MOCK_TEMPLATES.find(t => t.id === showTemplateFor)?.description || '无描述'}</p>
                      </div>
                      <button onClick={() => setShowTemplateFor(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 custom-scrollbar">
                      {MOCK_TEMPLATES.find(t => t.id === showTemplateFor)?.sections.map((section) => (
                          <div key={section.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center">
                                      <div className="w-1 h-4 bg-blue-500 rounded-full mr-3"></div>
                                      <h4 className="font-bold text-gray-800 text-sm">{section.title}</h4>
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 font-medium flex items-center">
                                      {section.viewType === 'table' ? <Table size={10} className="mr-1"/> : <Grid size={10} className="mr-1"/>}
                                      {section.viewType === 'table' ? '表格视图' : '表单视图'}
                                  </span>
                              </div>
                              
                              {section.viewType === 'table' ? (
                                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                                      <div className="flex bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600">
                                          {section.fields.map((f) => (
                                              <div key={f.id} className="flex-1 p-2.5 border-r border-gray-200 last:border-0 truncate min-w-[100px] text-center">{f.label}</div>
                                          ))}
                                      </div>
                                      <div className="p-4 text-center text-xs text-gray-400 bg-white italic border-b border-gray-100 last:border-0">
                                          ( 预览数据行 1 )
                                      </div>
                                      <div className="p-4 text-center text-xs text-gray-400 bg-white italic">
                                          ( 预览数据行 2 )
                                      </div>
                                  </div>
                              ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ gridTemplateColumns: `repeat(${section.columns || 2}, minmax(0, 1fr))` }}>
                                      {section.fields.map((f) => (
                                          <div key={f.id} className={f.width === 'full' ? `col-span-${section.columns || 2}` : ''}>
                                              <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center">
                                                  {f.label} 
                                                  {f.required && <span className="text-red-500 ml-1">*</span>}
                                              </label>
                                              {f.type === 'attachment' ? (
                                                  <div className="border border-dashed border-gray-300 rounded p-3 text-center text-xs text-gray-400 bg-gray-50 flex items-center justify-center">
                                                      <Paperclip size={14} className="mr-1"/> 附件上传区
                                                  </div>
                                              ) : f.type === 'rating' ? (
                                                  <div className="flex space-x-1 text-gray-300">
                                                      {[1,2,3,4,5].map(i => <Star key={i} size={16} />)}
                                                  </div>
                                              ) : (
                                                  <div className={`bg-gray-50 border border-gray-200 rounded-lg px-3 flex items-center text-xs text-gray-400 ${f.type === 'textarea' ? 'h-20 items-start py-2' : 'h-9'}`}>
                                                      {f.placeholder || (f.type === 'textarea' ? '多行文本输入...' : '单行文本输入...')}
                                                  </div>
                                              )}
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
                      <button onClick={() => setShowTemplateFor(null)} className="px-6 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 text-gray-700 transition-colors">关闭</button>
                  </div>
              </div>
          </div>
      )}

      {/* Cancellation Confirmation Modal */}
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
                              placeholder="请输入取消原因（2-2000字）..."
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                          />
                          <div className="text-xs text-gray-400 text-right mt-1">
                              {cancelReason.length}/2000
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
                          className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${
                              cancelReason.length >= 2 && cancelReason.length <= 2000
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-red-300 cursor-not-allowed'
                          }`}
                          disabled={cancelReason.length < 2 || cancelReason.length > 2000}
                      >
                          确认取消
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Batch Remind Modal --- */}
      {isBatchRemindModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] animate-in zoom-in-95">
                  <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                          <Bell size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">批量催办</h3>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-4">
                      <div className="flex items-start text-sm text-orange-800 mb-2">
                          <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" />
                          <span>您即将对 <span className="font-bold text-orange-900">{selectedIds.size}</span> 位面谈对象发起催办，系统将发送提醒通知。</span>
                      </div>
                      {renderSelectedItemsSummary("涉及人员：", "text-xs text-orange-700/80 ml-6")}
                  </div>

                  <div className="space-y-4 mb-6">
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
                      <button onClick={confirmBatchRemind} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-all active:scale-95">立即催办</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Batch Time Modal --- */}
      {isBatchTimeModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[450px] animate-in zoom-in-95">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">修改截止日期</h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                      <div className="flex items-start text-sm text-blue-800 mb-2">
                          <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" />
                          <span>您正在批量调整 <span className="font-bold text-blue-900">{selectedIds.size}</span> 项任务的截止日期。</span>
                      </div>
                      {renderSelectedItemsSummary("涉及人员：", "text-xs text-blue-700/80 ml-6 mb-3")}
                      
                      <div className="flex items-start text-xs text-blue-600 mt-2 pt-2 border-t border-blue-100/50">
                          <span className="mr-1">💡</span>
                          <span>提示：已完成的任务将自动跳过，仅对进行中的任务生效。</span>
                      </div>
                  </div>
                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">新截止日期</label>
                          <div className="text-xs text-gray-400 mb-2">请选择新的截止时间（需晚于今日）</div>
                          <input 
                            type="date" 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={batchDeadline}
                            onChange={(e) => setBatchDeadline(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
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
              <div className="bg-white rounded-lg shadow-xl p-6 w-[450px] animate-in zoom-in-95">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">变更面谈官</h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                      <div className="flex items-start text-sm text-blue-800 mb-2 font-medium">
                          <span>正在为 {selectedIds.size} 位员工调整面谈官：</span>
                      </div>
                      {renderSelectedItemsSummary("涉及人员：", "text-xs text-blue-700/80 ml-0 mb-3")}
                      
                      <div className="flex items-start text-xs text-blue-600 mt-2 pt-2 border-t border-blue-100/50">
                          <span className="mr-1">💡</span>
                          <span>注意：仅待安排、待反馈的任务支持改派，已完成或取消的任务将自动跳过。</span>
                      </div>
                  </div>
                  <div className="space-y-4 mb-6 relative">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1"><span className="text-red-500 mr-1">*</span>新面谈官</label>
                          <div className="text-xs text-gray-400 mb-2">请选择接替的面谈负责人</div>
                          <div className="relative">
                              <div 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm flex justify-between items-center cursor-pointer bg-white hover:border-blue-500 transition-colors"
                                onClick={() => setIsBatchInterviewerDropdownOpen(!isBatchInterviewerDropdownOpen)}
                              >
                                <span className={batchInterviewer ? 'text-gray-900' : 'text-gray-400'}>
                                  {batchInterviewer || '请选择面谈官'}
                                </span>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isBatchInterviewerDropdownOpen ? 'rotate-180' : ''}`} />
                              </div>
                              
                              {isBatchInterviewerDropdownOpen && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                                  <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                                    <div className="relative">
                                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                      <input 
                                        type="text"
                                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="搜索姓名、部门或职位..."
                                        value={interviewerSearch}
                                        onChange={(e) => setInterviewerSearch(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  </div>
                                  <div className="overflow-y-auto flex-1 custom-scrollbar max-h-48">
                                    {MOCK_EMPLOYEES.filter(e => 
                                      e.name.toLowerCase().includes(interviewerSearch.toLowerCase()) ||
                                      e.department.toLowerCase().includes(interviewerSearch.toLowerCase()) ||
                                      e.role.toLowerCase().includes(interviewerSearch.toLowerCase())
                                    ).length > 0 ? (
                                      MOCK_EMPLOYEES.filter(e => 
                                        e.name.toLowerCase().includes(interviewerSearch.toLowerCase()) ||
                                        e.department.toLowerCase().includes(interviewerSearch.toLowerCase()) ||
                                        e.role.toLowerCase().includes(interviewerSearch.toLowerCase())
                                      ).map(employee => (
                                        <div 
                                          key={employee.id}
                                          className={`flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors ${batchInterviewer === employee.name ? 'bg-blue-50' : ''}`}
                                          onClick={() => {
                                            setBatchInterviewer(employee.name);
                                            setIsBatchInterviewerDropdownOpen(false);
                                            setInterviewerSearch('');
                                          }}
                                        >
                                          <img src={employee.avatar} alt="" className="w-6 h-6 rounded-full mr-2 bg-gray-100" />
                                          <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                                            <span className="text-[10px] text-gray-500">{employee.department} · {employee.role}</span>
                                          </div>
                                          {batchInterviewer === employee.name && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="py-8 text-center text-gray-400 text-xs">未找到匹配人员</div>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">调整原因</label>
                          <div className="text-xs text-gray-400 mb-2">“请简要说明变更原因（选填）”</div>
                          <textarea 
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              rows={2}
                              placeholder="请输入变更原因..."
                          />
                      </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button onClick={() => setIsBatchInterviewerModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
                      <button onClick={submitBatchInterviewer} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">确认变更</button>
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
                      <button onClick={confirmEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">保存修改</button>
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
                      <h3 className="text-lg font-bold text-gray-900">取消面谈任务</h3>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                      <div className="flex items-start text-sm text-red-800 mb-2">
                          <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" />
                          <span>确定要取消以下 <span className="font-bold text-red-900">{selectedIds.size}</span> 项面谈任务吗？</span>
                      </div>
                      {renderSelectedItemsSummary("涉及人员：", "text-xs text-red-700/80 ml-6 mb-3")}
                      
                      <div className="text-xs text-red-600 mt-2 pt-2 border-t border-red-100/50">
                          取消后，相关待办将从面谈官及员工的列表中移除，流程将提前终止。
                      </div>
                  </div>

                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1"><span className="text-red-500 mr-1">*</span>取消原因</label>
                          <div className="text-xs text-gray-400 mb-2">请填写取消原因，以便相关人员知晓（必填）</div>
                          <textarea 
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                              rows={3}
                              placeholder="请输入取消原因..."
                              value={batchCancelReason}
                              onChange={(e) => setBatchCancelReason(e.target.value)}
                          />
                          <div className="text-xs text-gray-400 text-right mt-1">
                              {batchCancelReason.length}/2000
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
                      <button 
                          onClick={confirmBatchCancel} 
                          className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${
                              batchCancelReason.length >= 2 && batchCancelReason.length <= 2000
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-red-300 cursor-not-allowed'
                          }`}
                          disabled={batchCancelReason.length < 2 || batchCancelReason.length > 2000}
                      >
                          确认取消
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Batch Delete Modal --- */}
      {isBatchDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-[450px] animate-in zoom-in-95">
                  <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                          <Trash2 size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">删除记录</h3>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                      <div className="flex items-start text-sm text-red-800 mb-2">
                          <AlertTriangle size={16} className="mr-2 mt-0.5 shrink-0" />
                          <span>确认删除这 <span className="font-bold text-red-900">{selectedIds.size}</span> 条已取消的记录吗？</span>
                      </div>
                      <div className="text-xs text-red-700/80 ml-6 mb-3">
                          删除后数据将无法恢复。
                      </div>
                      {renderSelectedItemsSummary("涉及人员：", "text-xs text-red-700/80 ml-6")}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button onClick={() => setIsBatchDeleteModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">取消</button>
                      <button 
                          onClick={confirmBatchDelete} 
                          disabled={deleteCountdown > 0}
                          className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-all ${
                              deleteCountdown > 0 ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-95'
                          }`}
                      >
                          {deleteCountdown > 0 ? `确定删除 (${deleteCountdown}s)` : '确定删除'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <ChangeLogModal 
          isOpen={isChangeLogOpen}
          onClose={() => setIsChangeLogOpen(false)}
          logs={MOCK_CHANGE_LOGS}
          title="变更记录"
          breadcrumb="绩效面谈 / 操作日志"
      />
    </div>
  );
};

// Sub-component for Tabs
const TabItem = ({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-3 text-sm font-medium transition-all relative flex items-center space-x-2 ${
            active 
            ? 'text-primary font-bold border-b-2 border-primary' 
            : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent'
        }`}
    >
        <span>{label}</span>
        {count > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                {count}
            </span>
        )}
    </button>
);

export default InterviewList;
