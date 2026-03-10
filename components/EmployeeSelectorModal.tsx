
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, CheckSquare, Square, Filter, Calendar, BarChart3, Trophy, Briefcase, Users } from 'lucide-react';
import { MOCK_EMPLOYEES, MOCK_PERFORMANCE_RECORDS } from '../constants';

interface EmployeeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employeeIds: string[]) => void;
  initialSelectedIds?: string[];
  interviewType?: 'assessment' | 'daily';
}

const EmployeeSelectorModal: React.FC<EmployeeSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  initialSelectedIds = [],
  interviewType = 'assessment'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // We track selected IDs. For assessment, it's record IDs. For daily, it's employee IDs.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Extract all available periods
  const allPeriods = useMemo(() => {
      const periods = Array.from(new Set(MOCK_PERFORMANCE_RECORDS.map(r => r.period)));
      return periods.sort().reverse(); // Show latest first
  }, []);

  // Generate derived tasks
  const allTasks = useMemo(() => {
      // Mock logic: combine period + " 绩效考核" to mimic tasks
      const tasks = Array.from(new Set(MOCK_PERFORMANCE_RECORDS.map(r => `${r.period} 绩效考核`)));
      return tasks.sort().reverse();
  }, []);

  const availableGrades = ['S', 'A', 'B', 'C', 'D'];

  // Filter States
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [minScore, setMinScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedGrade('');
      setMinScore('');
      setMaxScore('');
      
      setSelectedTask('');
      if(allPeriods.length > 0) setSelectedPeriod(allPeriods[0]);

      // Restore selections
      const initialIds = new Set<string>();
      if (initialSelectedIds.length > 0) {
          if (interviewType === 'assessment') {
              initialSelectedIds.forEach(empId => {
                  const targetPeriod = selectedPeriod || allPeriods[0];
                  const rec = MOCK_PERFORMANCE_RECORDS.find(r => r.employeeId === empId && r.period === targetPeriod);
                  if (rec) initialIds.add(rec.id);
              });
          } else {
              initialSelectedIds.forEach(id => initialIds.add(id));
          }
      }
      setSelectedIds(initialIds);
    }
  }, [isOpen, initialSelectedIds, allPeriods, interviewType]);

  // Prepare the display data
  const displayData = useMemo(() => {
    if (interviewType === 'assessment') {
        return MOCK_PERFORMANCE_RECORDS.map(record => {
            const employee = MOCK_EMPLOYEES.find(e => e.id === record.employeeId);
            return {
                ...record,
                taskName: `${record.period} 绩效考核`,
                employee
            };
        }).filter(item => !!item.employee);
    } else {
        return MOCK_EMPLOYEES.map(emp => ({
            id: emp.id,
            employee: emp,
            // For daily, we might still want to show some performance context if available
            lastPerformance: emp.lastPerformance || '无',
            lastInterviewDate: emp.lastInterviewDate || '无'
        }));
    }
  }, [interviewType]);

  // Filter Logic
  const filteredData = displayData.filter(item => {
      // 1. Fuzzy Search
      const matchesSearch = 
        (item.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (item.employee?.department.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (item.employee?.role.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (item.employee?.id.includes(searchTerm));
      
      if (interviewType === 'assessment') {
          const assessmentItem = item as any;
          // 2. Period Filter
          const matchesPeriod = selectedPeriod ? assessmentItem.period === selectedPeriod : true;
          // 3. Task Filter
          const matchesTask = selectedTask ? assessmentItem.taskName === selectedTask : true;
          // 4. Grade Filter
          const matchesGrade = selectedGrade ? assessmentItem.grade === selectedGrade : true;
          // 5. Score Range Filter
          const score = assessmentItem.overallScore;
          const matchesMinScore = minScore !== '' ? score >= Number(minScore) : true;
          const matchesMaxScore = maxScore !== '' ? score <= Number(maxScore) : true;

          return matchesSearch && matchesPeriod && matchesTask && matchesGrade && matchesMinScore && matchesMaxScore;
      }

      return matchesSearch;
  });

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleConfirm = () => {
    let selectedEmpIds: string[] = [];
    if (interviewType === 'assessment') {
        selectedEmpIds = Array.from(selectedIds).map(rId => {
            const rec = MOCK_PERFORMANCE_RECORDS.find(r => r.id === rId);
            return rec ? rec.employeeId : '';
        }).filter(id => id !== '');
    } else {
        selectedEmpIds = Array.from(selectedIds);
    }
    
    onSelect(selectedEmpIds);
    onClose();
  };

  const handleSelectAllFiltered = () => {
     const newSet = new Set(selectedIds);
     filteredData.forEach(item => newSet.add(item.id));
     setSelectedIds(newSet);
  };

  const handleClearSelection = () => {
      setSelectedIds(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">选择面谈对象</h2>
            <p className="text-sm text-gray-500 mt-0.5">
                {interviewType === 'assessment' ? '请选择需要进行面谈的考核周期。' : '请搜索并选择需要进行面谈的员工。'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-white border-b border-gray-100 flex flex-wrap items-center gap-3">
             
             {interviewType === 'assessment' && (
                 <>
                    {/* Task Selector */}
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                        <Briefcase size={14} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">任务:</span>
                        <select 
                            value={selectedTask}
                            onChange={(e) => {
                                setSelectedTask(e.target.value);
                                const derivedPeriod = allPeriods.find(p => e.target.value.includes(p));
                                if(derivedPeriod) setSelectedPeriod(derivedPeriod);
                                else if (e.target.value === '') setSelectedPeriod('');
                            }}
                            className="bg-transparent border-none text-gray-700 text-sm focus:ring-0 p-1 cursor-pointer font-medium max-w-[180px] truncate"
                        >
                            <option value="">全部任务</option>
                            {allTasks.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Period Selector */}
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200 opacity-80">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">周期:</span>
                        <select 
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            disabled={!!selectedTask}
                            className={`bg-transparent border-none text-gray-700 text-sm focus:ring-0 p-1 font-medium w-24 ${!!selectedTask ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {allPeriods.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                            <option value="">全部</option>
                        </select>
                    </div>

                    {/* Grade Selector */}
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                        <Trophy size={14} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">等级:</span>
                        <select 
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="bg-transparent border-none text-gray-700 text-sm focus:ring-0 p-1 cursor-pointer font-medium w-20"
                        >
                            <option value="">全部</option>
                            {availableGrades.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    {/* Score Range Selector */}
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                        <BarChart3 size={14} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">得分:</span>
                        <input 
                            type="number" 
                            placeholder="最低" 
                            value={minScore}
                            onChange={(e) => setMinScore(e.target.value)}
                            className="w-12 bg-transparent border-b border-gray-300 text-center text-sm focus:border-blue-500 focus:outline-none p-0"
                        />
                        <span className="text-gray-400">-</span>
                        <input 
                            type="number" 
                            placeholder="最高" 
                            value={maxScore}
                            onChange={(e) => setMaxScore(e.target.value)}
                            className="w-12 bg-transparent border-b border-gray-300 text-center text-sm focus:border-blue-500 focus:outline-none p-0"
                        />
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                 </>
             )}

             {/* Search */}
             <div className="relative flex-1 min-w-[200px]">
                <input 
                    type="text" 
                    className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="搜索姓名、部门、职位..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2 text-gray-400" size={14} />
             </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-2 bg-gray-50/50 border-b border-gray-200 flex justify-between items-center">
             <div className="text-xs text-gray-500">
                 共找到 <span className="font-bold text-gray-800">{filteredData.length}</span> 条{interviewType === 'assessment' ? '考核记录' : '员工记录'}
             </div>
             <div className="flex space-x-2">
                <button 
                    onClick={handleSelectAllFiltered}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white rounded border border-blue-200 hover:bg-blue-50"
                >
                    全选当前页
                </button>
                  <button 
                    onClick={handleClearSelection}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white rounded border border-gray-200 hover:bg-gray-50"
                >
                    清空已选
                </button>
            </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 border-b border-gray-200 w-16 text-center">选择</th>
                  {interviewType === 'assessment' ? (
                      <>
                        <th className="px-6 py-3 border-b border-gray-200">人员信息</th>
                        <th className="px-6 py-3 border-b border-gray-200">部门/职位</th>
                        <th className="px-6 py-3 border-b border-gray-200">考核周期</th>
                        <th className="px-6 py-3 border-b border-gray-200">考核任务</th>
                        <th className="px-6 py-3 border-b border-gray-200">绩效结果（得分/等级）</th>
                        <th className="px-6 py-3 border-b border-gray-200">在职状态</th>
                      </>
                  ) : (
                      <>
                        <th className="px-6 py-3 border-b border-gray-200">员工信息</th>
                        <th className="px-6 py-3 border-b border-gray-200">部门 / 职位</th>
                        <th className="px-6 py-3 border-b border-gray-200">入职时间 / 司龄</th>
                        <th className="px-6 py-3 border-b border-gray-200">员工状态</th>
                        <th className="px-6 py-3 border-b border-gray-200">最近一次面谈</th>
                        <th className="px-6 py-3 border-b border-gray-200">最近一次绩效结果（得分/等级）</th>
                      </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map(item => {
                  const isSelected = selectedIds.has(item.id);
                  const emp = item.employee!;
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/60' : ''}`}
                      onClick={() => toggleSelection(item.id)}
                    >
                      <td className="px-6 py-4 text-center">
                         <div className={`flex items-center justify-center text-blue-600`}>
                             {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300" />}
                         </div>
                      </td>
                      
                      {interviewType === 'assessment' ? (
                          <>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-gray-200 flex-shrink-0 mr-3 overflow-hidden border border-gray-100">
                                        <img src={emp.avatar} alt={emp.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">{emp.name}</div>
                                        <div className="text-xs text-gray-500">ID: {emp.id.padStart(4, '0')}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{emp.department}</div>
                                <div className="text-xs text-gray-500">{emp.role}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                    {(item as any).period}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-800 font-medium">{(item as any).taskName}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex flex-col items-center min-w-[40px]">
                                        <span className="text-sm font-bold text-gray-900">{(item as any).overallScore}</span>
                                        <span className="text-[10px] text-gray-400">分</span>
                                    </div>
                                    <div className="h-6 w-px bg-gray-200"></div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold w-8 text-center border ${
                                        ['S', 'A'].includes((item as any).grade) ? 'bg-green-50 text-green-700 border-green-200' :
                                        (item as any).grade === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                                    }`}>
                                        {(item as any).grade}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm text-green-600 font-medium">{emp.status || '在职'}</span>
                            </td>
                          </>
                      ) : (
                          <>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-gray-200 flex-shrink-0 mr-3 overflow-hidden border border-gray-100">
                                        <img src={emp.avatar} alt={emp.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">{emp.name}</div>
                                        <div className="text-xs text-gray-500">ID: {emp.id.padStart(4, '0')}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{emp.department}</div>
                                <div className="text-xs text-gray-500">{emp.role}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{emp.joinDate || '-'}</div>
                                <div className="text-xs text-gray-500">{emp.tenure || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm text-green-600 font-medium">{emp.status || '在职'}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{emp.lastInterviewDate || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-800">{emp.lastPerformance || '-'}</div>
                            </td>
                          </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="text-sm">未找到符合筛选条件的记录</p>
                </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
           <div className="text-sm text-gray-600 font-medium flex items-center">
             已选择 <span className="text-blue-600 font-bold text-lg mx-1">{selectedIds.size}</span> 个{interviewType === 'assessment' ? '考核任务' : '员工'}
           </div>
           <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              取消
            </button>
            <button 
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              确认选择
            </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelectorModal;
