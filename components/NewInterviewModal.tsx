
import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User, ChevronRight, Users, Clock, FileText, Grip, Layers, Settings, PenLine, FileSignature, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { MOCK_EMPLOYEES, MOCK_TEMPLATES } from '../constants';
import EmployeeSelectorModal from './EmployeeSelectorModal';

interface NewInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialEmployeeIds?: string[];
  defaultTopic?: string;
}

const NewInterviewModal: React.FC<NewInterviewModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialEmployeeIds = [],
  defaultTopic = '绩效面谈'
}) => {
  const [sourceType, setSourceType] = useState<'assessment' | 'independent'>('assessment');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(MOCK_TEMPLATES[0].id);
  const [deadline, setDeadline] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [topic, setTopic] = useState(defaultTopic);
  const [assessmentTask, setAssessmentTask] = useState('2025 Q4 绩效考核');
  const [interviewerRole, setInterviewerRole] = useState('manager');
  
  // New Configuration States
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [signatureType, setSignatureType] = useState<'confirmation' | 'handwritten' | 'electronic'>('confirmation');

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Resize State
  const [dimensions, setDimensions] = useState({ width: 800, height: 850 }); 
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const INTERVIEWER_ROLES = [
    { value: 'manager', label: '直属上级' },
    { value: 'hrbp', label: 'HRBP' },
    { value: 'dept_head', label: '部门负责人' },
    { value: 'skip_manager', label: '隔级上级' }
  ];

  const ASSESSMENT_TASKS = [
      '2025 Q4 绩效考核',
      '2025 Q3 绩效考核',
      '2025 Q2 绩效考核',
      '2025 Q1 绩效考核',
      '2025 试用期评估'
  ];

  useEffect(() => {
    if (isOpen) {
      setSourceType('assessment'); // Default to assessment
      setSelectedEmployeeIds(initialEmployeeIds);
      setTopic(defaultTopic);
      setInterviewerRole('manager');
      setAssessmentTask('2025 Q4 绩效考核');
      setRequireConfirmation(true);
      setSignatureType('confirmation');
    } 
  }, [isOpen, initialEmployeeIds, defaultTopic]);

  // Auto-update topic when assessment task changes if source is assessment
  useEffect(() => {
      if (sourceType === 'assessment' && assessmentTask) {
          setTopic(`${assessmentTask} 面谈`);
      } else if (sourceType === 'independent' && topic.includes('考核')) {
          setTopic('日常辅导面谈');
      }
  }, [assessmentTask, sourceType]);

  // Resize Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      
      setDimensions({
          width: Math.max(600, startPos.current.w + deltaX * 2),
          height: Math.max(500, startPos.current.h + deltaY * 2)
      });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isOpen) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  const startResize = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing.current = true;
      startPos.current = {
          x: e.clientX,
          y: e.clientY,
          w: dimensions.width,
          h: dimensions.height
      };
      document.body.style.cursor = 'nwse-resize';
      document.body.style.userSelect = 'none';
  };

  const isBatch = selectedEmployeeIds.length > 1;
  const singleEmployee = selectedEmployeeIds.length === 1 ? MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeIds[0]) : null;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
        <div 
          ref={modalRef}
          className="bg-white rounded-xl shadow-xl flex flex-col relative overflow-hidden transition-all duration-75 ease-out"
          style={{ 
              width: dimensions.width, 
              height: dimensions.height,
              maxWidth: '95vw',
              maxHeight: '95vh'
          }}
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 shrink-0">
            <h2 className="text-lg font-bold text-gray-800">
                {isBatch ? '批量发起绩效面谈' : '发起绩效面谈'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-6 max-w-3xl mx-auto">
                
                  {/* 1. Source Type (Interview Context) */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-sm font-medium text-gray-700 text-right">
                          <span className="text-red-500 mr-1">*</span>面谈背景
                      </label>
                      <div className="col-span-3 flex items-center space-x-6">
                          <label className="flex items-center cursor-pointer group relative">
                              <input 
                                type="radio" 
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                checked={sourceType === 'assessment'}
                                onChange={() => setSourceType('assessment')}
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center">
                                  关联考核任务
                                  <div className="ml-1 text-gray-400 hover:text-blue-500 transition-colors cursor-help">
                                      <HelpCircle size={14} />
                                  </div>
                              </span>
                              {/* Tooltip */}
                              <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed font-normal">
                                  <div className="absolute -top-1 left-6 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                                  针对已有考核计划发起。系统将自动调取考评数据，面谈记录将归档至对应考核任务中。
                              </div>
                          </label>

                          <label className="flex items-center cursor-pointer group relative">
                              <input 
                                type="radio" 
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                checked={sourceType === 'independent'}
                                onChange={() => setSourceType('independent')}
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center">
                                  专项/日常面谈
                                  <div className="ml-1 text-gray-400 hover:text-blue-500 transition-colors cursor-help">
                                      <HelpCircle size={14} />
                                  </div>
                              </span>
                              {/* Tooltip */}
                              <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed font-normal">
                                  <div className="absolute -top-1 left-6 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                                  针对特定事件发起的单次沟通。适用于绩效预警、日常反馈等独立场景。
                              </div>
                          </label>
                      </div>
                  </div>

                  {/* 2. Assessment Task (Conditional) */}
                  {sourceType === 'assessment' && (
                      <div className="grid grid-cols-4 items-center gap-4 animate-in fade-in slide-in-from-top-2">
                          <label className="text-sm font-medium text-gray-700 text-right">
                              <span className="text-red-500 mr-1">*</span>关联考核任务
                          </label>
                          <div className="col-span-3">
                              <div className="relative">
                                <select 
                                    className="w-full pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                    value={assessmentTask}
                                    onChange={(e) => setAssessmentTask(e.target.value)}
                                >
                                    {ASSESSMENT_TASKS.map(task => (
                                        <option key={task} value={task}>{task}</option>
                                    ))}
                                </select>
                                <Layers className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                              </div>
                          </div>
                      </div>
                  )}

                  {/* 3. Interview Target */}
                  <div className="grid grid-cols-4 items-start gap-4">
                      <label className="text-sm font-medium text-gray-700 text-right pt-2.5">
                          <span className="text-red-500 mr-1">*</span>面谈对象
                      </label>
                      <div className="col-span-3">
                          <div 
                            onClick={() => setIsSelectorOpen(true)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/10 transition-all group bg-white shadow-sm flex justify-between items-center"
                          >
                            {isBatch ? (
                                <div className="flex items-center text-blue-700">
                                    <Users size={18} className="mr-2 text-blue-500" />
                                    <span className="text-sm font-medium">已选择 {selectedEmployeeIds.length} 人</span>
                                </div>
                            ) : singleEmployee ? (
                                <div className="flex items-center">
                                    <img src={singleEmployee.avatar} alt="" className="w-6 h-6 rounded-full mr-2" />
                                    <span className="text-sm font-medium text-gray-900">{singleEmployee.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({singleEmployee.department})</span>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">请选择员工...</span>
                            )}
                            <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500" />
                          </div>
                      </div>
                  </div>

                  {/* 4. Topic */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-sm font-medium text-gray-700 text-right">
                          <span className="text-red-500 mr-1">*</span>面谈主题
                      </label>
                      <div className="col-span-3">
                          <input 
                              type="text" 
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              placeholder="请输入面谈名称"
                          />
                      </div>
                  </div>

                  {/* 5. Template */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-sm font-medium text-gray-700 text-right">
                          <span className="text-red-500 mr-1">*</span>面谈模板
                      </label>
                      <div className="col-span-3">
                          <select 
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                              value={selectedTemplate}
                              onChange={(e) => setSelectedTemplate(e.target.value)}
                          >
                              {MOCK_TEMPLATES.map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                          </select>
                      </div>
                  </div>

                  {/* 6. Interviewer */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-sm font-medium text-gray-700 text-right">
                          <span className="text-red-500 mr-1">*</span>面谈官
                      </label>
                      <div className="col-span-3">
                          <select 
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                              value={interviewerRole}
                              onChange={(e) => setInterviewerRole(e.target.value)}
                          >
                              {INTERVIEWER_ROLES.map(role => (
                                  <option key={role.value} value={role.value}>{role.label}</option>
                              ))}
                          </select>
                      </div>
                  </div>

                  {/* 7. Deadline */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-sm font-medium text-gray-700 text-right">
                          <span className="text-red-500 mr-1">*</span>面谈截止时间
                      </label>
                      <div className="col-span-3">
                          <div className="relative">
                              <input 
                                  type="date" 
                                  className="w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
                                  value={deadline}
                                  onChange={(e) => setDeadline(e.target.value)}
                              />
                              <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                          </div>
                      </div>
                  </div>

                  {/* 8. Confirmation Config */}
                  <div className="grid grid-cols-4 items-start gap-4 pt-2">
                      <label className="text-sm font-medium text-gray-700 text-right pt-1">
                          <span className="text-red-500 mr-1">*</span>是否员工确认
                      </label>
                      <div className="col-span-3 space-y-4">
                          <button 
                              onClick={() => setRequireConfirmation(!requireConfirmation)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${requireConfirmation ? 'bg-blue-600' : 'bg-gray-200'}`}
                          >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${requireConfirmation ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>

                          {requireConfirmation && (
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-1">
                                  <div className="flex items-center mb-3">
                                      <span className="text-sm font-bold text-gray-700 mr-4">确认方式:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                      <label className={`flex items-center cursor-pointer px-3 py-2 rounded-md border text-sm transition-all ${signatureType === 'confirmation' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                                          <input type="radio" name="sigType" className="hidden" checked={signatureType === 'confirmation'} onChange={() => setSignatureType('confirmation')} />
                                          <CheckCircle2 size={16} className="mr-2" /> 仅确认
                                      </label>
                                      <label className={`flex items-center cursor-pointer px-3 py-2 rounded-md border text-sm transition-all ${signatureType === 'handwritten' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                                          <input type="radio" name="sigType" className="hidden" checked={signatureType === 'handwritten'} onChange={() => setSignatureType('handwritten')} />
                                          <PenLine size={16} className="mr-2" /> 手写签
                                      </label>
                                      <label className={`flex items-center cursor-pointer px-3 py-2 rounded-md border text-sm transition-all ${signatureType === 'electronic' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                                          <input type="radio" name="sigType" className="hidden" checked={signatureType === 'electronic'} onChange={() => setSignatureType('electronic')} />
                                          <FileSignature size={16} className="mr-2" /> 电子签
                                      </label>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

              </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-end space-x-3 shrink-0">
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={() => {
                  onSubmit({ 
                      employeeIds: selectedEmployeeIds, 
                      templateId: selectedTemplate, 
                      deadline, 
                      topic,
                      assessmentTask: sourceType === 'assessment' ? assessmentTask : undefined, 
                      sourceType,
                      interviewerRole,
                      requireConfirmation,
                      signatureType,
                      status: 'NotStarted',
                      schedulingStatus: 'pending' 
                  });
                  onClose();
              }}
              disabled={selectedEmployeeIds.length === 0 || !deadline || !topic}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              {isBatch ? `批量发起 (${selectedEmployeeIds.length})` : '发起任务'}
            </button>
          </div>

          {/* Resize Handle */}
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center z-50 text-gray-400 hover:text-blue-600"
            onMouseDown={startResize}
          >
             <Grip size={16} className="transform rotate-90" />
          </div>
        </div>
      </div>
      
      <EmployeeSelectorModal 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={(ids) => {
            setSelectedEmployeeIds(ids);
            setIsSelectorOpen(false);
        }}
        initialSelectedIds={selectedEmployeeIds}
        filterTask={sourceType === 'assessment' ? assessmentTask : undefined}
      />
    </>
  );
};

export default NewInterviewModal;
