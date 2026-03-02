
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import InterviewList from './components/InterviewList';
import InterviewForm from './components/InterviewForm';
import InterviewExecution from './components/InterviewExecution';
import InterviewScheduler from './components/InterviewScheduler';
import ScheduleMeetingModal from './components/ScheduleMeetingModal'; 
import TemplateConfigPage from './components/TemplateModal'; 
import AssessmentList from './components/AssessmentList';
import AssessmentTaskList from './components/AssessmentTaskList';
import NewInterviewModal from './components/NewInterviewModal';
import TaskList from './components/TaskList'; 
import EmployeeTaskTable from './components/EmployeeTaskTable'; 
import EmployeeDashboard from './components/EmployeeDashboard';
import SystemSettings from './components/SystemSettings';
import PerformanceArchives from './components/PerformanceArchives';
import MyTeamOrgPerformance from './components/MyTeamOrgPerformance';
import MyTeamSubordinatePerformance from './components/MyTeamSubordinatePerformance';
import InterviewConfirmationView from './components/InterviewConfirmationView';
import MobileApp from './components/MobileApp'; // Import MobileApp
import { InterviewSession, Status, InterviewType, Notification } from './types';
import { MOCK_SESSIONS, MOCK_EMPLOYEES } from './constants';

function App() {
  const [userRole, setUserRole] = useState<'HR' | 'Employee'>('Employee'); 
  const [activePage, setActivePage] = useState('dashboard'); 
  const [isMobileMode, setIsMobileMode] = useState(false); // Mobile Mode State
  
  // Assessment Navigation State
  const [selectedAssessmentTask, setSelectedAssessmentTask] = useState<string | null>(null);

  const [sessions, setSessions] = useState<InterviewSession[]>(MOCK_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([
      { id: 'n1', targetRole: 'Employee', type: 'system', title: '系统通知', content: '欢迎使用智慧绩效面谈模块', time: '1小时前', read: false },
      { id: 'n2', targetRole: 'HR', type: 'task', title: '待办提醒', content: '您有 3 个面谈任务即将截止', time: '2小时前', read: false }
  ]);
  
  // View Modes: list, detail, execution, schedule
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'execution' | 'schedule'>('list');

  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleTargetSession, setScheduleTargetSession] = useState<InterviewSession | null>(null);

  // New Interview Modal State
  const [isNewInterviewModalOpen, setIsNewInterviewModalOpen] = useState(false);
  const [newInterviewDefaultTopic, setNewInterviewDefaultTopic] = useState('绩效面谈');
  const [newInterviewInitialEmployees, setNewInterviewInitialEmployees] = useState<string[]>([]);

  const handleRoleChange = (role: 'HR' | 'Employee') => {
      setUserRole(role);
      if (role === 'HR') {
          setActivePage('assessments');
          setSelectedAssessmentTask(null);
      } else {
          setActivePage('dashboard');
      }
      setViewMode('list');
      setSelectedSession(null);
  };

  const handleMarkNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (notification: Notification) => {
      handleMarkNotificationRead(notification.id);
      if (notification.targetRole === 'Employee') {
          setUserRole('Employee');
          setActivePage('todo_interviews');
          setViewMode('list');
      } else {
          setUserRole('HR');
          if (notification.title.includes('面谈') || notification.content.includes('面谈')) {
              setActivePage('interviews');
          } else {
              setActivePage('dashboard');
          }
          setViewMode('list');
      }
  };

  const handleInitiateInterviewFromAssessment = (employeeIds: string[]) => {
      setNewInterviewInitialEmployees(employeeIds);
      setNewInterviewDefaultTopic(selectedAssessmentTask || '绩效面谈'); 
      setIsNewInterviewModalOpen(true);
  };

  const handleNewInterviewSubmit = (data: any) => {
      const newSessions: InterviewSession[] = [];
      const employeeIds = data.employeeIds || [];
      const targetIds = employeeIds.length > 0 ? employeeIds : [MOCK_EMPLOYEES[0].id];

      const managerNameMap = {
          'manager': '张伟 (直属上级)',
          'hrbp': 'Lisa (HRBP)',
          'dept_head': '王总 (部门负责人)',
          'skip_manager': '赵总 (隔级上级)'
      }[data.interviewerRole as string] || '张伟';

      const extractedPeriod = data.assessmentTask ? data.assessmentTask.split(' ')[0] + ' ' + data.assessmentTask.split(' ')[1] : '2025 Q4';

      targetIds.forEach((empId: string) => {
          const emp = MOCK_EMPLOYEES.find(e => e.id === empId);
          if (emp) {
              const newSession: InterviewSession = {
                  id: `int_${Date.now()}_${empId}`,
                  employeeId: empId,
                  employeeName: emp.name,
                  managerName: managerNameMap, 
                  date: '', 
                  period: data.topic || '日常面谈', 
                  assessmentCycle: extractedPeriod, 
                  status: Status.NotStarted,
                  type: InterviewType.Regular,
                  templateId: data.templateId,
                  linkedAssessmentId: undefined, 
                  schedulingStatus: 'pending',
                  deadline: data.deadline,
                  method: 'appointment', 
                  requireConfirmation: data.requireConfirmation,
                  signatureType: data.signatureType
              };
              newSessions.push(newSession);
          }
      });

      setSessions(prev => [...newSessions, ...prev]);

      const newNotificationsList: Notification[] = [];
      newNotificationsList.push({
          id: `notif_${Date.now()}_emp`,
          targetRole: 'Employee',
          type: 'task',
          title: '绩效面谈已启动',
          content: `您的【${data.topic}】任务已下发。请关注面谈邀请。`,
          time: '刚刚',
          read: false
      });
      setNotifications(prev => [...newNotificationsList, ...prev]);
      alert(`已创建 ${newSessions.length} 个待排期面谈任务。`);
  };

  const handleOpenScheduleModal = (session: InterviewSession) => {
      setScheduleTargetSession(session);
      setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = (data: any) => {
      if (scheduleTargetSession) {
          const updatedSessionData: InterviewSession = { 
              ...scheduleTargetSession, 
              schedulingStatus: 'scheduled' as const, 
              date: data.date + ' ' + data.time,
              period: data.topic,
              status: Status.NotStarted, 
              method: 'appointment' 
          };
          setSessions(prev => prev.map(s => s.id === scheduleTargetSession.id ? updatedSessionData : s));
          setScheduleModalOpen(false);
          setSelectedSession(updatedSessionData);
          setViewMode('detail');
          if (userRole === 'HR') setActivePage('interviews');
          else setActivePage('todo_interviews'); 
      }
  };

  const handleDirectFeedback = (session: InterviewSession) => {
      const updatedSessions = sessions.map(s => 
          s.id === session.id 
          ? { ...s, status: Status.InProgress, schedulingStatus: 'scheduled' as const, date: new Date().toISOString().split('T')[0], method: 'direct' as const } 
          : s
      );
      setSessions(updatedSessions);
      const updatedSession = updatedSessions.find(s => s.id === session.id);
      if (updatedSession) {
          setSelectedSession(updatedSession);
          setViewMode('detail');
          if (userRole === 'HR') setActivePage('interviews');
          else setActivePage('todo_interviews');
      }
  };

  const handleSubmitFeedback = () => {
      if (selectedSession) {
          setSessions(prev => prev.map(s => 
              s.id === selectedSession.id ? { ...s, status: Status.PendingConfirmation } : s
          ));
          alert('已提交给员工确认！');
          setSelectedSession(null);
          setViewMode('list');
      }
  };

  const handleConfirmCompletion = () => {
      if (selectedSession) {
          setSessions(prev => prev.map(s => 
              s.id === selectedSession.id ? { ...s, status: Status.Completed } : s
          ));
          alert('已完成面谈结果确认！');
          setSelectedSession(null);
          setViewMode('list');
      }
  };

  const handleEmployeeTaskAction = (task: any, actionType?: 'schedule' | 'feedback') => {
      if (activePage === 'todo_interviews') {
          let session = sessions.find(s => s.id === task.id) || sessions.find(s => s.employeeName === task.employee);
          if (!session) session = sessions[0]; 
          
          if (actionType === 'schedule') {
              handleOpenScheduleModal(session);
          } else if (actionType === 'feedback') {
              handleDirectFeedback(session);
          } else {
               setSelectedSession(session);
               setViewMode('detail');
          }
      } else {
          alert('功能开发中...');
      }
  };

  const handleSelectSession = (session: InterviewSession) => {
      setSelectedSession(session);
      setViewMode('detail');
      setActivePage('interviews'); 
  };

  const handleStartInterview = () => {
      setViewMode('execution');
  };

  const handleEndMeeting = () => {
      if (selectedSession) {
          setSessions(prev => prev.map(s => s.id === selectedSession.id ? { ...s, status: Status.Completed } : s));
          setSelectedSession(prev => prev ? ({ ...prev, status: Status.Completed }) : null);
      }
      setViewMode('detail'); 
  };

  const handleBackToInterviewList = () => {
      setSelectedSession(null);
      setViewMode('list');
  };

  const handleCancelSession = (sessionId: string) => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleBatchUpdateSessions = (ids: string[], updates: Partial<InterviewSession>) => {
      setSessions(prev => prev.map(s => ids.includes(s.id) ? { ...s, ...updates } : s));
  };

  const handleSingleCancelSession = (sessionId: string) => {
      if(window.confirm('确定要取消该面谈任务吗？此操作不可恢复。')) {
          setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
  };

  const renderContent = () => {
    if (activePage === 'dashboard') {
        if (userRole === 'Employee') {
            return <EmployeeDashboard sessions={sessions} onEnterMeeting={(s) => { setSelectedSession(s); handleStartInterview(); }} onFeedback={(s) => { handleDirectFeedback(s); }} />;
        }
        return <div className="flex items-center justify-center h-full text-gray-400 bg-white"><div className="text-center"><h2 className="text-xl font-semibold mb-2">欢迎进入 HR 管理后台</h2></div></div>;
    }

    if (activePage === 'my_team_org') return <MyTeamOrgPerformance />;
    if (activePage === 'my_team_sub') return <MyTeamSubordinatePerformance />;
    if (activePage === 'settings') return <SystemSettings onNavigate={setActivePage} />;
    if (activePage === 'template_config') return <TemplateConfigPage onBack={() => setActivePage('settings')} />;
    if (activePage === 'assessments') {
        if (selectedAssessmentTask) {
            return <AssessmentList taskName={selectedAssessmentTask} onInitiateInterview={handleInitiateInterviewFromAssessment} sessions={sessions} onScheduleSession={handleOpenScheduleModal} onSelectSession={handleSelectSession} onCancelSession={handleSingleCancelSession} onBatchUpdateSessions={handleBatchUpdateSessions} onBack={() => setSelectedAssessmentTask(null)} />;
        }
        return <AssessmentTaskList onSelectTask={(taskName) => setSelectedAssessmentTask(taskName)} />;
    }
    if (activePage === 'archives') return <PerformanceArchives />;

    if (activePage === 'interviews' || activePage === 'todo_interviews') {
        if (viewMode === 'execution' && selectedSession) {
            return <InterviewExecution session={selectedSession} onEndMeeting={handleEndMeeting} />;
        }
        
        if (viewMode === 'detail' && selectedSession) {
          // ROUTING LOGIC: If employee confirms a pending session, show Confirmation View
          if (userRole === 'Employee' && selectedSession.status === Status.PendingConfirmation) {
            return <InterviewConfirmationView session={selectedSession} onBack={handleBackToInterviewList} onConfirm={handleConfirmCompletion} />;
          }
          return <InterviewForm session={selectedSession} onBack={handleBackToInterviewList} onStart={handleStartInterview} onSubmitFeedback={handleSubmitFeedback} onChangeSession={handleSelectSession} />;
        }

        if (activePage === 'interviews') {
            return <InterviewList sessions={sessions} onSelectSession={handleSelectSession} onCreateNew={() => { setNewInterviewInitialEmployees([]); setNewInterviewDefaultTopic('绩效面谈'); setIsNewInterviewModalOpen(true); }} onOpenTemplates={() => setActivePage('template_config')} onScheduleSession={handleOpenScheduleModal} onDirectFeedback={handleDirectFeedback} onCancelSession={handleCancelSession} />;
        }

        const type = activePage === 'todo_interviews' ? 'interviews' : activePage === 'todo_plans' ? 'plans' : 'reviews';
        return <EmployeeTaskTable type={type as any} onAction={handleEmployeeTaskAction} sessions={type === 'interviews' ? sessions : undefined} />;
    }

    if (activePage === 'todo_plans' || activePage === 'todo_reviews') {
        return <EmployeeTaskTable type={activePage === 'todo_plans' ? 'plans' : 'reviews'} onAction={handleEmployeeTaskAction} />;
    }

    return <div className="flex items-center justify-center h-full text-gray-400 bg-white"><div className="text-center"><h2 className="text-xl font-semibold mb-2">欢迎使用智慧绩效 SmartPerf</h2></div></div>;
  };

  const isFullScreenMode = viewMode === 'execution' || viewMode === 'detail';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      {!isFullScreenMode && <Sidebar activePage={activePage} setActivePage={(page) => { setActivePage(page); setViewMode('list'); if (page === 'assessments') setSelectedAssessmentTask(null); }} currentRole={userRole} />}
      <div className="flex-1 flex flex-col min-w-0">
        {!isFullScreenMode && (
            <TopNav 
                currentRole={userRole} 
                onRoleChange={handleRoleChange} 
                notifications={notifications} 
                onMarkRead={handleMarkNotificationRead} 
                onNotificationClick={handleNotificationClick}
                onMobileClick={() => setIsMobileMode(true)} 
            />
        )}
        <main className="flex-1 overflow-auto relative flex flex-col bg-[#F9FAFB]">{renderContent()}</main>
      </div>
      <NewInterviewModal isOpen={isNewInterviewModalOpen} onClose={() => setIsNewInterviewModalOpen(false)} onSubmit={handleNewInterviewSubmit} initialEmployeeIds={newInterviewInitialEmployees} defaultTopic={newInterviewDefaultTopic} />
      <ScheduleMeetingModal isOpen={isScheduleModalOpen} onClose={() => setScheduleModalOpen(false)} onConfirm={handleConfirmSchedule} session={scheduleTargetSession} />
      {/* Mobile Simulation Overlay */}
      {isMobileMode && <MobileApp sessions={sessions} onClose={() => setIsMobileMode(false)} />}
    </div>
  );
}

export default App;
