
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Settings, Plus, 
  Video, MapPin, Edit3, Clock, Calendar as CalendarIcon,
  CheckCircle2
} from 'lucide-react';
import { InterviewSession, Status } from '../types';

interface EmployeeDashboardProps {
  sessions: InterviewSession[];
  onEnterMeeting: (session: InterviewSession) => void;
  onFeedback: (session: InterviewSession) => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ 
  sessions, 
  onEnterMeeting, 
  onFeedback 
}) => {
  // Demo date: Jan 9, 2026
  const MOCK_TODAY = new Date(2026, 0, 9);
  
  const [currentDate, setCurrentDate] = useState(MOCK_TODAY);
  const [selectedDate, setSelectedDate] = useState(MOCK_TODAY);

  // Filter for sessions that have a valid date scheduled
  const scheduledSessions = useMemo(() => {
      return sessions.filter(s => s.date && (s.schedulingStatus === 'scheduled' || s.status === Status.Completed || s.status === Status.InProgress));
  }, [sessions]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(MOCK_TODAY);
    setSelectedDate(MOCK_TODAY);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const getEventsForDate = (date: Date) => {
      return scheduledSessions.filter(s => {
          const sDate = new Date(s.date.split(' ')[0]); // Handle "YYYY-MM-DD HH:mm"
          return isSameDay(sDate, date);
      });
  };

  const selectedEvents = getEventsForDate(selectedDate);

  const renderCalendarGrid = () => {
    const totalDays = getDaysInMonth(currentDate);
    const startOffset = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for offset
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 w-full"></div>);
    }

    // Days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isSelected = isSameDay(date, selectedDate);
      const isToday = isSameDay(date, MOCK_TODAY);
      const dayEvents = getEventsForDate(date);
      const hasEvents = dayEvents.length > 0;
      
      const dayOfWeek = date.getDay();
      
      days.push(
        <div 
          key={i} 
          onClick={() => setSelectedDate(date)}
          className="relative h-20 lg:h-24 border-t border-gray-100 flex flex-col items-center justify-start pt-2 cursor-pointer group hover:bg-gray-50 transition-colors"
        >
          {/* Status Tag (Mock for demo visualization of weekends/workdays) */}
          {(i === 1 || dayOfWeek === 6) && (
             <span className="absolute top-1 left-1 text-[10px] text-green-600 bg-green-50 px-1 rounded transform scale-75 origin-top-left">休</span>
          )}
          {(i === 4 || dayOfWeek === 1) && (
             <span className="absolute top-1 right-1 text-[10px] text-blue-600 bg-blue-50 px-1 rounded transform scale-75 origin-top-right">班</span>
          )}

          <div className={`
            w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium mb-1 transition-all
            ${isSelected ? 'bg-primary text-white shadow-md' : 'text-gray-700 group-hover:text-primary'}
            ${isToday && !isSelected ? 'text-primary font-bold' : ''}
          `}>
            {isToday && !isSelected ? '今' : i}
          </div>
          
          {hasEvents && (
            <div className="flex space-x-1 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}></div>
              {dayEvents.length > 1 && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}></div>}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const getEventTime = (dateStr: string) => {
      if (dateStr.includes(' ')) {
          return dateStr.split(' ')[1];
      }
      return '全天'; // Or default time
  };

  return (
    <div className="p-6 h-full flex flex-col bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8 h-full overflow-hidden">
            
            {/* Left: Calendar */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-bold text-gray-800">日历</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><ChevronLeft size={18}/></button>
                            <span className="font-medium font-mono text-base">{currentDate.getFullYear()}年{String(currentDate.getMonth() + 1).padStart(2, '0')}月</span>
                            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><ChevronRight size={18}/></button>
                            <button onClick={handleToday} className="text-primary hover:text-primary-700 ml-2">今天</button>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full">
                        <Settings size={18} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col">
                    {/* Week Header */}
                    <div className="grid grid-cols-7 mb-2">
                        {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>
                    {/* Days Grid */}
                    <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar content-start">
                        {renderCalendarGrid()}
                    </div>
                    
                    <div className="flex justify-end mt-2 text-primary hover:text-primary-700 cursor-pointer text-xs flex items-center">
                        详细日历 <ChevronRight size={12} className="ml-0.5" />
                    </div>
                </div>
            </div>

            {/* Right: Daily Agenda */}
            <div className="w-full lg:w-[400px] bg-white border-l border-gray-100 pl-8 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h3 className="text-lg font-bold text-gray-800">当日事项 ({selectedEvents.length})</h3>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {selectedEvents.length > 0 ? (
                        selectedEvents.map(session => {
                            const isCompleted = session.status === Status.Completed;
                            const isOnline = session.method === 'appointment';
                            const timeStr = getEventTime(session.date);
                            
                            return (
                                <div key={session.id} className="bg-primary-50/30 rounded-xl p-4 border border-primary-100 hover:shadow-sm transition-all group">
                                    <div className="flex items-start mb-3">
                                        <div className={`mt-0.5 mr-3 p-1.5 rounded-lg ${isOnline ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {isOnline ? <Video size={16} /> : <MapPin size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-800 leading-snug mb-1">
                                                面谈：{session.period}
                                            </h4>
                                            <div className="text-xs text-gray-500 mb-1">
                                                对象：{session.employeeName}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono flex items-center">
                                                <Clock size={10} className="mr-1" />
                                                {timeStr}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end space-x-3 pt-2 border-t border-primary-100/50">
                                        {isCompleted ? (
                                            <span className="text-xs font-medium text-green-600 flex items-center">
                                                <CheckCircle2 size={12} className="mr-1" /> 已完成
                                            </span>
                                        ) : (
                                            <>
                                                {isOnline && (
                                                    <button 
                                                        onClick={() => onEnterMeeting(session)}
                                                        className="text-xs font-medium text-primary hover:text-primary-700 transition-colors flex items-center"
                                                    >
                                                        进入会议
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => onFeedback(session)}
                                                    className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center"
                                                >
                                                    <Edit3 size={12} className="mr-1" /> 填写反馈
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <CalendarIcon size={24} className="opacity-50" />
                            </div>
                            <p className="text-sm">今日无面谈安排</p>
                        </div>
                    )}
                    
                    {/* Placeholder for later times */}
                    {selectedEvents.length > 0 && (
                        <div className="opacity-40">
                             <div className="flex items-center text-xs text-gray-300 mb-2 mt-6">
                                 <span className="w-2 h-2 rounded-full bg-gray-200 mr-2"></span>
                                 晚些时候
                             </div>
                             <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default EmployeeDashboard;
