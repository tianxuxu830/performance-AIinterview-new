
import React from 'react';
import { 
  Calendar, Edit3, Clock, User, ArrowRight, 
  MessageSquare, Video, AlertCircle, CheckSquare 
} from 'lucide-react';
import { InterviewSession, Status } from '../types';

interface TaskListProps {
  sessions: InterviewSession[];
  onSchedule: (session: InterviewSession) => void;
  onDirectFeedback: (session: InterviewSession) => void;
}

const TaskList: React.FC<TaskListProps> = ({ sessions, onSchedule, onDirectFeedback }) => {
  // Filter for sessions that are "tasks" for the manager
  // Logic: Status is NotStarted AND (schedulingStatus is pending OR undefined)
  const pendingTasks = sessions.filter(
    s => s.status === Status.NotStarted || (s.status === Status.InProgress && !s.date)
  );

  return (
    <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">我的待办任务</h1>
        <p className="text-gray-500 mt-1">您有 {pendingTasks.length} 个绩效面谈任务需要处理。</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">暂无待办任务</h3>
            <p className="text-gray-500 mt-1">您当前没有需要处理的绩效面谈。</p>
          </div>
        ) : (
          pendingTasks.map(session => (
            <div key={session.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 relative overflow-hidden group">
              {/* Left Color Bar based on urgency/type */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pl-2">
                
                {/* Task Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      待处理
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock size={12} className="mr-1" /> 截止: {session.deadline || '未设置'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                    {session.period}
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="font-normal text-gray-600 text-base">面谈对象：{session.employeeName}</span>
                  </h3>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User size={14} className="mr-1.5" />
                      直属上级
                    </div>
                    <div className="flex items-center">
                       <AlertCircle size={14} className="mr-1.5" />
                       需要针对 {session.gradeTag || 'KPI'} 结果进行沟通
                    </div>
                  </div>
                </div>

                {/* Actions Area */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                   
                   {/* Option A: Schedule */}
                   <button 
                     onClick={() => onSchedule(session)}
                     className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm group/btn1"
                   >
                      <div className="mr-3 p-1.5 bg-blue-50 text-blue-600 rounded-md group-hover/btn1:bg-blue-100 transition-colors">
                        <Video size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">预约在线面谈</div>
                        <div className="text-[10px] text-gray-400 font-normal">生成会议链接</div>
                      </div>
                   </button>

                   <div className="hidden sm:block text-gray-300 font-medium">或</div>

                   {/* Option B: Direct Feedback */}
                   <button 
                     onClick={() => onDirectFeedback(session)}
                     className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-blue-600 border border-transparent text-white rounded-lg text-sm font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all shadow-md group/btn2"
                   >
                      <div className="mr-3 p-1.5 bg-white/20 rounded-md group-hover/btn2:bg-white/30 transition-colors">
                        <Edit3 size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">直接填写反馈</div>
                        <div className="text-[10px] text-blue-100 font-normal">跳过预约步骤</div>
                      </div>
                      <ArrowRight size={16} className="ml-3 opacity-70 group-hover/btn2:translate-x-1 transition-transform" />
                   </button>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
