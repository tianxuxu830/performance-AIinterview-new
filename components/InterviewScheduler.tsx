
import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, Clock, Users, 
  FileText, Check, ChevronDown, UserPlus, Info,
  Hourglass, X, Video, Sparkles, TrendingUp,
  BarChart2, BookOpen, AlertCircle, Eye, Layers, Lock
} from 'lucide-react';
import { MOCK_EMPLOYEES, MOCK_TEMPLATES, MOCK_ASSESSMENT_DETAILS, MOCK_AI_OUTLINE, ExtendedAssessmentDetail } from '../constants';
import { InterviewType, SchedulingStatus, DimensionItem } from '../types';
import EmployeeSelectorModal from './EmployeeSelectorModal';
import AssessmentDetailTable from './AssessmentDetailTable';

interface InterviewSchedulerProps {
  employeeIds: string[];
  onBack: () => void;
  onSubmit: (data: any) => void;
  // New props for fixed data
  defaultTopic?: string;
  defaultTemplateId?: string;
  defaultAssessmentCycle?: string;
}

const INTERVIEWER_ROLES = [
  { id: 'manager', label: '直属上级', default: true },
  { id: 'hrbp', label: 'HRBP', default: false },
  { id: 'dept_head', label: '部门负责人', default: false },
  { id: 'skip_manager', label: '隔级上级', default: false },
];

const ASSESSMENT_CYCLES = [
    '2025 Q4',
    '2025 Q3',
    '2025 Q2',
    '2025 Q1',
    '试用期评估'
];

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({ 
    employeeIds, 
    onBack, 
    onSubmit,
    defaultTopic = '2023 Q3 绩效面谈',
    defaultTemplateId = MOCK_TEMPLATES[0].id,
    defaultAssessmentCycle = '2025 Q4'
}) => {
  // --- Form State (Basic Info) ---
  const [topic, setTopic] = useState(defaultTopic);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [interviewType, setInterviewType] = useState<InterviewType>(InterviewType.Regular);
  const [templateId, setTemplateId] = useState(defaultTemplateId);
  const [assessmentCycle, setAssessmentCycle] = useState(defaultAssessmentCycle);
  
  // Participants State
  const [currentEmployeeIds, setCurrentEmployeeIds] = useState<string[]>(employeeIds);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['manager']);

  // Scheduling Mode
  const [schedulingStatus, setSchedulingStatus] = useState<SchedulingStatus>('scheduled');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); 

  // --- UI State ---
  // Default to 'outline' as requested
  const [activeTab, setActiveTab] = useState<'basic' | 'outline' | 'reference'>('outline');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- Derived Data ---
  const selectedEmployees = MOCK_EMPLOYEES.filter(e => currentEmployeeIds.includes(e.id));
  const isBatch = selectedEmployees.length > 1;
  const currentTemplate = MOCK_TEMPLATES.find(t => t.id === templateId) || MOCK_TEMPLATES[0];
  
  // Mock Assessment Data for the primary employee (or first in batch)
  const primaryEmpId = currentEmployeeIds[0] || '1';
  const assessmentDetail = (MOCK_ASSESSMENT_DETAILS[primaryEmpId] || MOCK_ASSESSMENT_DETAILS['default']) as ExtendedAssessmentDetail;
  const primaryEmployee = MOCK_EMPLOYEES.find(e => e.id === primaryEmpId);

  // --- Handlers ---
  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleRemoveEmployee = (id: string) => {
    setCurrentEmployeeIds(prev => prev.filter(empId => empId !== id));
  };

  const handleSubmit = () => {
    if (currentEmployeeIds.length === 0) {
        alert('请至少选择一名面谈对象');
        return;
    }

    const data = {
      employeeIds: currentEmployeeIds,
      topic,
      date: schedulingStatus === 'scheduled' ? date : '',
      startTime: schedulingStatus === 'scheduled' ? startTime : '',
      duration,
      type: interviewType,
      templateId,
      assessmentCycle,
      location: '腾讯会议',
      interviewerRoles: selectedRoles,
      managerName: selectedRoles.includes('manager') ? '直属上级' : 'HRBP',
      schedulingStatus,
      deadline: schedulingStatus === 'pending' ? deadline : undefined
    };
    onSubmit(data);
  };

  // --- Render Helpers ---

  // 1. Left Panel: Performance Summary
  const renderLeftPanel = () => (
      <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <BarChart2 size={20} className="mr-2 text-blue-600" />
                  绩效考核总结
              </h2>
              <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center border border-blue-100 bg-blue-50 px-2 py-1 rounded"
              >
                  <Eye size={12} className="mr-1" /> 详情
              </button>
          </div>

          {/* Score Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingUp size={80} />
              </div>
              <div className="relative z-10">
                  <div className="text-sm font-medium opacity-90 mb-1">2023 Q3 综合评分</div>
                  <div className="flex items-baseline">
                      <span className="text-4xl font-bold mr-2">88.5</span>
                      <span className="text-xl font-medium bg-white/20 px-2 py-0.5 rounded">等级 A</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs opacity-90">
                      <div>
                          <div className="opacity-70">KPI 得分</div>
                          <div className="font-bold text-lg">92.0</div>
                      </div>
                      <div>
                          <div className="opacity-70">OKR 得分</div>
                          <div className="font-bold text-lg">85.0</div>
                      </div>
                      <div>
                          <div className="opacity-70">环比</div>
                          <div className="font-bold text-lg flex items-center text-green-300">
                              +2.5% <TrendingUp size={12} className="ml-1" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* AI Analysis */}
          <div className="space-y-4">
               <div className="flex items-center text-gray-800 font-bold text-sm">
                   <Sparkles size={16} className="text-purple-600 mr-2" />
                   AI 智能分析
               </div>
               <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-sm text-gray-700 leading-relaxed">
                   <p className="mb-2">
                       <span className="font-bold text-purple-700">整体评价：</span> 
                       {primaryEmployee?.name}本季度表现优异，特别是在核心业务指标达成上超出预期。
                   </p>
                   <p className="mb-2">
                       <span className="font-bold text-orange-600">关注点：</span> 
                       自评与他评在“团队协作”维度存在一定分歧（分差 &gt; 15分），建议面谈时重点对此进行澄清。
                   </p>
                   <p>
                       <span className="font-bold text-blue-600">建议：</span> 
                       鼓励其分享项目经验，同时设定下一阶段关于领导力培养的目标。
                   </p>
               </div>
          </div>

          <div className="border-t border-gray-100 my-6"></div>

          {/* Key Indicators Preview */}
          <div>
              <div className="text-sm font-bold text-gray-700 mb-3">关键指标概览</div>
              <div className="space-y-3">
                  {assessmentDetail.highlights.slice(0, 1).map(item => (
                      <div key={item.id} className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-green-700">高分项</span>
                              <span className="text-xs font-bold text-green-600">{item.managerScore}分</span>
                          </div>
                          <div className="text-sm text-gray-800 truncate">{item.name}</div>
                      </div>
                  ))}
                   {assessmentDetail.controversies.slice(0, 1).map(item => (
                      <div key={item.id} className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-orange-700">争议项 (分差大)</span>
                              <span className="text-xs text-gray-500">自评 {item.selfScore} vs 他评 {item.managerScore}</span>
                          </div>
                          <div className="text-sm text-gray-800 truncate">{item.name}</div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  // 2. Right Panel Content: Outline
  const renderOutlineTab = () => (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800">面谈智能大纲预览</h3>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">基于模版: {currentTemplate.name}</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[400px]">
               <div className="whitespace-pre-wrap font-sans text-sm leading-7 text-gray-700">
                   {MOCK_AI_OUTLINE}
               </div>
          </div>
      </div>
  );

  // 3. Right Panel Content: Basic Info (The Form)
  const renderBasicInfoTab = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
          {/* Topic & Template */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          面谈主题
                          <Lock size={12} className="ml-1 text-gray-400" />
                      </label>
                      <input 
                        type="text" 
                        value={topic}
                        disabled
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed rounded-lg p-2.5 text-sm focus:ring-0"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          关联考核周期
                          <Lock size={12} className="ml-1 text-gray-400" />
                      </label>
                      <select 
                        value={assessmentCycle}
                        disabled
                        onChange={(e) => setAssessmentCycle(e.target.value)}
                        className="w-full border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed rounded-lg p-2.5 text-sm focus:ring-0"
                      >
                          {ASSESSMENT_CYCLES.map(cycle => (
                              <option key={cycle} value={cycle}>{cycle}</option>
                          ))}
                      </select>
                  </div>
                  <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          面谈模板
                          <Lock size={12} className="ml-1 text-gray-400" />
                      </label>
                      <select 
                        value={templateId}
                        disabled
                        onChange={(e) => setTemplateId(e.target.value)}
                        className="w-full border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed rounded-lg p-2.5 text-sm focus:ring-0"
                      >
                          {MOCK_TEMPLATES.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                      </select>
                  </div>
              </div>
          </div>

          {/* Participants */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex justify-between items-center mb-3">
                 <label className="text-sm font-medium text-gray-700 flex items-center">
                     面谈对象
                     <span className="text-xs text-gray-400 ml-2 font-normal">(已固定)</span>
                 </label>
                 {/* Modify button removed */}
             </div>
             <div className="flex flex-wrap gap-2 mb-4">
                  {selectedEmployees.map(emp => (
                    <div key={emp.id} className="flex items-center bg-gray-50 border border-gray-200 rounded-full pl-1 pr-3 py-1">
                       <img src={emp.avatar} alt="" className="w-5 h-5 rounded-full mr-2" />
                       <span className="text-xs text-gray-700">{emp.name}</span>
                       {/* Remove button removed for fixed participants */}
                    </div>
                  ))}
             </div>

             <label className="text-sm font-medium text-gray-700 mb-2 block">面谈官 (角色)</label>
             <div className="flex flex-wrap gap-2">
                  {INTERVIEWER_ROLES.map(role => (
                      <button
                        key={role.id}
                        onClick={() => toggleRole(role.id)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                          selectedRoles.includes(role.id)
                            ? 'bg-blue-50 border-blue-500 text-blue-700' 
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                         {role.label}
                      </button>
                  ))}
             </div>
          </div>

          {/* Time & Location */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">排期方式</label>
                <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" checked={schedulingStatus === 'scheduled'} onChange={() => setSchedulingStatus('scheduled')} className="text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">直接指定时间</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" checked={schedulingStatus === 'pending'} onChange={() => setSchedulingStatus('pending')} className="text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">稍后确认 (发送待办)</span>
                    </label>
                </div>
             </div>

             {schedulingStatus === 'scheduled' ? (
                 <div className="grid grid-cols-3 gap-4">
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">日期</label>
                          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">时间</label>
                          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-500 mb-1">时长</label>
                          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                              <option value="30">30m</option>
                              <option value="60">60m</option>
                          </select>
                      </div>
                 </div>
             ) : (
                 <div>
                     <label className="block text-xs text-gray-500 mb-1">截止日期</label>
                     <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full border border-orange-300 bg-orange-50/20 rounded p-2 text-sm" />
                 </div>
             )}

             <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                 <div className="flex items-center text-sm text-gray-700">
                     <img src="https://meeting.tencent.com/static/img/281358d8336338e55e5108a705e49539.png" className="w-5 h-5 mr-2" alt="Tencent"/>
                     腾讯会议
                 </div>
                 <span className="text-xs text-gray-400">预约成功后自动生成链接</span>
             </div>
          </div>
      </div>
  );

  // 4. Right Panel Content: Reference
  const renderReferenceTab = () => (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
           <h3 className="font-bold text-gray-800 mb-2">考核指标详情</h3>
           <div className="space-y-3">
               {assessmentDetail.highlights.map(item => (
                   <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-bold text-gray-800">{item.name}</span>
                           <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">高分项</span>
                       </div>
                       <div className="text-xs text-gray-500 flex justify-between">
                           <span>自评: {item.selfScore}</span>
                           <span>他评: {item.managerScore}</span>
                       </div>
                   </div>
               ))}
               {assessmentDetail.controversies.map(item => (
                   <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-bold text-gray-800">{item.name}</span>
                           <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">争议项</span>
                       </div>
                       <div className="text-xs text-gray-500 flex justify-between">
                           <span>自评: {item.selfScore}</span>
                           <span>他评: {item.managerScore}</span>
                       </div>
                       <div className="mt-2 text-xs bg-gray-50 p-2 rounded text-gray-600 italic">
                           "{item.description}"
                       </div>
                   </div>
               ))}
           </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden relative">
      {/* 1. Global Header (Sticky) */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm sticky top-0 z-20 shrink-0">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {isBatch ? '批量预约面谈' : '预约面谈'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">请确认面谈时间及内容大纲</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={onBack} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            取消
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors flex items-center"
          >
            <Video size={16} className="mr-2" />
            确认预约
          </button>
        </div>
      </div>

      {/* 2. Main Content (Split View) */}
      <div className="flex-1 overflow-hidden p-6 flex gap-6 relative">
          
          {/* Left Panel: Analysis */}
          <div className="w-[35%] min-w-[320px] flex flex-col h-full">
              {renderLeftPanel()}
          </div>

          {/* Right Panel: Tabs & Config */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
               {/* Tab Header */}
               <div className="flex border-b border-gray-200 px-2 shrink-0">
                   <button 
                      onClick={() => setActiveTab('basic')}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                      基本信息
                   </button>
                   <button 
                      onClick={() => setActiveTab('outline')}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'outline' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                      <span className="flex items-center justify-center">
                          <Sparkles size={14} className="mr-1.5" /> 智能大纲
                      </span>
                   </button>
                   <button 
                      onClick={() => setActiveTab('reference')}
                      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reference' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                      参考资料
                   </button>
               </div>

               {/* Tab Content Area */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/30">
                   {activeTab === 'outline' && renderOutlineTab()}
                   {activeTab === 'basic' && renderBasicInfoTab()}
                   {activeTab === 'reference' && renderReferenceTab()}
               </div>
          </div>

          {/* 3. Detail Drawer (Overlay) */}
          {isDrawerOpen && (
              <div className="absolute inset-0 z-30 flex justify-end bg-black/20 backdrop-blur-[1px] transition-all">
                  <div className="w-[800px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                          <h3 className="font-bold text-gray-800 flex items-center">
                              <FileText size={18} className="mr-2 text-blue-600" />
                              绩效考核表详情
                          </h3>
                          <button onClick={() => setIsDrawerOpen(false)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                              <X size={20} />
                          </button>
                      </div>
                      <div className="flex-1 overflow-hidden p-0">
                          <AssessmentDetailTable detail={assessmentDetail} period="2023 Q3" />
                      </div>
                  </div>
              </div>
          )}
      </div>

      <EmployeeSelectorModal 
        isOpen={isSelectorOpen} 
        onClose={() => setIsSelectorOpen(false)}
        onSelect={(ids) => {
            setCurrentEmployeeIds(ids);
            setIsSelectorOpen(false);
        }}
        initialSelectedIds={currentEmployeeIds}
      />
    </div>
  );
};

export default InterviewScheduler;
