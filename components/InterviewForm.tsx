
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Calendar, Clock, Download, Share2, 
  Sparkles, List, FileText, 
  CheckCircle2, X,
  Paperclip, Edit3, PlayCircle, AlertCircle,
  TrendingUp, Eye, Info, BookOpen, Video, Mic,
  Send, BarChart2, User, MoreHorizontal, Wand2, ChevronDown, Check,
  AlertTriangle, History, ArrowRight, ChevronUp, Activity,
  Target, ThumbsUp, ThumbsDown, MessageSquare, Layers,
  Loader2, Lock, ShieldCheck, Shield, Users, Plus
} from 'lucide-react';
import { InterviewSession, Status, TemplateField, InterviewType, HistoricalRecord } from '../types';
import { MOCK_TEMPLATES, MOCK_ASSESSMENT_DETAILS, MOCK_EMPLOYEES, MOCK_AI_OUTLINE, ExtendedAssessmentDetail, MOCK_HISTORY_RECORDS, MOCK_PERFORMANCE_TRENDS } from '../constants';
import AssessmentDetailTable from './AssessmentDetailTable';
import PerformanceAnalysisSummary from './PerformanceAnalysisSummary';

interface InterviewFormProps {
  session: InterviewSession;
  onBack: () => void;
  onStart: () => void; // Used for "Enter Meeting" in Appointment mode
  onSubmitFeedback: () => void;
  onChangeSession?: (session: InterviewSession) => void;
}

// --- Enhanced Mock Data for 5 Roles, 2 Projects, 10 Indicators ---
const MOCK_CONFLICT_DETAILS_ENHANCED = {
    roles: [
        { key: 'self', label: '自评', name: '陈飞', avatar: 'https://picsum.photos/id/338/50/50' },
        { key: 'manager', label: '直属上级', name: '张伟', avatar: 'https://picsum.photos/id/1025/50/50' },
        { key: 'matrix', label: '虚线主管', name: 'Lisa', avatar: 'https://picsum.photos/id/237/50/50' },
        { key: 'peer', label: '互评同事', name: '王强', avatar: 'https://picsum.photos/id/12/50/50' },
        { key: 'sub', label: '下属', name: '小赵', avatar: 'https://picsum.photos/id/64/50/50' }
    ],
    summary: {
        self: { score: 98.5, comment: '本季度全力以赴，核心项目均按期交付，同时也承担了额外的团队培训工作。' },
        manager: { score: 82.0, comment: '整体表现符合预期，但在跨部门协作的响应速度上收到了一些负面反馈，需改进。' },
        matrix: { score: 85.5, comment: '专业能力很强，但在项目汇报的及时性上还有提升空间。' },
        peer: { score: 88.0, comment: '技术过硬，乐于助人，但有时候沟通语气比较急躁。' },
        sub: { score: 92.0, comment: '非常负责任的领导，给予了我们很多指导，希望能多一些授权。' }
    },
    projects: [
        {
            id: 'p1',
            name: '项目一：Q4 核心业务攻坚',
            indicators: [
                { id: 'i1', name: '累计签单额达成率', weight: '20%', scores: { self: 100, manager: 80, matrix: 85, peer: 90, sub: 95 }, comments: { self: '超额完成120%', manager: '部分回款未到账，暂按80%计', matrix: '数据核实中', peer: '-', sub: '-' } },
                { id: 'i2', name: '新客户开发数量', weight: '15%', scores: { self: 90, manager: 90, matrix: 88, peer: 85, sub: 90 }, comments: { self: '新增5家', manager: '新增5家，质量尚可', matrix: '符合预期', peer: '客户反馈不错', sub: '-' } },
                { id: 'i3', name: '项目交付及时率', weight: '15%', scores: { self: 100, manager: 75, matrix: 70, peer: 80, sub: 85 }, comments: { self: '全部按时', manager: 'A项目延期3天', matrix: '影响了下游进度', peer: '配合略有延迟', sub: '我们就差一点点' } },
                { id: 'i4', name: '代码/文档质量', weight: '10%', scores: { self: 95, manager: 90, matrix: 92, peer: 95, sub: 90 }, comments: { self: '零Bug上线', manager: '质量稳定', matrix: '文档规范', peer: '代码很漂亮', sub: '学习了很多' } },
                { id: 'i5', name: '成本控制', weight: '10%', scores: { self: 85, manager: 85, matrix: 85, peer: 80, sub: 85 }, comments: { self: '预算内', manager: '控制得当', matrix: '无超支', peer: '-', sub: '-' } },
            ]
        },
        {
            id: 'p2',
            name: '项目二：团队与价值观',
            indicators: [
                { id: 'i6', name: '团队协作响应度', weight: '10%', scores: { self: 100, manager: 70, matrix: 75, peer: 70, sub: 95 }, comments: { self: '随时待命', manager: '群消息回复慢', matrix: '找不到人', peer: '有时候很难联系', sub: '老大回我很快' } },
                { id: 'i7', name: '知识分享与沉淀', weight: '5%', scores: { self: 80, manager: 85, matrix: 90, peer: 90, sub: 95 }, comments: { self: '组织了1次分享', manager: '分享质量很高', matrix: '对团队有帮助', peer: '干货满满', sub: '受益匪浅' } },
                { id: 'i8', name: '人才培养', weight: '5%', scores: { self: 90, manager: 85, matrix: 80, peer: 85, sub: 90 }, comments: { self: '指导新人', manager: '投入了精力', matrix: '-', peer: '-', sub: '手把手教我' } },
                { id: 'i9', name: '主动性与责任心', weight: '5%', scores: { self: 100, manager: 95, matrix: 95, peer: 90, sub: 100 }, comments: { self: '主动承担', manager: '值得信赖', matrix: '很靠谱', peer: '很拼', sub: '榜样' } },
                { id: 'i10', name: '合规与安全', weight: '5%', scores: { self: 100, manager: 100, matrix: 100, peer: 100, sub: 100 }, comments: { self: '无违规', manager: '合规', matrix: '合规', peer: '合规', sub: '合规' } },
            ]
        }
    ]
};

const InterviewForm: React.FC<InterviewFormProps> = ({ session, onBack, onStart, onSubmitFeedback, onChangeSession }) => {
  // --- 1. Scenario Logic ---
  const isDirect = session.method === 'direct';
  const isAppointment = session.method === 'appointment';
  const isCompleted = session.status === Status.Completed;
  const isPreparing = session.status === Status.NotStarted;
  const isPendingConfirmation = session.status === Status.PendingConfirmation;

  // Layout Configuration
  let initialLeftWidth = 40;
  let defaultActiveTab = 'outline';

  if (isDirect) {
      initialLeftWidth = 45; // Wider for analysis in direct mode
      defaultActiveTab = 'form';
  } else if (isAppointment && isCompleted) {
      initialLeftWidth = 50;
      defaultActiveTab = 'summary';
  } else {
      initialLeftWidth = 40;
      defaultActiveTab = 'outline';
  }

  // --- State ---
  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab); 
  
  // Analysis Panel State
  const [selectedPeriod, setSelectedPeriod] = useState(session.period || '2025 Q4');
  const [analysisView, setAnalysisView] = useState<'summary' | 'details'>('summary');
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<HistoricalRecord | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOthersScoresDrawerOpen, setIsOthersScoresDrawerOpen] = useState(false);
  const [isActivityLogDrawerOpen, setIsActivityLogDrawerOpen] = useState(false);
  
  // Modal State
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [activeConflictItem, setActiveConflictItem] = useState<any>(null);
  
  // Share Confirmation Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // Initialize config based on direct mode
  const [shareConfig, setShareConfig] = useState({
      items: {
          summary: !isDirect,
          form: true,
          info: false, // Changed default to false
          ref: false,  // Changed default to false
          replay: false
      },
      formPermission: 'read' as 'read' | 'edit'
  });

  // Reset config when session changes
  useEffect(() => {
      setShareConfig(prev => ({
          ...prev,
          items: {
              ...prev.items,
              summary: !isDirect,
              replay: false, // Reset optional fields
              info: false,
              ref: false
          }
      }));
      setAnalysisView('summary');
  }, [session.id, isDirect]);

  // Scroll Anchors Refs
  const overviewRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved'); // Auto-save status
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [leftPanelWidth, setLeftPanelWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Data resolution
  const template = MOCK_TEMPLATES.find(t => t.id === session.templateId) || MOCK_TEMPLATES[0];
  const assessmentDetail = (MOCK_ASSESSMENT_DETAILS[session.employeeId] || MOCK_ASSESSMENT_DETAILS['default']) as ExtendedAssessmentDetail;
  const primaryEmployee = MOCK_EMPLOYEES.find(e => e.id === session.employeeId);
  const trends = MOCK_PERFORMANCE_TRENDS[session.employeeId] || MOCK_PERFORMANCE_TRENDS['default'];
  
  // Resolve History Records for Switcher
  const historyRecords = MOCK_HISTORY_RECORDS[session.employeeId] || [];

  // --- Resizing Logic ---
  const startResizing = useCallback(() => setIsDragging(true), []);
  const stopResizing = useCallback(() => setIsDragging(false), []);
  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
      if (isDragging && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const newWidth = ((mouseMoveEvent.clientX - containerRect.left) / containerRect.width) * 100;
          if (newWidth >= 25 && newWidth <= 75) setLeftPanelWidth(newWidth);
      }
  }, [isDragging]);

  useEffect(() => {
      if (isDragging) {
          window.addEventListener("mousemove", resize);
          window.addEventListener("mouseup", stopResizing);
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
      } else {
          window.removeEventListener("mousemove", resize);
          window.removeEventListener("mouseup", stopResizing);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
      }
      return () => {
          window.removeEventListener("mousemove", resize);
          window.removeEventListener("mouseup", stopResizing);
      };
  }, [isDragging, resize, stopResizing]);

  // --- Actions ---
  
  // Trigger auto-save simulation
  const triggerAutoSave = () => {
      setSaveStatus('saving');
      if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
      }
      // Simulate network request delay
      autoSaveTimerRef.current = setTimeout(() => {
          setSaveStatus('saved');
      }, 800);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    triggerAutoSave();
  };

  const handleAIPolish = (fieldId: string) => {
      const currentVal = formValues[fieldId] || "";
      setFormValues(prev => ({
          ...prev,
          [fieldId]: currentVal + " (AI已润色：表述更专业，强调了数据支撑...)"
      }));
      triggerAutoSave();
  };

  const handleAIFill = async () => {
      setIsGeneratingAI(true);
      
      const mockResponses: Record<string, any> = {
          'summary': "基于该员工本周期的表现，整体业绩达成率较高，但在跨部门协作方面仍有提升空间。建议后续加强与产品团队的沟通频次，确保需求理解的一致性。同时，在项目管理方面表现出色，能够有效把控进度风险。",
          'achievements': "1. 成功主导了 Q4 核心版本的发布，上线后用户活跃度提升 15%。\n2. 优化了前端构建流程，打包速度提升 40%。\n3. 输出了 3 篇高质量的技术分享文档，帮助团队成员快速成长。",
          'improvements': "1. 跨部门沟通时需更加主动，避免信息滞后。\n2. 代码注释规范性有待加强，建议遵循团队最新规范。\n3. 对新技术的探索深度不够，建议投入更多时间进行技术预研。",
          'plan': "1. 制定详细的 Q1 个人成长计划，重点攻克 Serverless 架构落地。\n2. 每周组织一次代码走查，提升代码质量。\n3. 参与开源社区贡献，提升个人及团队影响力。",
          'date': new Date().toISOString().split('T')[0],
          'select': '正式绩效',
          'number': '92',
          'graph': { radar: [80, 90, 85, 70, 95] },
          'attachment': [{ name: 'Q4述职报告.pdf', size: '2.4MB' }]
      };

      // Identify target fields and their content
      const targets: {id: string, type: string, value: any}[] = [];
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

      // Sequential generation
      for (const target of targets) {
          if (target.type === 'textarea' || target.type === 'text') {
              await new Promise<void>(resolve => {
                  let currentText = "";
                  const interval = setInterval(() => {
                      if (currentText.length < target.value.length) {
                          const charsToAdd = Math.floor(Math.random() * 4) + 2;
                          currentText = target.value.substring(0, currentText.length + charsToAdd);
                          setFormValues(prev => ({ ...prev, [target.id]: currentText }));
                      } else {
                          clearInterval(interval);
                          resolve();
                      }
                  }, 10);
              });
          } else {
              await new Promise(resolve => setTimeout(resolve, 400));
              setFormValues(prev => ({ ...prev, [target.id]: target.value }));
          }
      }

      setIsGeneratingAI(false);
      triggerAutoSave();
  };
  
  const handleHistorySwitch = (record: HistoricalRecord) => {
      if (!onChangeSession) return;
      const newSession: InterviewSession = {
          id: record.id,
          employeeId: session.employeeId,
          employeeName: session.employeeName,
          managerName: record.manager,
          date: record.date,
          period: record.type,
          status: Status.Completed,
          type: InterviewType.Regular,
          method: 'appointment',
          templateId: 't1', 
          schedulingStatus: 'scheduled'
      };
      onChangeSession(newSession);
      setShowHistoryDropdown(false);
  };

  const handlePreSubmit = () => {
      setIsShareModalOpen(true);
  };

  const handleConfirmShare = () => {
      setIsShareModalOpen(false);
      onSubmitFeedback();
  };

  const toggleShareItem = (key: keyof typeof shareConfig.items) => {
      setShareConfig(prev => ({
          ...prev,
          items: {
              ...prev.items,
              [key]: !prev.items[key]
          }
      }));
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- Charts Logic ---
  const renderTrendChart = () => {
      const width = 300;
      const height = 120;
      const padding = 20;
      
      if (!trends || trends.length === 0) return null;

      const maxScore = Math.max(...trends.map(t => t.score), 100);
      const minScore = Math.min(...trends.map(t => t.score), 0);
      
      const getX = (index: number) => (index / (trends.length - 1)) * (width - 2 * padding) + padding;
      const getY = (score: number) => height - padding - ((score - minScore) / (maxScore - minScore)) * (height - 2 * padding);

      const points = trends.map((t, i) => `${getX(i)},${getY(t.score)}`).join(' ');

      return (
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#E5E7EB" strokeWidth="1" />
              
              {/* Path */}
              <polyline points={points} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Dots & Labels */}
              {trends.map((t, i) => (
                  <g key={i}>
                      <circle cx={getX(i)} cy={getY(t.score)} r="4" fill="white" stroke="#3B82F6" strokeWidth="2" />
                      <text x={getX(i)} y={getY(t.score) - 10} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="bold">{t.score}</text>
                      <text x={getX(i)} y={height} textAnchor="middle" fontSize="9" fill="#9CA3AF">{t.period}</text>
                  </g>
              ))}
          </svg>
      );
  };

  // --- Component Renders ---

  // Helper function to render items in Focus Area as "Notes"
  // Removed renderFocusNote as it is now handled by PerformanceAnalysisSummary component

  const renderConflictModal = () => {
      // ... (No changes needed here)
      if (!conflictModalOpen) return null;

      const { roles, summary, projects } = MOCK_CONFLICT_DETAILS_ENHANCED;

      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                              <AlertTriangle size={20} className="text-purple-600 mr-2" />
                              360° 评分差异分析
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">对比自评、上级、虚线、同事及下属的评分与评语，识别认知偏差。</p>
                      </div>
                      <button onClick={() => setConflictModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                      {/* ... (Existing conflict modal content) ... */}
                      <div className="mb-8">
                          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                              <BarChart2 size={16} className="mr-2 text-blue-600" /> 总评概览
                          </h4>
                          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-white border-b border-gray-100 text-gray-500 font-medium">
                                      <tr>
                                          <th className="px-4 py-3 w-20 text-xs font-normal">维度</th>
                                          {roles.map(role => (
                                              <th key={role.key} className="px-4 py-3 min-w-[140px]">
                                                  <div className="flex flex-col">
                                                      <span className="text-xs font-normal text-gray-400 mb-0.5">{role.label}</span>
                                                      <span className="text-gray-800 font-bold">{role.name}</span>
                                                  </div>
                                              </th>
                                          ))}
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                      <tr>
                                          <td className="px-4 py-4 font-bold text-gray-700 bg-gray-50/20">总分</td>
                                          {roles.map(role => {
                                              const score = summary[role.key as keyof typeof summary]?.score;
                                              const maxScore = Math.max(...roles.map(r => summary[r.key as keyof typeof summary]?.score));
                                              const isMax = score === maxScore;
                                              return (
                                                  <td key={role.key} className="px-4 py-4">
                                                      <span className={`text-xl font-bold ${isMax ? 'text-blue-600' : 'text-gray-800'}`}>{score}</span>
                                                  </td>
                                              );
                                          })}
                                      </tr>
                                      <tr>
                                          <td className="px-4 py-4 font-medium text-gray-700 bg-gray-50/20 align-top pt-4">总评语</td>
                                          {roles.map(role => (
                                              <td key={role.key} className="px-4 py-4 align-top">
                                                  <p className="text-xs text-gray-600 leading-relaxed p-2 rounded hover:bg-gray-50 transition-colors h-full border border-transparent hover:border-gray-100">
                                                      {summary[role.key as keyof typeof summary]?.comment}
                                                  </p>
                                              </td>
                                          ))}
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                      </div>

                      {/* 2. Detailed Indicators by Project */}
                      {projects.map((project) => (
                          <div key={project.id} className="mb-8">
                              <div className="flex items-center mb-4 pl-1">
                                  <div className="bg-blue-600 w-1 h-4 rounded-full mr-2"></div>
                                  <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                      {project.name}
                                  </h4>
                              </div>
                              
                              <div className="space-y-6">
                                  {project.indicators.map((indicator, idx) => {
                                      // Calculate spread logic
                                      const scores = Object.values(indicator.scores);
                                      const max = Math.max(...scores);
                                      const min = Math.min(...scores);
                                      const spread = max - min;
                                      const isHighDiff = spread >= 20;

                                      return (
                                          <div key={indicator.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${isHighDiff ? 'border-orange-200 ring-1 ring-orange-50' : 'border-gray-200'}`}>
                                              {/* Indicator Header */}
                                              <div className={`px-4 py-2.5 border-b flex justify-between items-center ${isHighDiff ? 'bg-orange-50/10 border-orange-100' : 'bg-gray-50/30 border-gray-100'}`}>
                                                  <div className="flex items-center space-x-3">
                                                      <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                                                      <span className="font-bold text-gray-800 text-sm">{indicator.name}</span>
                                                      <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">权重 {indicator.weight}</span>
                                                  </div>
                                                  
                                                  <span className={`text-xs px-2 py-1 rounded-md font-bold flex items-center border ${isHighDiff ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                      {isHighDiff && <AlertTriangle size={12} className="mr-1.5" />}
                                                      分差: {spread}
                                                  </span>
                                              </div>
                                              
                                              {/* Matrix Details */}
                                              <div className="overflow-x-auto">
                                                  <div className="grid grid-cols-5 divide-x divide-gray-50 min-w-[800px]">
                                                      {roles.map((role) => {
                                                          const score = indicator.scores[role.key as keyof typeof indicator.scores];
                                                          const comment = indicator.comments[role.key as keyof typeof indicator.comments];
                                                          
                                                          // Highlight Logic (Always identify Max/Min if there's a spread)
                                                          const isHighest = score === max;
                                                          const isLowest = score === min && spread > 0;
                                                          
                                                          let cellClass = "hover:bg-gray-50/50";
                                                          if (isHighest && isHighDiff) cellClass = "bg-red-50/10"; // Subtle red tint for high discrepancy source

                                                          return (
                                                              <div key={role.key} className={`p-4 flex flex-col h-full transition-colors ${cellClass}`}>
                                                                  <div className="flex justify-between items-center mb-3">
                                                                      <div className="flex items-center space-x-2">
                                                                          <img src={role.avatar} className="w-8 h-8 rounded-full border border-gray-100 shadow-sm" alt=""/>
                                                                          <div className="flex flex-col">
                                                                              <span className="text-xs font-bold text-gray-700">{role.name}</span>
                                                                              <span className="text-[10px] text-gray-400">{role.label}</span>
                                                                          </div>
                                                                      </div>
                                                                      <div className="flex flex-col items-end">
                                                                          <span className={`text-lg font-bold ${isHighest ? 'text-gray-900' : isLowest ? 'text-gray-500' : 'text-gray-700'}`}>
                                                                              {score}
                                                                          </span>
                                                                          {/* Max/Min Badges */}
                                                                          {isHighest && spread > 0 && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm font-medium mt-0.5">最高</span>}
                                                                          {isLowest && spread > 0 && <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-sm font-medium mt-0.5">最低</span>}
                                                                      </div>
                                                                  </div>
                                                                  <div className={`text-xs leading-relaxed p-2.5 rounded-lg border flex-1 ${isHighest && isHighDiff ? 'bg-red-50/40 border-red-100 text-gray-800' : 'bg-gray-50 border-transparent text-gray-600'}`}>
                                                                      {comment || <span className="text-gray-300 italic">无评语</span>}
                                                                  </div>
                                                              </div>
                                                          );
                                                      })}
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end">
                      <button 
                        onClick={() => setConflictModalOpen(false)}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                          关闭
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const renderHeader = () => (
      <div className="bg-white/90 backdrop-blur-md px-6 h-16 flex justify-between items-center z-20 shrink-0 sticky top-0 border-b border-gray-200 shadow-sm">
        <div className="flex items-center">
             <button onClick={onBack} className="mr-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors border border-gray-200">
                <ArrowLeft size={18} />
             </button>
             <div className="flex items-center">
                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                    {isDirect ? <Edit3 size={20} /> : <Video size={20} />}
                 </div>
                 <div>
                     <div className="flex items-center space-x-2 relative">
                         <h1 className="text-lg font-bold text-gray-900">{session.period}</h1>
                         {historyRecords.length > 0 && (
                             <div className="relative">
                                 <button 
                                    onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                                    className={`p-0.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors ${showHistoryDropdown ? 'bg-gray-100 text-gray-600' : ''}`}
                                 >
                                     <ChevronDown size={16} />
                                 </button>
                                 
                                 {showHistoryDropdown && (
                                     <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 origin-top-left">
                                         <div className="px-3 py-2 text-xs font-bold text-gray-400 border-b border-gray-50">切换历史记录</div>
                                         <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                             {historyRecords.map(record => (
                                                 <button 
                                                    key={record.id}
                                                    onClick={() => handleHistorySwitch(record)}
                                                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex flex-col transition-colors group ${session.id === record.id ? 'bg-blue-50/50' : ''}`}
                                                 >
                                                     <div className="flex justify-between items-center">
                                                         <span className={`text-sm font-medium ${session.id === record.id ? 'text-blue-600' : 'text-gray-800'}`}>
                                                             {record.type}
                                                         </span>
                                                         {session.id === record.id && <Check size={14} className="text-blue-600" />}
                                                     </div>
                                                     <span className="text-xs text-gray-500 mt-0.5">{record.date}</span>
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>
                         )}
                         <div className="h-4 w-px bg-gray-300 mx-1"></div>
                         <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${isCompleted ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                             {isCompleted ? '已结束' : session.status}
                         </span>
                     </div>
                     <div className="text-xs text-gray-500 mt-0.5 flex items-center space-x-3">
                         {isAppointment && session.date && <span className="flex items-center"><Calendar size={12} className="mr-1"/> {session.date}</span>}
                         <span className="flex items-center"><User size={12} className="mr-1"/> {session.employeeName}</span>
                     </div>
                 </div>
             </div>
        </div>
        
        {showHistoryDropdown && (
            <div className="fixed inset-0 z-40" onClick={() => setShowHistoryDropdown(false)}></div>
        )}
        
        <div className="flex items-center space-x-3">
             {isAppointment && isPreparing && (
                 <button 
                    onClick={onStart}
                    className="px-5 py-2 bg-[#8B5CF6] text-white rounded-full text-sm font-bold hover:bg-[#7C3AED] flex items-center shadow-lg shadow-purple-200 transition-all transform hover:scale-105"
                 >
                     <Video size={16} className="mr-2" /> 进入会议
                 </button>
             )}
        </div>
      </div>
  );

  const renderAssessmentAnalysisPanel = () => (
    <div className="h-full flex flex-col bg-white">
        {/* ... (Existing Content) ... */}
        <div className="px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="relative">
                        <img src={primaryEmployee?.avatar} alt="" className="w-12 h-12 rounded-full border border-gray-100 shadow-sm" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-base font-bold text-gray-900">{primaryEmployee?.name}</h3>
                        <div className="text-xs text-gray-500 mt-0.5">{primaryEmployee?.department} · {primaryEmployee?.role}</div>
                    </div>
                </div>
                <div>
                    <div className="relative">
                        <select 
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <option>2025 Q4</option>
                            <option>2025 Q3</option>
                            <option>2025 Q2</option>
                            <option>2025 Q1</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>
            
            <div className="flex space-x-6 text-xs font-medium text-gray-500">
                <button 
                    onClick={() => setAnalysisView('summary')} 
                    className={`pb-2 border-b-2 transition-colors ${analysisView === 'summary' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-blue-600'}`}
                >
                    总结概览
                </button>
                <button 
                    onClick={() => setAnalysisView('details')} 
                    className={`pb-2 border-b-2 transition-colors ${analysisView === 'details' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-blue-600'}`}
                >
                    考核表明细
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 p-6 space-y-8">
            {analysisView === 'summary' ? (
                <>
                    <div ref={overviewRef} className="scroll-mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center">
                                <Activity size={16} className="mr-2 text-blue-600" /> 综合分析
                            </h4>
                        </div>
                        
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <PerformanceAnalysisSummary assessmentDetail={assessmentDetail} onOpenIndicatorDetails={(indicator) => {
                                setSelectedIndicator(indicator);
                                setIsDrawerOpen(true);
                            }} />
                        </div>
                    </div>

                    <div ref={historyRef} className="scroll-mt-4 pb-10">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                            <History size={16} className="mr-2 text-blue-600" /> 历史趋势
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <div className="mb-4">
                                {renderTrendChart()}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="text-xs font-bold text-gray-500 mb-3 flex items-center justify-between">
                                    <span>历史面谈记录</span>
                                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">{historyRecords.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {historyRecords.map((record, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => setSelectedHistoryRecord(record)}
                                            className="flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-100 relative hover:shadow-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-gray-800 text-xs group-hover:text-blue-700 transition-colors">{record.type}</span>
                                                <span className="text-[10px] text-gray-400">{record.date}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 mb-2">面谈官: {record.manager}</div>
                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                {record.summary}
                                            </p>
                                        </div>
                                    ))}
                                    {historyRecords.length === 0 && (
                                        <div className="text-center text-xs text-gray-400 py-2">暂无历史记录</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                    <AssessmentDetailTable 
                        detail={assessmentDetail} 
                        period={selectedPeriod} 
                        onViewOthersScores={() => setIsOthersScoresDrawerOpen(true)}
                        onViewActivityLog={() => setIsActivityLogDrawerOpen(true)}
                    />
                </div>
            )}
        </div>
        
        {renderConflictModal()}

        {/* History Record Detail Modal */}
        {selectedHistoryRecord && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-base font-bold text-gray-900 flex items-center">
                            <History size={18} className="text-blue-600 mr-2" />
                            {selectedHistoryRecord.type} - 面谈反馈记录
                        </h3>
                        <button onClick={() => setSelectedHistoryRecord(null)} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="text-[10px] text-gray-500 mb-1">面谈日期</div>
                                <div className="text-sm font-bold text-gray-800">{selectedHistoryRecord.date}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="text-[10px] text-gray-500 mb-1">面谈官</div>
                                <div className="text-sm font-bold text-gray-800">{selectedHistoryRecord.manager}</div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 mb-2 border-l-2 border-blue-500 pl-2">面谈纪要</h4>
                                <div className="text-sm text-gray-600 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50 leading-relaxed whitespace-pre-wrap">
                                    {selectedHistoryRecord.summary}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 mb-2 border-l-2 border-green-500 pl-2">后续行动计划</h4>
                                <div className="text-sm text-gray-600 bg-green-50/30 p-4 rounded-xl border border-green-100/50 leading-relaxed">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>跟进核心项目进度，确保按期交付。</li>
                                        <li>加强跨部门沟通，每周同步一次进展。</li>
                                        <li>参加下个月的领导力培训课程。</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                        <button 
                            onClick={() => setSelectedHistoryRecord(null)}
                            className="px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderFeedbackForm = (readOnly: boolean = false) => (
      <div className="flex flex-col h-full bg-white relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
              <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center">
                          <FileText size={20} className="mr-2 text-blue-600" />
                          {isDirect ? '直接反馈填写' : '绩效面谈记录表'}
                      </h2>
                      {!readOnly && (
                           <button
                                onClick={handleAIFill}
                                disabled={isGeneratingAI}
                                className={`flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-all border border-purple-100 shadow-sm text-xs font-bold ${isGeneratingAI ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isGeneratingAI ? (
                                    <>
                                        <Loader2 size={14} className="mr-1.5 animate-spin" /> 生成中...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={14} className="mr-1.5" /> AI 一键生成
                                    </>
                                )}
                            </button>
                      )}
                  </div>
                  
                  {template.sections.map((section) => (
                      <div key={section.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center mb-4 pb-2 border-b border-gray-50">
                              <div className="h-4 w-1 bg-blue-500 rounded-full mr-3"></div>
                              <h3 className="font-bold text-gray-900 text-sm">{section.title}</h3>
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
                                                  <td key={field.id} className="px-3 py-2 whitespace-nowrap min-w-[150px]">
                                                      {field.type === 'text' ? (
                                                          <input 
                                                              disabled={readOnly}
                                                              type="text" 
                                                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition-colors"
                                                              placeholder={field.placeholder}
                                                              value={formValues[field.id] || ''}
                                                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                          />
                                                      ) : field.type === 'date' ? (
                                                          <input 
                                                              disabled={readOnly}
                                                              type="date" 
                                                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition-colors"
                                                              value={formValues[field.id] || ''}
                                                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                          />
                                                      ) : field.type === 'select' ? (
                                                          <select 
                                                              disabled={readOnly}
                                                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none"
                                                              value={formValues[field.id] || ''}
                                                              onChange={(e) => handleInputChange(field.id, e.target.value)}
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
                                  {!readOnly && (
                                      <button className="mt-2 text-xs text-blue-600 flex items-center font-medium px-1 py-1 hover:bg-blue-50 rounded">
                                          <Plus size={12} className="mr-1" /> 添加行
                                      </button>
                                  )}
                              </div>
                          ) : (
                              <div className="flex flex-wrap -mx-2">
                                  {section.fields.map((field) => (
                                      <div key={field.id} className={`px-2 mb-4 ${field.width === 'half' ? 'w-1/2' : field.width === 'one-third' ? 'w-1/3' : 'w-full'}`}>
                                          <div className="group relative">
                                              <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center">
                                                  {field.label}
                                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                              </label>
                                              
                                              {field.type === 'attachment' ? (
                                                  <div className="border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer min-h-[80px]">
                                                      {formValues[field.id] ? (
                                                          <div className="flex items-center justify-center text-blue-600">
                                                              <FileText size={20} className="mr-2" />
                                                              <span className="text-sm font-medium">Q4述职报告.pdf (2.4MB)</span>
                                                          </div>
                                                      ) : (
                                                          <>
                                                              <Paperclip size={16} className="text-gray-400 mb-1" />
                                                              <span className="text-xs text-gray-500">上传附件</span>
                                                          </>
                                                      )}
                                                  </div>
                                              ) : field.type === 'textarea' ? (
                                                  <div className="relative">
                                                      <textarea 
                                                          disabled={readOnly}
                                                          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] shadow-sm resize-y bg-gray-50/30 hover:bg-white transition-colors"
                                                          placeholder={field.placeholder || "请输入..."}
                                                          value={formValues[field.id] || ''}
                                                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                      ></textarea>
                                                      {!readOnly && (
                                                          <button 
                                                            onClick={() => handleAIPolish(field.id)}
                                                            className="absolute bottom-2 right-2 p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                                            title="AI 润色"
                                                          >
                                                              <Sparkles size={14} />
                                                          </button>
                                                      )}
                                                  </div>
                                              ) : field.type === 'date' ? (
                                                  <div className="relative">
                                                      <input 
                                                          disabled={readOnly}
                                                          type="date" 
                                                          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/30 hover:bg-white transition-colors appearance-none"
                                                          value={formValues[field.id] || ''}
                                                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                      />
                                                      <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                                  </div>
                                              ) : field.type === 'select' ? (
                                                  <div className="relative">
                                                      <select 
                                                          disabled={readOnly}
                                                          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/30 hover:bg-white transition-colors appearance-none"
                                                          value={formValues[field.id] || ''}
                                                          onChange={(e) => handleInputChange(field.id, e.target.value)}
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
                                                      disabled={readOnly}
                                                      type="number" 
                                                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/30 hover:bg-white transition-colors"
                                                      placeholder={field.placeholder}
                                                      value={formValues[field.id] || ''}
                                                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                  />
                                              ) : field.type === 'graph' ? (
                                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center h-40">
                                                      {formValues[field.id] ? (
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
                                              ) : (
                                                  <input 
                                                      disabled={readOnly}
                                                      type="text" 
                                                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/30 hover:bg-white transition-colors"
                                                      placeholder={field.placeholder}
                                                      value={formValues[field.id] || ''}
                                                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                  />
                                              )}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* Sticky Bottom Actions */}
          {!readOnly && (
              <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-between items-center z-10 shrink-0">
                  <div className="flex items-center text-xs text-gray-400 pl-2">
                      {saveStatus === 'saving' ? (
                          <>
                              <Loader2 size={14} className="animate-spin mr-2" />
                              <span>正在保存...</span>
                          </>
                      ) : (
                          <>
                              <CheckCircle2 size={14} className="text-green-500 mr-1.5" />
                              <span>已自动保存</span>
                          </>
                      )}
                  </div>
                  <button 
                    onClick={handlePreSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 font-medium flex items-center transition-colors text-sm"
                  >
                      <Send size={16} className="mr-2" /> 提交给员工确认
                  </button>
              </div>
          )}
      </div>
  );

  const renderOutline = () => (
      <div className="p-6 h-full overflow-y-auto custom-scrollbar bg-gray-50/50">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 flex items-center">
                      <List size={18} className="mr-2 text-blue-500" /> 面谈大纲
                  </h3>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">推荐使用</span>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600">
                  <div className="whitespace-pre-wrap font-sans leading-7">
                      {MOCK_AI_OUTLINE}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderSmartSummary = () => (
      <div className="p-6 h-full overflow-y-auto custom-scrollbar bg-gray-50/50">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="font-bold text-gray-800 flex items-center mb-4">
                  <Sparkles size={18} className="mr-2 text-purple-600" /> 智能纪要
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  本次面谈总体氛围融洽。双方就 <strong>Q3 绩效结果</strong> 达成一致，重点讨论了 <strong>供应链优化</strong> 项目的延期原因。员工表达了对 <strong>跨部门协作机制</strong> 的改进建议，管理者表示支持并承诺将在下周的部门会议上提出。
              </p>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-3">
                  <h4 className="text-xs font-bold text-green-800 mb-2 flex items-center"><CheckCircle2 size={12} className="mr-1"/> 达成共识</h4>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                      <li>Q3 个人绩效等级确认为 A (92分)</li>
                      <li>下季度重点转向“新客户拓展”</li>
                  </ul>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center"><Clock size={12} className="mr-1"/> 行动计划</h4>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                      <li>梳理跨部门协作流程痛点 (截止: 10/25)</li>
                      <li>报名参加“高绩效沟通”培训课程</li>
                  </ul>
              </div>
          </div>
      </div>
  );

  const renderReplay = () => (
      <div className="p-6 h-full overflow-y-auto custom-scrollbar bg-gray-50/50 flex flex-col">
           <div className="bg-black rounded-xl aspect-video flex items-center justify-center text-white relative group overflow-hidden shadow-lg mb-4 shrink-0 w-full">
               <PlayCircle size={48} className="absolute text-white/80 group-hover:text-white transition-colors cursor-pointer" />
               <div className="absolute bottom-3 left-3 text-xs font-medium">08:42 / 45:00</div>
           </div>
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
               <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-600">对话原文</div>
               <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                   {[1,2,3,4].map(i => (
                       <div key={i} className="flex gap-3 text-xs">
                           <div className="font-bold text-gray-700 shrink-0 w-12 text-right">{i%2===0 ? '经理' : '员工'}:</div>
                           <p className="text-gray-600 leading-relaxed">{i%2===0 ? '关于这个项目，你觉得还有哪些可以优化的地方？' : '我觉得主要是流程上稍微繁琐了一些，如果能简化审批步骤会更好。'}</p>
                       </div>
                   ))}
               </div>
           </div>
      </div>
  );

  // --- Dynamic Layout Rendering ---

  const renderLeftContent = () => {
      if (isDirect || (isAppointment && isPreparing) || isPendingConfirmation) {
          return renderAssessmentAnalysisPanel();
      }
      if (isAppointment && isCompleted) {
          return renderFeedbackForm(false); 
      }
      return null;
  };

  const renderRightContent = () => {
      if (isDirect || isPendingConfirmation) {
          return renderFeedbackForm(isPendingConfirmation); 
      }
      if (isAppointment && isPreparing) {
          if (activeTab === 'outline') return renderOutline();
          if (activeTab === 'info') return <div className="p-6"><div className="bg-white p-6 rounded-xl border">基本信息内容...</div></div>;
          if (activeTab === 'ref') return <div className="p-6 h-full"><AssessmentDetailTable detail={assessmentDetail} period={session.period} /></div>;
      }
      if (isAppointment && isCompleted) {
          if (activeTab === 'summary') return renderSmartSummary();
          if (activeTab === 'info') return <div className="p-6"><div className="bg-white p-6 rounded-xl border">基本信息内容...</div></div>;
          if (activeTab === 'ref') return <div className="p-6 h-full"><AssessmentDetailTable detail={assessmentDetail} period={session.period} /></div>;
          if (activeTab === 'replay') return renderReplay();
      }
      return null;
  };

  const getTabs = () => {
      if (isDirect || isPendingConfirmation) return []; 
      
      if (isAppointment && isPreparing) {
          return [
              { id: 'outline', label: '面谈大纲', icon: List },
              { id: 'info', label: '基本信息', icon: Info },
              { id: 'ref', label: '参考资料', icon: BookOpen },
          ];
      }
      
      if (isAppointment && isCompleted) {
          return [
              { id: 'summary', label: '智能纪要', icon: Sparkles },
              { id: 'info', label: '基本信息', icon: Info },
              { id: 'ref', label: '参考资料', icon: BookOpen },
              { id: 'replay', label: '回放/原文', icon: Video },
          ];
      }
      return [];
  };

  const tabs = getTabs();

  return (
    <div className="flex flex-col h-full bg-[#F4F6F9] overflow-hidden relative font-sans text-slate-800">
      
      {renderHeader()}

      <div className="flex flex-1 overflow-hidden p-4" ref={containerRef}>
        
        {/* --- LEFT PANEL --- */}
        <div 
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col shrink-0 relative"
            style={{ width: `${leftPanelWidth}%`, minWidth: '320px' }}
        >
             {renderLeftContent()}
        </div>

        {/* --- RESIZER --- */}
        <div 
            className="w-4 hover:w-4 cursor-col-resize z-10 flex items-center justify-center group relative -ml-2 -mr-2 select-none"
            onMouseDown={startResizing}
        >
             <div className="w-1 h-8 bg-gray-200 rounded-full group-hover:bg-blue-400 transition-colors"></div>
        </div>

        {/* --- RIGHT PANEL --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Tabs Header (If applicable) */}
            {tabs.length > 0 && (
                <div className="bg-white border-b border-gray-100 px-6 pt-2">
                     <div className="flex space-x-6 overflow-x-auto hide-scrollbar">
                         {tabs.map(tab => (
                             <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center relative whitespace-nowrap px-1 ${
                                    activeTab === tab.id
                                        ? `border-[#8B5CF6] text-[#7C3AED] font-bold` 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                }`}
                            >
                                <tab.icon size={16} className={`mr-2 ${activeTab === tab.id ? 'text-[#8B5CF6]' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                         ))}
                     </div>
                </div>
            )}
            
            <div className="flex-1 overflow-hidden relative">
                {renderRightContent()}
            </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
          <div className="absolute inset-0 z-30 flex justify-end bg-black/20 backdrop-blur-[1px] transition-all">
              <div className="w-[600px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-bold text-gray-800 flex items-center">
                          <Activity size={18} className="mr-2 text-blue-600" />
                          指标详情分析
                      </h3>
                      <button onClick={() => { setIsDrawerOpen(false); setSelectedIndicator(null); }} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                      {selectedIndicator ? (
                          <div className="space-y-6">
                              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <h4 className="text-lg font-bold text-gray-900 mb-1">{selectedIndicator.name}</h4>
                                          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">权重 {selectedIndicator.weight}%</span>
                                      </div>
                                      <div className="text-right">
                                          <div className="text-3xl font-bold text-blue-600">{selectedIndicator.scores.self}</div>
                                          <div className="text-xs text-gray-400 mt-1">自评得分</div>
                                      </div>
                                  </div>
                                  <div className="pt-4 border-t border-gray-100 grid grid-cols-4 gap-4 text-center">
                                      <div>
                                          <div className="text-xs text-gray-400 mb-1">主管评分</div>
                                          <div className="text-lg font-bold text-gray-800">{selectedIndicator.scores.manager || '-'}</div>
                                      </div>
                                      <div>
                                          <div className="text-xs text-gray-400 mb-1">矩阵评分</div>
                                          <div className="text-lg font-bold text-gray-800">{selectedIndicator.scores.matrix || '-'}</div>
                                      </div>
                                      <div>
                                          <div className="text-xs text-gray-400 mb-1">平级评分</div>
                                          <div className="text-lg font-bold text-gray-800">{selectedIndicator.scores.peer || '-'}</div>
                                      </div>
                                      <div>
                                          <div className="text-xs text-gray-400 mb-1">下级评分</div>
                                          <div className="text-lg font-bold text-gray-800">{selectedIndicator.scores.sub || '-'}</div>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                  <h5 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                                      <MessageSquare size={16} className="mr-2 text-blue-500" /> 评价详情
                                  </h5>
                                  <div className="space-y-4">
                                      {selectedIndicator.comments.self && selectedIndicator.comments.self !== '-' && (
                                          <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100">
                                              <div className="text-xs font-bold text-orange-800 mb-2">自评说明</div>
                                              <div className="text-sm text-gray-700 leading-relaxed">{selectedIndicator.comments.self}</div>
                                          </div>
                                      )}
                                      {selectedIndicator.comments.manager && selectedIndicator.comments.manager !== '-' && (
                                          <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                                              <div className="text-xs font-bold text-blue-800 mb-2">主管评价</div>
                                              <div className="text-sm text-gray-700 leading-relaxed">{selectedIndicator.comments.manager}</div>
                                          </div>
                                      )}
                                      {selectedIndicator.comments.matrix && selectedIndicator.comments.matrix !== '-' && (
                                          <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                                              <div className="text-xs font-bold text-purple-800 mb-2">矩阵评价</div>
                                              <div className="text-sm text-gray-700 leading-relaxed">{selectedIndicator.comments.matrix}</div>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <Activity size={48} className="mb-4 opacity-20" />
                              <p>请选择一个指标查看详情</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Share Confirmation Modal */}
      {isShareModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 flex flex-col">
                  <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                      <div>
                          <h3 className="text-xl font-bold text-gray-900">确认同步内容</h3>
                          <p className="text-sm text-gray-500 mt-1">即将发送给 <span className="font-bold text-gray-800">{session.employeeName}</span> 确认</p>
                      </div>
                      <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-6 bg-gray-50/30 flex-1 overflow-y-auto">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">配置员工可见范围</div>
                      
                      <div className="space-y-3">
                          {/* 1. Smart Summary - Hide if Direct */}
                          {!isDirect && (
                            <div className={`group flex flex-col bg-white border rounded-xl transition-all ${shareConfig.items.summary ? 'border-purple-200 shadow-sm ring-1 ring-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex items-center p-4 cursor-pointer" onClick={() => toggleShareItem('summary')}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 transition-colors ${shareConfig.items.summary ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-bold text-sm ${shareConfig.items.summary ? 'text-gray-900' : 'text-gray-500'}`}>智能纪要</div>
                                        <div className="text-xs text-gray-400 mt-0.5">AI 生成的面谈总结与行动计划</div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${shareConfig.items.summary ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'}`}>
                                        {shareConfig.items.summary && <Check size={12} className="text-white" />}
                                    </div>
                                </div>
                            </div>
                          )}

                          {/* 2. Feedback Form (With Permissions) */}
                          <div className={`group flex flex-col bg-white border rounded-xl transition-all ${shareConfig.items.form ? 'border-blue-200 shadow-sm ring-1 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                              <div className="flex items-center p-4 cursor-pointer" onClick={() => toggleShareItem('form')}>
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 transition-colors ${shareConfig.items.form ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                      <FileText size={20} />
                                  </div>
                                  <div className="flex-1">
                                      <div className={`font-bold text-sm ${shareConfig.items.form ? 'text-gray-900' : 'text-gray-500'}`}>绩效面谈记录表</div>
                                      <div className="text-xs text-gray-400 mt-0.5">完整的面谈记录与评分详情</div>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${shareConfig.items.form ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                                      {shareConfig.items.form && <Check size={12} className="text-white" />}
                                  </div>
                              </div>
                              
                              {/* Permission Config */}
                              {shareConfig.items.form && (
                                  <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-1 fade-in">
                                      <div className="bg-blue-50/50 rounded-lg p-3 flex items-center justify-between border border-blue-100">
                                          <span className="text-xs font-medium text-blue-800">员工权限设置:</span>
                                          <div className="flex bg-white rounded-md p-0.5 border border-blue-100 shadow-sm">
                                              <button 
                                                  onClick={() => setShareConfig(prev => ({...prev, formPermission: 'read'}))}
                                                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center ${shareConfig.formPermission === 'read' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                              >
                                                  <Eye size={12} className="mr-1.5" /> 仅查看
                                              </button>
                                              <button 
                                                  onClick={() => setShareConfig(prev => ({...prev, formPermission: 'edit'}))}
                                                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center ${shareConfig.formPermission === 'edit' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                              >
                                                  <Edit3 size={12} className="mr-1.5" /> 允许修改
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>

                          {/* 3. Secondary Items Grid - Hide if Direct */}
                          {!isDirect && (
                            <div className="grid grid-cols-1 gap-3">
                                {/* Basic Info */}
                                <div 
                                    className={`flex items-center p-3 bg-white border rounded-lg cursor-pointer transition-all ${shareConfig.items.info ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    onClick={() => toggleShareItem('info')}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 ${shareConfig.items.info ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
                                        <Info size={16} />
                                    </div>
                                    <span className={`text-sm font-medium flex-1 ${shareConfig.items.info ? 'text-gray-900' : 'text-gray-500'}`}>基本信息</span>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${shareConfig.items.info ? 'bg-gray-600 border-gray-600' : 'border-gray-300 bg-white'}`}>
                                        {shareConfig.items.info && <Check size={10} className="text-white" />}
                                    </div>
                                </div>

                                {/* Reference */}
                                <div 
                                    className={`flex items-center p-3 bg-white border rounded-lg cursor-pointer transition-all ${shareConfig.items.ref ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    onClick={() => toggleShareItem('ref')}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 ${shareConfig.items.ref ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
                                        <BookOpen size={16} />
                                    </div>
                                    <span className={`text-sm font-medium flex-1 ${shareConfig.items.ref ? 'text-gray-900' : 'text-gray-500'}`}>参考资料</span>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${shareConfig.items.ref ? 'bg-gray-600 border-gray-600' : 'border-gray-300 bg-white'}`}>
                                        {shareConfig.items.ref && <Check size={10} className="text-white" />}
                                    </div>
                                </div>

                                {/* Replay */}
                                <div 
                                    className={`flex items-center p-3 bg-white border rounded-lg cursor-pointer transition-all ${shareConfig.items.replay ? 'border-orange-300 bg-orange-50' : 'border-dashed border-gray-300 hover:border-gray-400'}`}
                                    onClick={() => toggleShareItem('replay')}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 ${shareConfig.items.replay ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Video size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <span className={`text-sm font-medium ${shareConfig.items.replay ? 'text-gray-900' : 'text-gray-500'}`}>回放/原文</span>
                                        <span className="text-[10px] text-orange-500 ml-2 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">敏感信息</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${shareConfig.items.replay ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                        {shareConfig.items.replay && <Check size={10} className="text-white" />}
                                    </div>
                                </div>
                            </div>
                          )}
                      </div>
                  </div>
                  
                  <div className="px-6 py-5 bg-white border-t border-gray-100 flex justify-end space-x-3">
                      <button 
                          onClick={() => setIsShareModalOpen(false)}
                          className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                          onClick={handleConfirmShare}
                          className="px-8 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 transition-all flex items-center"
                      >
                          <Send size={14} className="mr-2" /> 确认并发送
                      </button>
                  </div>
              </div>
          </div>
      )}

        {/* Others Scores Drawer */}
        <div className={`fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out flex flex-col ${isOthersScoresDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Users size={18} className="text-blue-600 mr-2" />
                    他人评分详情
                </h3>
                <button onClick={() => setIsOthersScoresDrawerOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                    <X size={18} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                <div className="space-y-6">
                    {/* Mock Data for Others Scores */}
                    {[
                        { role: '虚线主管', name: '李四', score: 85, comment: '在跨部门协作中表现积极，但项目交付略有延迟。' },
                        { role: '平级同事', name: '王五', score: 90, comment: '技术能力强，乐于分享，团队合作融洽。' },
                        { role: '下属', name: '赵六', score: 95, comment: '指导耐心，团队氛围好，是一位好导师。' },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                        {item.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.role}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-blue-600">{item.score}分</div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
                                "{item.comment}"
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Activity Log Drawer */}
        <div className={`fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out flex flex-col ${isActivityLogDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Activity size={18} className="text-blue-600 mr-2" />
                    活动日志
                </h3>
                <button onClick={() => setIsActivityLogDrawerOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                    <X size={18} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-8">
                    {/* Mock Data for Activity Log */}
                    {[
                        { time: '2026-02-28 10:30', action: '提交了自评', user: '张妮' },
                        { time: '2026-02-27 15:45', action: '更新了 OKR 进度', user: '张妮' },
                        { time: '2026-02-25 09:12', action: '完成了平级评价', user: '王五' },
                        { time: '2026-02-20 14:20', action: '发起了绩效考核', user: '系统' },
                    ].map((log, idx) => (
                        <div key={idx} className="relative pl-6">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                            <div className="text-xs font-bold text-gray-500 mb-1">{log.time}</div>
                            <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
                                <span className="font-bold text-gray-800 text-sm mr-2">{log.user}</span>
                                <span className="text-sm text-gray-600">{log.action}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Overlay for Drawers */}
        {(isOthersScoresDrawerOpen || isActivityLogDrawerOpen) && (
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] transition-opacity"
                onClick={() => {
                    setIsOthersScoresDrawerOpen(false);
                    setIsActivityLogDrawerOpen(false);
                }}
            ></div>
        )}

    </div>
  );
};

export default InterviewForm;
