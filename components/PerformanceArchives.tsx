
import React, { useState, useRef } from 'react';
import { 
    Search, Filter, ChevronRight, Download, Eye, 
    User, Settings, ChevronDown, MoreHorizontal,
    Maximize2, SlidersHorizontal, ChevronLeft, AlertCircle,
    CheckCircle2, Clock, FileText, Building2,
    TrendingUp, TrendingDown, Minus, BarChart2, Layers,
    X, ArrowLeft
} from 'lucide-react';
import { MOCK_EMPLOYEES, MOCK_ASSESSMENT_DETAILS } from '../constants';
import EmployeeArchiveDrawer from './EmployeeArchiveDrawer';
import AssessmentDetailTable from './AssessmentDetailTable';

const PerformanceArchives: React.FC = () => {
    // New State for Assessment Type (Level 1)
    const [assessmentType, setAssessmentType] = useState<'employee' | 'organization'>('employee');
    // View Type (Tasks vs Objects) (Level 2)
    const [viewType, setViewType] = useState<'tasks' | 'objects'>('tasks');
    
    // Drill-down State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState<string>('default');
    
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // State for Archive Drawer (Global Employee History)
    const [isArchiveDrawerOpen, setIsArchiveDrawerOpen] = useState(false);
    const [selectedEmployeeForArchive, setSelectedEmployeeForArchive] = useState<any>(null);

    // State for Floating Trend Tooltip
    const [trendTooltip, setTrendTooltip] = useState<{ item: any; rect: DOMRect } | null>(null);
    const trendTimeoutRef = useRef<number | null>(null);

    // State for Abnormal Details Drawer
    const [abnormalDrawerTask, setAbnormalDrawerTask] = useState<any>(null);

    // --- Mock Data ---

    // Mock Data for "By Assessment Object" (Employee)
    const objectData = [
        { 
            id: 'e1', 
            name: '李莎', 
            empId: 'GH00027', 
            avatar: 'https://picsum.photos/id/64/100/100',
            dept: '产研中心/产品部', 
            position: '高级产品经理', 
            level: 'P7',
            cycleCount: 8, 
            latestCycle: '2025 Q2 绩效考核', 
            latestScore: '92.5', 
            latestGrade: 'A',
            trend: 'up',
            interviewCount: 8,
            trendHistory: [
                { period: '24Q4', score: 88 },
                { period: '25Q1', score: 90 },
                { period: '25Q2', score: 92.5 }
            ]
        },
        { 
            id: 'e2', 
            name: '王森', 
            empId: 'GH00035', 
            avatar: 'https://picsum.photos/id/91/100/100',
            dept: '营销中心/销售部', 
            position: '销售总监', 
            level: 'M2',
            cycleCount: 12, 
            latestCycle: '2025 Q2 绩效考核', 
            latestScore: '98.0', 
            latestGrade: 'S',
            trend: 'stable',
            interviewCount: 12,
            trendHistory: [
                { period: '24Q4', score: 98 },
                { period: '25Q1', score: 97.5 },
                { period: '25Q2', score: 98 }
            ]
        },
        { 
            id: 'e3', 
            name: '张妮', 
            empId: 'GH00102', 
            avatar: 'https://picsum.photos/id/177/100/100',
            dept: '职能中心/人力资源部', 
            position: 'HRBP', 
            level: 'P6',
            cycleCount: 5, 
            latestCycle: '2025 Q2 绩效考核', 
            latestScore: '85.0', 
            latestGrade: 'B+',
            trend: 'down',
            interviewCount: 5,
            trendHistory: [
                { period: '24Q4', score: 88 },
                { period: '25Q1', score: 86 },
                { period: '25Q2', score: 85 }
            ]
        },
        { 
            id: 'e4', 
            name: '陈飞', 
            empId: 'GH00338', 
            avatar: 'https://picsum.photos/id/338/100/100',
            dept: '产研中心/云演示组', 
            position: '工程师', 
            level: 'P5',
            cycleCount: 3, 
            latestCycle: '2025 Q2 绩效考核', 
            latestScore: '72.0', 
            latestGrade: 'C',
            trend: 'stable',
            interviewCount: 3,
            trendHistory: [
                { period: '24Q4', score: 72 },
                { period: '25Q1', score: 71.5 },
                { period: '25Q2', score: 72 }
            ]
        },
        { 
            id: 'e5', 
            name: '刘强', 
            empId: 'GH00156', 
            avatar: 'https://picsum.photos/id/55/100/100',
            dept: '营销中心/市场部', 
            position: '市场经理', 
            level: 'M1',
            cycleCount: 6, 
            latestCycle: '2025 Q2 绩效考核', 
            latestScore: '60.0', 
            latestGrade: 'D',
            trend: 'down',
            interviewCount: 4,
            trendHistory: [
                { period: '24Q4', score: 75 },
                { period: '25Q1', score: 68 },
                { period: '25Q2', score: 60 }
            ]
        },
        { 
            id: 'e6', 
            name: '赵小云', 
            empId: 'GH00451', 
            avatar: 'https://picsum.photos/id/12/100/100',
            dept: '产研中心/设计部', 
            position: 'UI设计师', 
            level: 'P4',
            cycleCount: 2, 
            latestCycle: '2025 试用期转正评估', 
            latestScore: '90.5', 
            latestGrade: 'A',
            trend: 'up',
            interviewCount: 2,
            trendHistory: [
                { period: '入职', score: 80 },
                { period: '转正', score: 85 },
                { period: '25Q2', score: 90.5 }
            ]
        },
        { 
            id: 'e7', 
            name: '孙敏', 
            empId: 'GH00222', 
            avatar: 'https://picsum.photos/id/32/100/100',
            dept: '职能中心/财务部', 
            position: '会计', 
            level: 'P5',
            cycleCount: 10, 
            latestCycle: '2025 Q2 绩效考核', 
            latestScore: '88.0', 
            latestGrade: 'B+',
            trend: 'stable',
            interviewCount: 9,
            trendHistory: [
                { period: '24Q4', score: 88 },
                { period: '25Q1', score: 87.5 },
                { period: '25Q2', score: 88 }
            ]
        },
    ];

    // Mock Data for "By Assessment Object" (Organization)
    const orgObjectData = [
        { 
            id: 'd1', 
            name: '产研中心/产品部', 
            code: 'DEP_001',
            manager: '李总',
            cycleCount: 4, 
            latestCycle: '2025 Q2 组织绩效', 
            latestScore: '94.0', 
            latestGrade: 'A',
            trend: 'up',
            trendHistory: [{period:'24Q4', score:90}, {period:'25Q1', score:92}, {period:'25Q2', score:94}]
        },
        { 
            id: 'd2', 
            name: '营销中心/销售部', 
            code: 'DEP_002',
            manager: '王总',
            cycleCount: 4, 
            latestCycle: '2025 Q2 组织绩效', 
            latestScore: '98.5', 
            latestGrade: 'S',
            trend: 'stable',
            trendHistory: [{period:'24Q4', score:98}, {period:'25Q1', score:99}, {period:'25Q2', score:98.5}]
        },
        { 
            id: 'd3', 
            name: '职能中心/人力资源部', 
            code: 'DEP_003',
            manager: '张总',
            cycleCount: 4, 
            latestCycle: '2025 Q2 组织绩效', 
            latestScore: '89.0', 
            latestGrade: 'B+',
            trend: 'down',
            trendHistory: [{period:'24Q4', score:92}, {period:'25Q1', score:90}, {period:'25Q2', score:89}]
        }
    ];

    // Mock Data for "By Task" (Task View Aggregated)
    const taskData = [
        { 
            id: 't1', 
            taskName: '2025 Q4 绩效考核', 
            cycle: '2025-10-01 ~ 2025-12-31', 
            coveredCount: 359, 
            ratedCount: 350, 
            requiredInterviewCount: 359, 
            completedInterviewCount: 45, 
            abnormalCount: 2, 
            abnormalDetails: ['张三 - 离职', '李四 - 终止考核'],
            status: '执行中' 
        },
        { 
            id: 't2', 
            taskName: '2025 Q3 绩效考核', 
            cycle: '2025-07-01 ~ 2025-09-30', 
            coveredCount: 340, 
            ratedCount: 340, 
            requiredInterviewCount: 300, 
            completedInterviewCount: 300, 
            abnormalCount: 0, 
            abnormalDetails: [],
            status: '已归档' 
        },
        { 
            id: 't3', 
            taskName: '销售部专项激励考核 (8月)', 
            cycle: '2025-08', 
            coveredCount: 120, 
            ratedCount: 118, 
            requiredInterviewCount: 120, 
            completedInterviewCount: 110, 
            abnormalCount: 5, 
            abnormalDetails: ['王五 - 长期请假', '赵六 - 拒绝签字', '孙七 - 离职', '周八 - 转岗', '吴九 - 终止'],
            status: '执行中' 
        },
        { 
            id: 't4', 
            taskName: '2025 试用期转正评估', 
            cycle: '2025 年度', 
            coveredCount: 45, 
            ratedCount: 40, 
            requiredInterviewCount: 45, 
            completedInterviewCount: 38, 
            abnormalCount: 1, 
            abnormalDetails: ['郑十 - 延长试用期'],
            status: '执行中' 
        },
        { 
            id: 't5', 
            taskName: '研发中心 Q2 项目考核', 
            cycle: '2025 Q2', 
            coveredCount: 80, 
            ratedCount: 80, 
            requiredInterviewCount: 80, 
            completedInterviewCount: 80, 
            abnormalCount: 0, 
            abnormalDetails: [],
            status: '已归档' 
        },
        { 
            id: 't6', 
            taskName: '2024 年度综合绩效', 
            cycle: '2024-01-01 ~ 2024-12-31', 
            coveredCount: 320, 
            ratedCount: 320, 
            requiredInterviewCount: 320, 
            completedInterviewCount: 315, 
            abnormalCount: 0, 
            abnormalDetails: [],
            status: '已归档' 
        }
    ];

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            let allIds: string[] = [];
            if (selectedTask) {
                allIds = objectData.map(o => o.id); // In task detail view
            } else if (viewType === 'tasks') {
                allIds = taskData.map(t => t.id);
            } else {
                allIds = assessmentType === 'employee' ? objectData.map(o => o.id) : orgObjectData.map(o => o.id);
            }
            setSelectedIds(new Set(allIds));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleCheckboxChange = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const handleViewArchive = (e: React.MouseEvent, employee: any) => {
        e.stopPropagation();
        setSelectedEmployeeForArchive(employee);
        setIsArchiveDrawerOpen(true);
        setTrendTooltip(null); // Close tooltip if open
    };

    // --- Drill Down Handlers ---
    const handleTaskClick = (e: React.MouseEvent, task: any) => {
        e.stopPropagation();
        setSelectedTask(task);
        setSelectedIds(new Set()); // Reset selection
    };

    const handleBackToTasks = () => {
        setSelectedTask(null);
        setSelectedIds(new Set());
    };

    const handleOpenDetail = (e: React.MouseEvent, employee: any) => {
        e.stopPropagation();
        const detailId = employee.id === 'e1' ? '1' : 'default'; // Mock mapping
        setSelectedDetailId(detailId);
        setIsDetailDrawerOpen(true);
    };

    // --- Trend Tooltip Handlers ---
    const handleTrendMouseEnter = (e: React.MouseEvent, item: any) => {
        if (trendTimeoutRef.current) {
            clearTimeout(trendTimeoutRef.current);
            trendTimeoutRef.current = null;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setTrendTooltip({ item, rect });
    };

    const handleTrendMouseLeave = () => {
        trendTimeoutRef.current = window.setTimeout(() => {
            setTrendTooltip(null);
        }, 300); // Small delay to allow moving mouse into the tooltip
    };

    const handleTooltipMouseEnter = () => {
        if (trendTimeoutRef.current) {
            clearTimeout(trendTimeoutRef.current);
            trendTimeoutRef.current = null;
        }
    };

    const handleTooltipMouseLeave = () => {
        trendTimeoutRef.current = window.setTimeout(() => {
            setTrendTooltip(null);
        }, 300);
    };

    // Abnormal Drawer Handler
    const handleAbnormalClick = (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        setAbnormalDrawerTask(item);
    };

    // Helper: Render Grade Tag
    const renderGradeTag = (grade: string) => {
        let style = "bg-gray-100 text-gray-600 border-gray-200";
        if (['S', 'A', 'A+'].includes(grade)) style = "bg-green-50 text-green-700 border-green-200";
        if (['B+', 'B'].includes(grade)) style = "bg-blue-50 text-blue-700 border-blue-200";
        if (['C', 'D'].includes(grade)) style = "bg-orange-50 text-orange-700 border-orange-200";
        
        return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${style}`}>{grade}</span>;
    };

    // Helper: Render Trend Icon Only (No Logic inside)
    const renderTrendIcon = (trend: string) => {
        if (trend === 'up') return <TrendingUp size={16} className="text-green-500" />;
        if (trend === 'down') return <TrendingDown size={16} className="text-orange-500" />;
        return <Minus size={16} className="text-gray-400" />;
    };

    // Helper: Render Tooltip Content (The Chart)
    const renderTooltipContent = () => {
        if (!trendTooltip) return null;
        
        const { item } = trendTooltip;
        const history = item.trendHistory || [];
        const width = 120;
        const height = 40;
        const padding = 5;
        
        const scores = history.map((h: any) => h.score);
        const minScore = Math.min(...scores, 0); 
        const maxScore = Math.max(...scores, 100);
        
        const points = history.map((h: any, i: number) => {
            const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((h.score - minScore) / (maxScore - minScore || 1)) * (height - 2 * padding);
            return `${x},${y}`;
        }).join(' ');

        return (
            <div 
                className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 p-4 animate-in fade-in zoom-in-95 duration-200 w-52"
                style={{
                    top: `${trendTooltip.rect.top - 8}px`,
                    left: `${trendTooltip.rect.left + trendTooltip.rect.width / 2}px`,
                    transform: 'translate(-50%, -100%)'
                }}
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}
            >
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-800">最近3次考核趋势</span>
                    <BarChart2 size={12} className="text-gray-400"/>
                </div>
                
                {/* SVG Chart */}
                <div className="mb-3 border-b border-gray-100 pb-3">
                    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                        <polyline points={points} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        {history.map((h: any, i: number) => {
                            const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
                            const y = height - padding - ((h.score - minScore) / (maxScore - minScore || 1)) * (height - 2 * padding);
                            return (
                                <g key={i}>
                                    <circle cx={x} cy={y} r="3" fill="white" stroke="#3B82F6" strokeWidth="2" />
                                    <text x={x} y={y - 6} textAnchor="middle" fontSize="8" fill="#374151" fontWeight="bold">{h.score}</text>
                                    <text x={x} y={height + 10} textAnchor="middle" fontSize="8" fill="#9CA3AF">{h.period}</text>
                                </g>
                            );
                        })}
                    </svg>
                    <div className="h-4"></div>
                </div>

                <button 
                    onClick={(e) => handleViewArchive(e, item)}
                    className="w-full text-center text-xs text-blue-600 hover:bg-blue-50 py-1.5 rounded transition-colors font-medium flex items-center justify-center group/btn"
                >
                    点击查看更多 <ChevronRight size={10} className="ml-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
                
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45 shadow-sm"></div>
            </div>
        );
    };

    // Helper: Render Abnormal Drawer
    const renderAbnormalDrawer = () => {
        if (!abnormalDrawerTask) return null;

        const details = abnormalDrawerTask.abnormalDetails.map((str: string) => {
            const [name, reason] = str.split(' - ');
            return { name, reason };
        });

        return (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
                <div className="w-[500px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">异常明细</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{abnormalDrawerTask.taskName}</p>
                        </div>
                        <button onClick={() => setAbnormalDrawerTask(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-white">
                        <table className="w-full text-left border-collapse text-sm border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="p-3 border-b border-gray-200">异常对象</th>
                                    <th className="p-3 border-b border-gray-200">异常原因</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {details.map((detail: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-3 text-gray-900 font-medium">{detail.name}</td>
                                        <td className="p-3 text-red-600 bg-red-50/50">{detail.reason}</td>
                                    </tr>
                                ))}
                                {details.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="p-6 text-center text-gray-400">无异常记录</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // Helper: Render Task Detail View (Drill Down)
    const renderTaskDetailView = () => {
        return (
            <div className="flex flex-col h-full bg-white">
                {/* Header with Back Button */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center">
                        <button onClick={handleBackToTasks} className="mr-3 p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="text-lg font-bold text-gray-900">{selectedTask.taskName}</h2>
                                <span className={`text-xs px-2 py-0.5 rounded border ${selectedTask.status === '执行中' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {selectedTask.status}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center space-x-3">
                                <span>周期: {selectedTask.cycle}</span>
                                <span>•</span>
                                <span>参与人数: {selectedTask.coveredCount}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="搜索姓名/工号..." 
                                className="pl-8 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary w-48 bg-white"
                            />
                            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                        </div>
                        <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50 flex items-center">
                            <Download size={14} className="mr-1.5" /> 导出结果
                        </button>
                    </div>
                </div>

                {/* Employee List Table for this Task */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="p-3 w-12 text-center">
                                    <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" onChange={handleSelectAll} />
                                </th>
                                <th className="p-3 font-medium">员工信息</th>
                                <th className="p-3 font-medium">部门 / 职位</th>
                                <th className="p-3 font-medium text-center">当前状态</th>
                                <th className="p-3 font-medium">考核结果</th>
                                <th className="p-3 font-medium text-center">绩效面谈</th>
                                <th className="p-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {objectData.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={(e) => handleOpenDetail(e, item)}>
                                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => handleCheckboxChange(item.id)} />
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <img src={item.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-100 mr-3" />
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-medium">{item.name}</span>
                                                <span className="text-[10px] text-gray-400 font-mono">{item.empId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="text-gray-900 text-xs">{item.dept}</div>
                                        <div className="text-gray-500 text-[10px]">{item.position}</div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            已完成
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-gray-800">{item.latestScore}</span>
                                            {renderGradeTag(item.latestGrade)}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="text-xs text-gray-500">{item.interviewCount > 0 ? '已完成' : '未开始'}</span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button 
                                            onClick={(e) => handleOpenDetail(e, item)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                                        >
                                            查看详情
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Render Table Content
    const renderTable = () => {
        if (selectedTask) {
            return renderTaskDetailView();
        }

        if (viewType === 'objects') {
            if (assessmentType === 'organization') {
                return (
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-3 w-12 text-center">
                                    <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" onChange={handleSelectAll} />
                                </th>
                                <th className="p-3 font-medium">部门名称</th>
                                <th className="p-3 font-medium">部门编码</th>
                                <th className="p-3 font-medium">负责人</th>
                                <th className="p-3 font-medium text-center">考核周期数</th>
                                <th className="p-3 font-medium">最近考核周期</th>
                                <th className="p-3 font-medium">最近考核结果</th>
                                <th className="p-3 font-medium text-center">绩效趋势</th>
                                <th className="p-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {orgObjectData.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={(e) => handleViewArchive(e, item)}>
                                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => handleCheckboxChange(item.id)} />
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center mr-3 text-blue-600 font-bold border border-blue-100">
                                                <Building2 size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-medium">{item.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-600 font-mono text-xs">{item.code}</td>
                                    <td className="p-3 text-gray-700">{item.manager}</td>
                                    <td className="p-3 text-gray-700 text-center font-mono">{item.cycleCount}</td>
                                    <td className="p-3">
                                        <span className="text-blue-600 hover:underline cursor-pointer text-xs">{item.latestCycle}</span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-gray-800">{item.latestScore}</span>
                                            {renderGradeTag(item.latestGrade)}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div 
                                            className="flex justify-center p-1 cursor-pointer w-full h-full"
                                            onMouseEnter={(e) => handleTrendMouseEnter(e, item)}
                                            onMouseLeave={handleTrendMouseLeave}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {renderTrendIcon(item.trend)}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button 
                                            onClick={(e) => handleViewArchive(e, item)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                                        >
                                            查看档案
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            }

            // Employee Object Table
            return (
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                        <tr>
                            <th className="p-3 w-12 text-center">
                                <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" onChange={handleSelectAll} />
                            </th>
                            <th className="p-3 font-medium">员工姓名</th>
                            <th className="p-3 font-medium">部门</th>
                            <th className="p-3 font-medium">职位</th>
                            <th className="p-3 font-medium">职级</th>
                            <th className="p-3 font-medium text-center">绩效周期数</th>
                            <th className="p-3 font-medium">最近绩效周期</th>
                            <th className="p-3 font-medium">最近绩效结果</th>
                            <th className="p-3 font-medium text-center">绩效趋势</th>
                            <th className="p-3 font-medium text-center">绩效面谈次数</th>
                            <th className="p-3 font-medium text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {objectData.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={(e) => handleViewArchive(e, item)}>
                                <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                                    <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => handleCheckboxChange(item.id)} />
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center">
                                        <img src={item.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-100 mr-3" />
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium">{item.name}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">{item.empId}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="text-gray-600 truncate max-w-[150px]" title={item.dept}>{item.dept}</div>
                                </td>
                                <td className="p-3 text-gray-700">{item.position}</td>
                                <td className="p-3 text-gray-700">{item.level}</td>
                                <td className="p-3 text-gray-700 text-center font-mono">{item.cycleCount}</td>
                                <td className="p-3">
                                    <span className="text-blue-600 hover:underline cursor-pointer text-xs">{item.latestCycle}</span>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-gray-800">{item.latestScore}</span>
                                        {renderGradeTag(item.latestGrade)}
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <div 
                                        className="flex justify-center p-1 cursor-pointer w-full h-full"
                                        onMouseEnter={(e) => handleTrendMouseEnter(e, item)}
                                        onMouseLeave={handleTrendMouseLeave}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {renderTrendIcon(item.trend)}
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <span className="text-gray-700 font-mono">{item.interviewCount}</span>
                                </td>
                                <td className="p-3 text-right">
                                    <button 
                                        onClick={(e) => handleViewArchive(e, item)}
                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                                    >
                                        查看档案
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        // Tasks Table (Aggregated View)
        return (
            <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                    <tr>
                        <th className="p-3 w-12 text-center">
                            <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" onChange={handleSelectAll} />
                        </th>
                        <th className="p-3 font-medium">考核任务名称</th>
                        <th className="p-3 font-medium">考核周期</th>
                        <th className="p-3 font-medium">参与考核数</th>
                        <th className="p-3 font-medium font-bold text-gray-900 w-64">绩效面谈情况 (完成/应谈)</th>
                        <th className="p-3 font-medium">异常数</th>
                        <th className="p-3 font-medium text-right">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {taskData.map((item) => {
                        const completionRate = Math.round((item.completedInterviewCount / (item.requiredInterviewCount || 1)) * 100);
                        return (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="p-3 text-center">
                                    <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => handleCheckboxChange(item.id)} />
                                </td>
                                <td className="p-3">
                                    <span 
                                        onClick={(e) => handleTaskClick(e, item)}
                                        className="text-blue-600 font-medium hover:underline cursor-pointer"
                                    >
                                        {item.taskName}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-600 text-xs">{item.cycle}</td>
                                <td className="p-3 text-gray-700 font-mono pl-6">{item.coveredCount}</td>
                                <td className="p-3">
                                    <span className="text-gray-900 font-bold text-sm">
                                        {item.completedInterviewCount} / {item.requiredInterviewCount}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {item.abnormalCount > 0 ? (
                                        <span 
                                            onClick={(e) => handleAbnormalClick(e, item)}
                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 border border-red-200 cursor-pointer hover:bg-red-200 transition-colors"
                                        >
                                            <AlertCircle size={10} className="mr-1" />
                                            {item.abnormalCount} 异常
                                        </span>
                                    ) : (
                                        <span className="text-gray-300 text-xs pl-2">-</span>
                                    )}
                                </td>
                                <td className="p-3 text-right">
                                    <button 
                                        onClick={(e) => handleTaskClick(e, item)}
                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                                    >
                                        进入
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            
            {/* Level 1: Assessment Type Tabs (Employee vs Org) - Hide when in Drill Down */}
            {!selectedTask && (
                <div className="px-6 pt-4 border-b border-gray-200 bg-white sticky top-0 z-20">
                    <div className="flex space-x-8">
                        <button 
                            onClick={() => setAssessmentType('employee')}
                            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
                                assessmentType === 'employee' 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            员工考核
                        </button>
                        <button 
                            onClick={() => setAssessmentType('organization')}
                            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
                                assessmentType === 'organization' 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            组织考核
                        </button>
                    </div>
                </div>
            )}

            {/* Level 2: Toolbar (View Type & Actions) - Hide when in Drill Down */}
            {!selectedTask && (
                <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
                    
                    {/* View Switcher (Tasks vs Objects) */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewType('tasks')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewType === 'tasks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            按考核任务
                        </button>
                        <button 
                            onClick={() => setViewType('objects')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewType === 'objects' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            按考核对象
                        </button>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-3">
                        <button className="px-3 py-1.5 bg-white border border-green-200 text-green-600 text-sm rounded hover:bg-green-50 transition-colors shadow-sm flex items-center">
                            <Download size={14} className="mr-1.5" /> 导出
                        </button>
                        <button className="p-1.5 bg-white border border-gray-300 text-gray-500 rounded hover:bg-gray-50 transition-colors shadow-sm">
                            <Filter size={16} />
                        </button>
                        <button className="p-1.5 bg-white border border-gray-300 text-gray-500 rounded hover:bg-gray-50 transition-colors shadow-sm">
                            <Settings size={16} />
                        </button>
                        <button className="p-1.5 bg-white border border-gray-300 text-gray-500 rounded hover:bg-gray-50 transition-colors shadow-sm">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Table Content */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                {renderTable()}
            </div>

            {/* Pagination Footer - Hide in Drill Down for cleaner look or keep if paginated */}
            {!selectedTask && (
                <div className="px-4 py-3 border-t border-gray-200 flex justify-end items-center space-x-2 bg-white text-xs text-gray-600">
                    <button className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">
                        <ChevronLeft size={14} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center border border-primary text-primary bg-primary-50 rounded">1</button>
                    <button className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">2</button>
                    <button className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">
                        <ChevronRight size={14} />
                    </button>
                    <select className="border border-gray-300 rounded py-1 px-2 focus:outline-none">
                        <option>100 条/页</option>
                        <option>50 条/页</option>
                        <option>20 条/页</option>
                    </select>
                    <span>跳至</span>
                    <input type="text" className="w-10 border border-gray-300 rounded py-1 px-1 text-center" />
                    <span>页</span>
                </div>
            )}

            {/* Archive Drawer (Global) */}
            <EmployeeArchiveDrawer 
                isOpen={isArchiveDrawerOpen}
                onClose={() => setIsArchiveDrawerOpen(false)}
                employee={selectedEmployeeForArchive}
            />

            {/* Assessment Detail Drawer (Drill Down) */}
            {isDetailDrawerOpen && (
                <div className="absolute inset-0 z-30 flex justify-end bg-black/20 backdrop-blur-[1px] transition-all">
                    <div className="w-[800px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center">
                                <FileText size={18} className="mr-2 text-blue-600" />
                                绩效考核表详情
                            </h3>
                            <button onClick={() => setIsDetailDrawerOpen(false)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden p-0">
                            <AssessmentDetailTable 
                                detail={MOCK_ASSESSMENT_DETAILS[selectedDetailId] || MOCK_ASSESSMENT_DETAILS['default']} 
                                period={selectedTask?.taskName || '考核周期'} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Trend Tooltip (Fixed Overlay) */}
            {renderTooltipContent()}
            
            {/* Abnormal Details Drawer */}
            {renderAbnormalDrawer()}
        </div>
    );
};

export default PerformanceArchives;
