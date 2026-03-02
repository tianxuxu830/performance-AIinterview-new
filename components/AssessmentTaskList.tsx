
import React, { useState } from 'react';
import { 
    Search, Plus, Filter, MoreHorizontal, 
    Calendar, Users, BarChart3, ChevronRight,
    FileText, CheckCircle2, Clock, AlertCircle, ArrowRight, LayoutList, Table as TableIcon
} from 'lucide-react';

interface AssessmentTaskListProps {
    onSelectTask: (taskName: string) => void;
}

const AssessmentTaskList: React.FC<AssessmentTaskListProps> = ({ onSelectTask }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock Data for Assessment Tasks
    const tasks = [
        { 
            id: 't1', 
            name: '业绩考核5月', 
            cycle: '2025-05-01 ~ 2025-05-31', 
            status: 'processing', 
            progress: 65, 
            participants: 359, 
            type: '月度考核',
            manager: '张伟'
        },
        { 
            id: 't2', 
            name: '2025 Q1 综合绩效考核', 
            cycle: '2025-01-01 ~ 2025-03-31', 
            status: 'completed', 
            progress: 100, 
            participants: 340, 
            type: '季度考核',
            manager: '张伟'
        },
        { 
            id: 't3', 
            name: '2025 产研中心晋升评估', 
            cycle: '2025-04-01 ~ 2025-04-20', 
            status: 'completed', 
            progress: 100, 
            participants: 45, 
            type: '专项评估',
            manager: '李总'
        },
        { 
            id: 't4', 
            name: '2025 试用期转正评估 (5月批次)', 
            cycle: '2025-05-01 ~ 2025-05-31', 
            status: 'processing', 
            progress: 30, 
            participants: 12, 
            type: '试用期',
            manager: 'Lisa'
        },
        { 
            id: 't5', 
            name: '2024 年度绩效终评', 
            cycle: '2024-01-01 ~ 2024-12-31', 
            status: 'archived', 
            progress: 100, 
            participants: 320, 
            type: '年度考核',
            manager: '张伟'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'processing':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">进行中</span>;
            case 'completed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">已完成</span>;
            case 'archived':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">已归档</span>;
            default:
                return null;
        }
    };

    const filteredTasks = tasks.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'all' || t.status === statusFilter)
    );

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">考核任务管理</h1>
                    <p className="text-sm text-gray-500 mt-1">创建并管理全公司的绩效考核活动</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm flex items-center transition-colors">
                    <Plus size={16} className="mr-1.5" /> 新建考核
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="px-8 py-4 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="搜索考核名称..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                    
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>

                    <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                        <button 
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            全部
                        </button>
                        <button 
                            onClick={() => setStatusFilter('processing')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === 'processing' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            进行中
                        </button>
                        <button 
                            onClick={() => setStatusFilter('completed')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === 'completed' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            已完成
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                    <Filter size={14} className="mr-1" />
                    <span>排序: 最近创建</span>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar bg-gray-50/50">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-600">考核任务名称</th>
                                <th className="px-6 py-3 font-medium text-gray-600">考核周期</th>
                                <th className="px-6 py-3 font-medium text-gray-600">类型</th>
                                <th className="px-6 py-3 font-medium text-gray-600">参与人数</th>
                                <th className="px-6 py-3 font-medium text-gray-600 w-64">执行进度</th>
                                <th className="px-6 py-3 font-medium text-gray-600">状态</th>
                                <th className="px-6 py-3 font-medium text-gray-600 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredTasks.map(task => (
                                <tr 
                                    key={task.id} 
                                    onClick={() => onSelectTask(task.name)} 
                                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-lg mr-3 shrink-0 ${task.status === 'processing' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{task.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">负责人: {task.manager}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-gray-600 font-mono text-xs">
                                            <Calendar size={12} className="mr-1.5 text-gray-400" />
                                            {task.cycle}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">
                                            {task.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">
                                        <div className="flex items-center">
                                            <Users size={14} className="mr-1.5 text-gray-400" />
                                            {task.participants} <span className="text-gray-400 text-xs ml-1">人</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center w-full">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mr-3">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${task.status === 'completed' ? 'bg-green-500' : 'bg-blue-600'}`}
                                                    style={{ width: `${task.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-700 w-8 text-right">{task.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(task.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end ml-auto group-hover:translate-x-1 transition-transform">
                                            进入管理 <ChevronRight size={14} className="ml-0.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTasks.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        暂无符合条件的考核任务
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Simplified) */}
                <div className="flex items-center justify-end mt-4 space-x-2 text-xs text-gray-500">
                    <span className="mr-2">共 {filteredTasks.length} 条</span>
                    <button className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50" disabled>&lt;</button>
                    <button className="px-2 py-1 border rounded bg-white text-blue-600 border-blue-200 font-medium">1</button>
                    <button className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50" disabled>&gt;</button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentTaskList;
