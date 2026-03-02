
import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Grid, Mail, RefreshCw, X, Check, Smartphone } from 'lucide-react';
import { Notification } from '../types';

interface TopNavProps {
  currentRole: 'HR' | 'Employee';
  onRoleChange: (role: 'HR' | 'Employee') => void;
  notifications?: Notification[];
  onMarkRead?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  onMobileClick?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ currentRole, onRoleChange, notifications = [], onMarkRead, onNotificationClick, onMobileClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter notifications for current role
  const roleNotifications = notifications.filter(n => n.targetRole === currentRole);
  const unreadCount = roleNotifications.filter(n => !n.read).length;

  return (
    <div className="h-14 bg-white border-b border-gray-300 flex items-center justify-between px-6 shadow-sm z-30 sticky top-0">
        {/* Breadcrumb / Title Area */}
        <div className="flex items-center text-sm">
             <span className="text-gray-500">智能绩效</span>
             <span className="mx-2 text-gray-300">/</span>
             <span className="text-gray-500">绩效管理</span>
             <span className="mx-2 text-gray-300">/</span>
             <span className="text-gray-800 font-bold">{currentRole === 'HR' ? 'HR 管理后台' : '员工工作台'}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-5">
            {/* Role Switcher */}
            <div className="bg-gray-100 p-1 rounded-lg flex items-center shadow-inner mr-2">
                <button
                    onClick={() => onRoleChange('Employee')}
                    className={`px-3 py-1 text-xs rounded-md transition-all flex items-center ${
                        currentRole === 'Employee' 
                        ? 'bg-white text-primary-600 shadow-sm font-bold' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <span className="mr-1">👨‍💻</span> 员工端
                </button>
                <button
                    onClick={() => onRoleChange('HR')}
                    className={`px-3 py-1 text-xs rounded-md transition-all flex items-center ${
                        currentRole === 'HR' 
                        ? 'bg-white text-primary-600 shadow-sm font-bold' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <span className="mr-1">👔</span> HR端
                </button>
                {/* Mobile Entry Point */}
                <button
                    onClick={onMobileClick}
                    className="px-3 py-1 text-xs rounded-md transition-all flex items-center text-gray-500 hover:text-gray-800 hover:bg-white/60 ml-1"
                    title="移动端模拟"
                >
                    <Smartphone size={14} className="mr-1" /> 移动端
                </button>
            </div>

            <div className="h-5 w-px bg-gray-300"></div>

            <div className="relative">
                <input 
                    type="text" 
                    placeholder="搜索..." 
                    className="pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary w-48 transition-all bg-gray-50 hover:bg-white placeholder-gray-400"
                />
                <Search className="absolute left-3 top-2 text-gray-400" size={16} />
            </div>

            <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-primary transition-colors"><Mail size={18} /></button>
                
                {/* Notifications Bell */}
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`text-gray-500 hover:text-primary transition-colors relative ${showNotifications ? 'text-primary' : ''}`}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                            <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-bold text-gray-800 text-sm">通知中心</h3>
                                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {roleNotifications.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-gray-400">
                                            暂无新通知
                                        </div>
                                    ) : (
                                        roleNotifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => {
                                                    setShowNotifications(false);
                                                    if (onNotificationClick) onNotificationClick(notif);
                                                }}
                                                className={`p-3 border-b border-gray-50 hover:bg-blue-50/50 transition-colors relative group cursor-pointer ${notif.read ? 'opacity-60' : 'bg-white'}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-xs font-bold ${notif.type === 'alert' ? 'text-red-500' : 'text-gray-800'}`}>
                                                        {notif.title}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">{notif.time}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 leading-relaxed pr-6">
                                                    {notif.content}
                                                </p>
                                                {!notif.read && onMarkRead && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id); }}
                                                        className="absolute top-3 right-3 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="标记已读"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                                {!notif.read && (
                                                    <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full group-hover:opacity-0 transition-opacity"></div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">查看全部通知</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <button className="text-gray-500 hover:text-primary transition-colors"><HelpCircle size={18} /></button>
            </div>
            
            <div className="flex items-center cursor-pointer pl-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border border-white shadow-sm text-xs">
                    {currentRole === 'HR' ? 'HR' : 'L'}
                </div>
            </div>
        </div>
    </div>
  );
};

export default TopNav;
