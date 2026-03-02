
import React, { useState, useEffect } from 'react';
import { Filter, Search, ChevronRight, Video, Edit3, Clock, CheckCircle, Bell, Calendar } from 'lucide-react';
import { InterviewSession, Status } from '../types';

interface EmployeeTaskTableProps {
    type: 'plans' | 'reviews' | 'interviews';
    onAction: (task: any, actionType?: 'schedule' | 'feedback') => void;
    sessions?: InterviewSession[];
}

const EmployeeTaskTable: React.FC<EmployeeTaskTableProps> = ({ type, onAction, sessions }) => {
    const [openActionId, setOpenActionId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>(type === 'interviews' ? 'schedule' : 'todo');

    useEffect(() => {
        const handleClickOutside = () => setOpenActionId(null);
        if (openActionId) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [openActionId]);

    const getCount = (tab: string) => {
        if (type !== 'interviews' || !sessions) return 0;
        return sessions.filter(session => {
             if (tab === 'schedule') return session.status === Status.NotStarted && (session.schedulingStatus === 'pending' || !session.schedulingStatus);
             if (tab === 'start') return session.status === Status.NotStarted && session.schedulingStatus === 'scheduled';
             if (tab === 'feedback') return session.status === Status.InProgress;
             if (tab === 'confirm') return session.status === Status.PendingConfirmation;
             if (tab === 'done') return session.status === Status.Completed;
             return false;
        }).length;
    };

    const getFilteredTasks = () => {
        if (type === 'interviews' && sessions) {
             return sessions.filter(session => {
                if (activeTab === 'schedule') return session.status === Status.NotStarted && (session.schedulingStatus === 'pending' || !session.schedulingStatus);
                if (activeTab === 'start') return session.status === Status.NotStarted && session.schedulingStatus === 'scheduled';
                if (activeTab === 'feedback') return session.status === Status.InProgress;
                if (activeTab === 'confirm') return session.status === Status.PendingConfirmation;
                if (activeTab === 'done') return session.status === Status.Completed;
                return false;
             }).map(s => ({
                 id: s.id,
                 name: s.period,
                 employee: s.employeeName,
                 period: s.period,
                 manager: s.managerName,
                 step: activeTab === 'confirm' ? '待确认' : '面谈沟通',
                 deadline: s.deadline || (s.date ? s.date.split(' ')[0] : '-'),
                 status: s.status,
                 rawSession: s 
             }));
        }
        
        if (type === 'plans') {
             const allPlans = [
                { id: 'p1', name: '任务到期8月', employee: '李莎', period: '2024年8月', step: '任务到期开始', deadline: '2024-09-05', status: 'pending', manager: undefined, rawSession: undefined },
                { id: 'p2', name: '移动端评语必填全年', employee: '李莎', period: '2024年全年', step: '制定', deadline: '-', status: 'pending', manager: undefined, rawSession: undefined },
             ];
             if (activeTab === 'todo') return allPlans.filter(p => p.status === 'pending');
             return allPlans; 
        }
        return [];
    };

    const tasks = getFilteredTasks();
    const title = type === 'interviews' ? '绩效面谈' : type === 'plans' ? '计划制定' : '待办任务';

    const handleActionClick = (e: React.MouseEvent, task: any) => {
        e.stopPropagation();
        if (type === 'interviews') {
            setOpenActionId(openActionId === task.id ? null : task.id);
        } else {
            onAction(task);
        }
    };

    const renderTabs = () => {
        if (type === 'interviews') {
             const tabs = [
                 { id: 'schedule', label: '待排期' },
                 { id: 'start', label: '待开始' },
                 { id: 'feedback', label: '待反馈' },
                 { id: 'confirm', label: '待确认' },
                 { id: 'done', label: '已完成' },
             ];
             return (
                 <div className="flex space-x-1 border-b border-gray-300">
                     {tabs.map(tab => {
                         const isActive = activeTab === tab.id;
                         return (
                             <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2.5 text-sm font-medium transition-colors relative border-b-2 ${
                                    isActive 
                                    ? 'border-primary text-primary font-bold' 
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                             >
                                 {tab.label}
                                 <span className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                                     {getCount(tab.id)}
                                 </span>
                             </button>
                         );
                     })}
                 </div>
             );
        } else {
             return (
                 <div className="flex space-x-1 border-b border-gray-300">
                     <button 
                        onClick={() => setActiveTab('todo')}
                        className={`px-6 py-2.5 text-sm font-medium border-b-2 ${activeTab === 'todo' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500'}`}
                     >
                        待处理
                     </button>
                     <button 
                        onClick={() => setActiveTab('done')}
                        className={`px-6 py-2.5 text-sm font-medium border-b-2 ${activeTab === 'done' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500'}`}
                     >
                        已完成
                     </button>
                 </div>
             )
        }
    };

    const renderAction = (task: any) => {
        if (type === 'interviews') {
            if (activeTab === 'schedule') {
                 // UPDATED: Simulating Manager/Interviewer View -> Need to Schedule
                 return (
                    <div className="flex justify-end space-x-2">
                        <button 
                            onClick={() => onAction(task.rawSession, 'schedule')} 
                            className="text-primary hover:text-primary-700 text-xs font-medium border border-primary-200 bg-primary-50 px-3 py-1.5 rounded flex items-center transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Calendar size={12} className="mr-1.5" /> 预约面谈
                        </button>
                        <button 
                            onClick={() => onAction(task.rawSession, 'feedback')} 
                            className="text-gray-600 hover:text-primary-600 text-xs font-medium border border-gray-200 bg-white px-3 py-1.5 rounded flex items-center transition-colors shadow-sm hover:bg-gray-50 whitespace-nowrap"
                        >
                            <Edit3 size={12} className="mr-1.5" /> 直接反馈
                        </button>
                    </div>
                 )
            }
            if (activeTab === 'start') {
                return (
                    <button 
                        onClick={() => onAction(task.rawSession)} 
                        className="text-primary hover:text-primary-700 text-xs font-medium border border-primary-200 bg-primary-50 px-3 py-1.5 rounded flex items-center justify-end ml-auto"
                    >
                        去面谈
                    </button>
                )
            }
            if (activeTab === 'feedback') {
                 return (
                    <button 
                        onClick={() => onAction(task.rawSession)}
                        className="text-ai-600 hover:text-ai-700 text-xs font-medium border border-ai-200 bg-ai-50 px-3 py-1.5 rounded flex items-center justify-end ml-auto"
                    >
                        <Edit3 size={12} className="mr-1"/> 填写反馈
                    </button>
                 )
            }
            if (activeTab === 'confirm') {
                 return (
                    <button 
                        onClick={() => onAction(task.rawSession)}
                        className="text-green-600 hover:text-green-700 text-xs font-medium border border-green-200 bg-green-50 px-3 py-1.5 rounded flex items-center justify-end ml-auto"
                    >
                        <CheckCircle size={12} className="mr-1"/> 去确认
                    </button>
                 )
            }
             return (
                <button 
                    onClick={() => onAction(task.rawSession)}
                    className="text-gray-500 hover:text-gray-800 text-xs font-medium hover:underline flex items-center justify-end ml-auto"
                >
                    查看详情
                </button>
             )
        }
        
        return (
             <button 
                onClick={() => onAction(task)}
                className="text-primary hover:text-primary-700 text-xs font-medium flex items-center justify-end w-full hover:underline"
            >
                去制定 <ChevronRight size={12} />
            </button>
        )
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="px-8 py-6 border-b border-gray-200">
                 <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
                 {renderTabs()}
            </div>

            <div className="px-8 py-4 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                     <button className="p-1.5 bg-white border border-gray-300 text-gray-500 rounded hover:bg-gray-50">
                        <Filter size={16} />
                     </button>
                     <div className="relative group">
                        <input type="text" placeholder="搜索任务..." className="pl-8 pr-4 py-1.5 border border-gray-300 rounded text-xs w-48 focus:ring-1 focus:ring-primary outline-none" />
                        <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
                     </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar p-8 pt-2 pb-32">
                <table className="w-full text-left border-collapse relative">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <th className="px-4 py-3 w-12 text-center border-b border-gray-200">
                                <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" />
                            </th>
                            <th className="px-4 py-3 border-b border-gray-200">任务名称</th>
                            <th className="px-4 py-3 border-b border-gray-200">员工姓名</th>
                            <th className="px-4 py-3 border-b border-gray-200">考核周期</th>
                            {type === 'interviews' && <th className="px-4 py-3 border-b border-gray-200">面谈官</th>}
                            <th className="px-4 py-3 border-b border-gray-200">参与步骤</th>
                            <th className="px-4 py-3 border-b border-gray-200">
                                {activeTab === 'schedule' || activeTab === 'todo' ? '截止时间' : '面谈时间'}
                            </th>
                            <th className="px-4 py-3 border-b border-gray-200 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {tasks.length > 0 ? (
                            tasks.map(task => (
                                <tr key={task.id} className="hover:bg-primary-50/30 transition-colors group relative">
                                    <td className="px-4 py-4 text-center">
                                        <input type="checkbox" className="rounded text-primary focus:ring-primary cursor-pointer" />
                                    </td>
                                    <td className="px-4 py-4 font-medium text-gray-900">{task.name}</td>
                                    <td className="px-4 py-4">{task.employee}</td>
                                    <td className="px-4 py-4">{task.period}</td>
                                    {type === 'interviews' && <td className="px-4 py-4 text-gray-600">{(task as any).manager}</td>}
                                    <td className="px-4 py-4">{task.step}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center text-gray-600">
                                            {(activeTab !== 'schedule' && activeTab !== 'todo' && task.deadline !== '-') && <Clock size={12} className="mr-1.5 text-gray-400" />}
                                            {task.deadline}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right relative">
                                        {renderAction(task)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={type === 'interviews' ? 8 : 7} className="px-6 py-12 text-center text-gray-400">
                                    暂无相关任务
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
             <div className="border-t border-gray-200 px-8 py-4 flex items-center justify-end space-x-2 text-xs text-gray-500">
                 <button className="px-2 py-1 border rounded hover:bg-gray-50">&lt;</button>
                 <button className="px-2 py-1 border border-primary text-primary bg-primary-50 rounded">1</button>
                 <button className="px-2 py-1 border rounded hover:bg-gray-50">&gt;</button>
                 <span>10 条/页</span>
             </div>
        </div>
    );
};

export default EmployeeTaskTable;
