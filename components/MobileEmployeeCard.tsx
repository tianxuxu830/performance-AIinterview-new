import React from 'react';
import { InterviewSession } from '../types';

interface MobileEmployeeCardProps {
  session: InterviewSession;
  statusLabel: string;
  isCollapsed?: boolean;
  children?: React.ReactNode;
}

const MobileEmployeeCard: React.FC<MobileEmployeeCardProps> = ({ session, statusLabel, isCollapsed = false, children }) => {
  const getStatusColor = (status: string) => {
    if (status === '已完成') return 'bg-green-50 text-green-600 border-green-200 border';
    if (status === '进行中' || status === '正在反馈') return 'bg-blue-50 text-blue-600 border-blue-200 border';
    if (status === '待确认') return 'bg-orange-50 text-orange-600 border-orange-200 border';
    if (status === '已取消') return 'bg-gray-100 text-gray-500 border-gray-200 border';
    return 'bg-gray-50 text-gray-600 border-gray-200 border';
  };

  if (isCollapsed) {
    return (
      <div className="flex items-center justify-between py-2 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center min-w-0 flex-1 pr-2">
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs mr-2 border border-purple-100 shrink-0">
            {session.employeeName.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-gray-900 leading-none mb-1 truncate">{session.period}</span>
            <span className="text-xs text-gray-500 leading-none truncate">{session.employeeName}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded scale-90 origin-right shrink-0 ${getStatusColor(statusLabel)}`}>{statusLabel}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className="font-bold text-gray-900 text-base leading-tight pr-2 break-words flex-1">
          {session.period}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded shrink-0 ml-2 ${getStatusColor(statusLabel)}`}>
          {statusLabel}
        </span>
      </div>
      
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base mr-3 border border-purple-100 shrink-0 mt-0.5">
          {session.employeeName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="font-bold text-gray-900 text-sm break-words">{session.employeeName}</div>
          <div className="text-xs text-gray-500 break-words">工号: {session.employeeId || '-'}</div>
          <div className="text-xs text-gray-500 break-words">{session.department || '未分配部门'}</div>
          {session.rejectReason && (
            <div className="mt-2 text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 italic">
              申请原因：{session.rejectReason}
            </div>
          )}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default MobileEmployeeCard;
