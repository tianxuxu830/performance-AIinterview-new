
import React, { useState } from 'react';
import { 
    X, User, Building2, Briefcase, Award, Calendar, 
    FileText, MessageSquare, CheckCircle2, Clock, 
    ChevronRight, AlertCircle, TrendingUp, Target
} from 'lucide-react';

interface EmployeeArchiveDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any; // Using loose type for flexibility with mock data
}

const EmployeeArchiveDrawer: React.FC<EmployeeArchiveDrawerProps> = ({ isOpen, onClose, employee }) => {
    const [activeTab, setActiveTab] = useState<'performance' | 'interviews' | 'improvements'>('performance');

    if (!isOpen || !employee) return null;

    // --- Mock Data for Tabs ---
    const performanceRecords = [
        { id: 'p1', cycle: '2025 Q2', type: 'KPI + OKR', score: '92.5', grade: 'A', archivedAt: '2025-07-15' },
        { id: 'p2', cycle: '2025 Q1', type: 'KPI', score: '88.0', grade: 'B+', archivedAt: '2025-04-10' },
        { id: 'p3', cycle: '2024 Q4', type: 'KPI + OKR', score: '95.0', grade: 'S', archivedAt: '2025-01-12' },
        { id: 'p4', cycle: '2024 Q3', type: 'KPI', score: '85.5', grade: 'B+', archivedAt: '2024-10-15' },
    ];

    const interviewRecords = [
        { id: 'i1', topic: '2025 Q2 绩效面谈', source: '考核', linkedPerf: '2025 Q2', interviewer: '张伟', date: '2025-07-16', status: 'completed' },
        { id: 'i2', topic: '2025 Q1 绩效面谈', source: '考核', linkedPerf: '2025 Q1', interviewer: '张伟', date: '2025-04-12', status: 'completed' },
        { id: 'i3', topic: '月度辅导 (3月)', source: '独立', linkedPerf: '-', interviewer: 'Lisa', date: '2025-03-05', status: 'completed' },
        { id: 'i4', topic: '2024 年度面谈', source: '考核', linkedPerf: '2024 年度', interviewer: '王总', date: '2025-01-20', status: 'completed' },
    ];

    const improvementRecords = [
        { id: 'imp1', source: '面谈 (2025 Q2)', action: '提升跨部门协作响应速度，建立对接SOP', owner: '员工', due: '2025-09-30', status: 'in_progress' },
        { id: 'imp2', source: 'PIP (2024 Q4)', action: '完成 Python 数据分析进阶课程', owner: '员工', due: '2025-03-31', status: 'completed' },
        { id: 'imp3', source: '面谈 (2025 Q1)', action: '每周输出一份竞品分析报告', owner: '员工', due: '2025-06-30', status: 'completed' },
    ];

    // --- Helper Renders ---
    const renderGradeTag = (grade: string) => {
        let style = "bg-gray-100 text-gray-600 border-gray-200";
        if (['S', 'A', 'A+'].includes(grade)) style = "bg-green-50 text-green-700 border-green-200";
        if (['B+', 'B'].includes(grade)) style = "bg-blue-50 text-blue-700 border-blue-200";
        return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${style}`}>{grade}</span>;
    };

    const renderStatusBadge = (status: string) => {
        if (status === 'completed') return <span className="inline-flex items-center text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded"><CheckCircle2 size={10} className="mr-1"/> 已完成</span>;
        if (status === 'in_progress') return <span className="inline-flex items-center text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded"><Clock size={10} className="mr-1"/> 跟进中</span>;
        return <span className="text-gray-400 text-xs">未知</span>;
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
            <div className="w-[850px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* 1. Header: Employee Info */}
                <div className="px-8 py-6 border-b border-gray-200 bg-gray-50/50 shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                            <div className="relative">
                                <img src={employee.avatar || 'https://picsum.photos/id/64/100/100'} alt="" className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                                    <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                                </div>
                            </div>
                            <div className="ml-4">
                                <div className="flex items-center space-x-3 mb-1">
                                    <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
                                    <span className="text-sm text-gray-500 font-mono bg-gray-200 px-2 py-0.5 rounded">{employee.empId}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center"><Building2 size={14} className="mr-1.5 text-gray-400"/> {employee.dept}</span>
                                    <span className="flex items-center"><Briefcase size={14} className="mr-1.5 text-gray-400"/> {employee.position}</span>
                                    <span className="flex items-center"><Award size={14} className="mr-1.5 text-gray-400"/> {employee.level}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 bg-white border border-gray-200 rounded-lg p-3 shadow-sm inline-flex">
                        <span className="font-medium text-gray-700 mr-2">当前直属上级:</span>
                        <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold mr-1.5">张</div>
                            <span>张伟 (技术总监)</span>
                        </div>
                    </div>
                </div>

                {/* 2. Tabs Navigation */}
                <div className="px-8 border-b border-gray-200 flex space-x-8 shrink-0">
                    <button 
                        onClick={() => setActiveTab('performance')}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'performance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <TrendingUp size={16} className="mr-2" /> 绩效记录
                    </button>
                    <button 
                        onClick={() => setActiveTab('interviews')}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'interviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <MessageSquare size={16} className="mr-2" /> 绩效面谈记录
                    </button>
                    <button 
                        onClick={() => setActiveTab('improvements')}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'improvements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <Target size={16} className="mr-2" /> 改进与跟进
                    </button>
                </div>

                {/* 3. Tab Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gray-50">
                    
                    {/* Tab 1: Performance Records */}
                    {activeTab === 'performance' && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">绩效周期</th>
                                        <th className="px-6 py-3">考核类型</th>
                                        <th className="px-6 py-3">最终得分</th>
                                        <th className="px-6 py-3">最终等级</th>
                                        <th className="px-6 py-3">归档时间</th>
                                        <th className="px-6 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {performanceRecords.map(record => (
                                        <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{record.cycle}</td>
                                            <td className="px-6 py-4 text-gray-600">{record.type}</td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{record.score}</td>
                                            <td className="px-6 py-4">{renderGradeTag(record.grade)}</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs font-mono">{record.archivedAt}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 hover:underline text-xs">查看</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 2: Interview Records */}
                    {activeTab === 'interviews' && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">面谈主题</th>
                                        <th className="px-6 py-3">面谈来源</th>
                                        <th className="px-6 py-3">关联绩效</th>
                                        <th className="px-6 py-3">面谈官</th>
                                        <th className="px-6 py-3">面谈时间</th>
                                        <th className="px-6 py-3">状态</th>
                                        <th className="px-6 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {interviewRecords.map(record => (
                                        <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{record.topic}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs ${record.source === '考核' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {record.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-xs">{record.linkedPerf}</td>
                                            <td className="px-6 py-4 text-gray-800">{record.interviewer}</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs font-mono">{record.date}</td>
                                            <td className="px-6 py-4">{renderStatusBadge(record.status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 hover:underline text-xs">查看纪要</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 3: Improvements */}
                    {activeTab === 'improvements' && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 w-1/3">改进行动</th>
                                        <th className="px-6 py-3">来源</th>
                                        <th className="px-6 py-3">负责人</th>
                                        <th className="px-6 py-3">计划完成时间</th>
                                        <th className="px-6 py-3">当前状态</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {improvementRecords.map(record => (
                                        <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-800 leading-relaxed">{record.action}</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">{record.source}</td>
                                            <td className="px-6 py-4 text-gray-700">{record.owner}</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs font-mono">{record.due}</td>
                                            <td className="px-6 py-4">{renderStatusBadge(record.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default EmployeeArchiveDrawer;
