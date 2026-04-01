import React from 'react';
import { Clock, Edit3, CheckCircle, Play, FileText, UserCheck, AlertCircle } from 'lucide-react';

import { ActivityLogEntry } from '../types';

interface ActivityLogProps {
    logs: ActivityLogEntry[];
    hideHeader?: boolean;
}

export default function ActivityLog({ logs, hideHeader = false }: ActivityLogProps) {
    const getIcon = (type: string, action: string) => {
        if (action.includes('发起') || action.includes('创建')) return <Play size={14} className="text-blue-500" />;
        if (action.includes('完成') || action.includes('确认')) return <CheckCircle size={14} className="text-green-500" />;
        if (type === 'content_update') return <Edit3 size={14} className="text-orange-500" />;
        if (action.includes('驳回') || action.includes('取消')) return <AlertCircle size={14} className="text-red-500" />;
        return <Clock size={14} className="text-gray-500" />;
    };

    return (
        <div className={`bg-white rounded-xl ${hideHeader ? '' : 'border border-gray-200 shadow-sm'} overflow-hidden flex flex-col h-full`}>
            {!hideHeader && (
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center">
                        <Clock size={16} className="mr-2 text-gray-500" />
                        活动日志与调整记录
                    </h3>
                </div>
            )}
            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pb-4">
                    {logs.map((log, index) => (
                        <div key={log.id} className="relative pl-6">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center shadow-sm">
                                {getIcon(log.type, log.action)}
                            </div>
                            
                            {/* Content */}
                            <div className="mb-2 flex items-center justify-between group-hover:bg-gray-50/50 p-1 rounded transition-colors">
                                <span className="text-sm font-bold text-gray-900">{log.action}</span>
                                <span className="text-xs text-gray-400 font-mono">{log.timestamp}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-3 flex items-center">
                                <UserCheck size={12} className="mr-1 text-gray-400" />
                                操作人: <span className="font-medium text-gray-700 ml-1">{log.operator}</span>
                            </div>
                            
                            {/* Details */}
                            {log.details && (
                                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3 leading-relaxed">
                                    {log.details}
                                </div>
                            )}

                            {/* Changes */}
                            {log.changes && log.changes.length > 0 && (
                                <div className="mt-3 space-y-3">
                                    {log.changes.map((change, idx) => (
                                        <div key={idx} className="text-xs border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 font-bold text-gray-700 flex items-center justify-between">
                                                <span className="text-gray-800">{change.field}</span>
                                                {change.isTableDetail && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">表格明细</span>}
                                            </div>
                                            <div className="grid grid-cols-2 divide-x divide-gray-100">
                                                <div className="p-2.5 bg-red-50/20">
                                                    <div className="text-[10px] text-red-500 mb-1 font-bold uppercase tracking-wider">修改前</div>
                                                    <div className="text-gray-600 line-through decoration-red-300 decoration-1">{change.oldValue || '空'}</div>
                                                </div>
                                                <div className="p-2.5 bg-green-50/20">
                                                    <div className="text-[10px] text-green-600 mb-1 font-bold uppercase tracking-wider">修改后</div>
                                                    <div className="text-gray-900 font-medium">{change.newValue || '空'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
