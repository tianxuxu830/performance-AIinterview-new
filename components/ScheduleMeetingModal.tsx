
import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, User, Plus, 
  Settings, ChevronDown, AlignLeft, 
  Bold, Italic, Underline, List, CheckSquare, 
  ImageIcon, MoreHorizontal, Sparkles, RefreshCcw,
  Video
} from 'lucide-react';
import { MOCK_EMPLOYEES, MOCK_TEMPLATES } from '../constants';
import { InterviewSession, InterviewType } from '../types';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  session: InterviewSession | null;
}

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({ isOpen, onClose, onConfirm, session }) => {
  const [topicType, setTopicType] = useState('绩效面谈');
  const [topic, setTopic] = useState('日常面谈');
  const [selectedTemplateId, setSelectedTemplateId] = useState(MOCK_TEMPLATES[0].id);
  
  const [method, setMethod] = useState('腾讯会议');
  const [date, setDate] = useState('2025-09-10');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('30 分钟');

  useEffect(() => {
    if (isOpen) {
        if (session) {
            // 1. Initialize Topic Text
            setTopic(session.period || '');
            
            // 2. Initialize Topic Type (Left Dropdown)
            if (session.type === InterviewType.Regular) setTopicType('绩效面谈');
            else if (session.type === InterviewType.Probation) setTopicType('晋升访谈');
            else if (session.type === InterviewType.Counseling) setTopicType('日常面谈');
            else setTopicType('绩效面谈'); // Default

            // 3. Initialize Template (Right Dropdown)
            if (session.templateId) {
                setSelectedTemplateId(session.templateId);
            }
        } else {
            // Defaults for creating new without session
            setTopic('日常面谈');
            setTopicType('绩效面谈');
            setSelectedTemplateId(MOCK_TEMPLATES[0].id);
        }
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  // Mock data
  const currentUser = { id: 'me', name: '我', avatar: 'https://picsum.photos/id/1005/50/50' };
  const targetUser = session 
    ? { id: session.employeeId, name: session.employeeName, avatar: MOCK_EMPLOYEES.find(e => e.id === session.employeeId)?.avatar || 'https://picsum.photos/id/1011/50/50' }
    : { id: 'u1', name: '李娜', avatar: 'https://picsum.photos/id/1011/50/50' };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-4 lg:p-6">
      <div className="bg-[#F3F4F6] rounded-2xl shadow-2xl w-full max-w-[95vw] lg:max-w-6xl overflow-hidden flex flex-col h-[90vh] max-h-[850px] relative transition-all duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-[#F3F4F6] shrink-0">
            <h2 className="text-xl font-bold text-gray-800">新建预约面谈</h2>
            <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-500 transition-colors">
                <X size={18} />
            </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row px-4 lg:px-8 pb-4 lg:pb-8 gap-4 lg:gap-6 overflow-hidden">
            {/* LEFT COLUMN - Settings */}
            <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col space-y-5 overflow-y-auto custom-scrollbar pr-2 shrink-0">
                
                {/* Topic */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                        <span className="mr-2"><RefreshCcw size={14} className="text-gray-400" /></span> 面谈主题
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                             <select 
                                disabled={!!session}
                                value={topicType}
                                onChange={(e) => setTopicType(e.target.value)}
                                className={`w-full appearance-none pl-9 pr-8 py-2.5 border border-transparent rounded-lg text-sm font-medium shadow-sm focus:ring-2 focus:ring-purple-500 outline-none ${session ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700'}`}
                             >
                                <option value="绩效面谈">绩效面谈</option>
                                <option value="日常面谈">日常面谈</option>
                                <option value="绩效反馈">绩效反馈</option>
                                <option value="晋升访谈">晋升访谈</option>
                             </select>
                             <span className={`absolute left-3 top-2.5 ${session ? 'text-gray-400' : 'text-purple-500'}`}>
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                             </span>
                             <ChevronDown className="absolute right-3 top-3 text-gray-400" size={16} />
                        </div>
                        <input 
                            type="text" 
                            value={topic} 
                            disabled={!!session}
                            onChange={e => setTopic(e.target.value)}
                            className={`flex-[1.5] px-3 py-2.5 border border-transparent rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-purple-500 outline-none ${session ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                        />
                    </div>
                </div>

                {/* Method */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                         <span className="mr-2"><Video size={14} className="text-gray-400" /></span> 面谈方式
                    </label>
                    <div className="flex items-center px-3 py-2.5 bg-white rounded-lg shadow-sm">
                         <img src="https://meeting.tencent.com/static/img/281358d8336338e55e5108a705e49539.png" alt="Tencent" className="w-5 h-5 mr-2" />
                         <span className="text-sm text-gray-700 font-medium flex-1">腾讯会议</span>
                    </div>
                </div>

                {/* Time */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                         <span className="mr-2"><Calendar size={14} className="text-gray-400" /></span> 会议时间
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={`${date} ${time}`}
                                readOnly
                                className="w-full pl-3 pr-8 py-2.5 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                            />
                             <Clock className="absolute right-3 top-3 text-gray-400" size={16} />
                        </div>
                        <div className="w-28 relative">
                             <select className="w-full appearance-none px-3 py-2.5 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none">
                                <option>30 分钟</option>
                                <option>60 分钟</option>
                             </select>
                             <ChevronDown className="absolute right-3 top-3 text-gray-400" size={16} />
                        </div>
                    </div>
                    <div className="text-xs text-gray-400 pl-6">(GMT+08:00) 中国标准时间 <ChevronDown size={10} className="inline" /></div>
                </div>

                {/* Interviewer */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                         <span className="mr-2"><User size={14} className="text-gray-400" /></span> 面谈官
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center bg-white px-2 py-1.5 rounded-full shadow-sm pr-3">
                            <img src={currentUser.avatar} className="w-5 h-5 rounded-full mr-2" alt="" />
                            <span className="text-sm text-gray-700">我</span>
                            <button className="ml-2 text-gray-400 hover:text-gray-600"><X size={12}/></button>
                        </div>
                         <div className="flex items-center bg-white px-2 py-1.5 rounded-full shadow-sm pr-3">
                            <img src="https://picsum.photos/id/1025/50/50" className="w-5 h-5 rounded-full mr-2" alt="" />
                            <span className="text-sm text-gray-700">张伟</span>
                            <button className="ml-2 text-gray-400 hover:text-gray-600"><X size={12}/></button>
                        </div>
                        <button className="flex items-center text-gray-500 text-sm hover:text-purple-600 px-2">
                            <Plus size={16} className="mr-1" /> 添加
                        </button>
                    </div>
                </div>

                {/* Interviewee */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                         <span className="mr-2"><User size={14} className="text-gray-400" /></span> 面谈对象
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <div className={`flex items-center bg-white px-2 py-1.5 rounded-full shadow-sm ${session ? '' : 'pr-3'}`}>
                            <img src={targetUser.avatar} className="w-5 h-5 rounded-full mr-2" alt="" />
                            <span className="text-sm text-gray-700">{targetUser.name}</span>
                            {!session && (
                                <button className="ml-2 text-gray-400 hover:text-gray-600"><X size={12}/></button>
                            )}
                        </div>
                         <button className="flex items-center text-gray-500 text-sm hover:text-purple-600 px-2">
                            <Plus size={16} className="mr-1" /> 添加
                        </button>
                    </div>
                    <button className="text-xs text-gray-400 hover:text-gray-600 pl-6 flex items-center mt-1">
                        <Plus size={12} className="mr-1" /> 添加其他参与人
                    </button>
                </div>

                {/* Reference */}
                <div className="space-y-2 pt-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                         <span className="mr-2"><List size={14} className="text-gray-400" /></span> 参考信息 <span className="ml-1 text-gray-400 border border-gray-400 rounded-full w-3 h-3 text-[9px] flex items-center justify-center">i</span>
                    </label>
                    <button className="text-sm text-gray-500 hover:text-purple-600 pl-6 flex items-center">
                        <Plus size={16} className="mr-1" /> 添加附件
                    </button>
                </div>

                {/* Advanced */}
                <div className="pt-4">
                     <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                         <Settings size={14} className="mr-2" /> 高级设置 <ChevronDown size={14} className="ml-1" />
                     </button>
                </div>

            </div>

            {/* RIGHT COLUMN - Smart Template */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 flex flex-col relative min-h-[400px]">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-purple-200 mr-4 shrink-0">
                        <Sparkles size={20} fill="currentColor" />
                    </div>
                    <div>
                        <div className="flex items-center flex-wrap">
                             <h3 className="font-bold text-gray-800 text-lg mr-2">智能模版</h3>
                             <span className="text-xs text-gray-500 font-normal hidden lg:inline-block">可为你智能生成面谈大纲，面谈结束后自动完成 AI 总结</span>
                        </div>
                        <a href="#" className="text-xs text-purple-600 hover:underline">新建一个试试~</a>
                    </div>
                </div>

                {/* Toolbar Row */}
                <div className="flex items-center justify-between mb-4 overflow-x-auto">
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                        <div className="relative">
                            <select 
                                disabled={!!session}
                                value={selectedTemplateId}
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                                className={`appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 ${session ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                            >
                                {MOCK_TEMPLATES.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                        {!session && (
                            <button className="px-3 py-1.5 bg-purple-50 text-purple-600 text-sm font-medium rounded hover:bg-purple-100">
                                智能匹配
                            </button>
                        )}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 border border-gray-100 rounded-xl flex flex-col overflow-hidden bg-white">
                    {/* Formatting Toolbar */}
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center space-x-4 text-gray-500 bg-white overflow-x-auto hide-scrollbar">
                        <span className="text-sm text-gray-800 font-medium flex items-center mr-4 whitespace-nowrap">
                            <List size={14} className="mr-2" /> 面谈大纲
                        </span>
                        <div className="w-px h-4 bg-gray-200 shrink-0"></div>
                        <div className="flex space-x-3 whitespace-nowrap">
                             <button className="hover:text-gray-800"><RefreshCcw size={14} className="transform scale-x-[-1]" /></button>
                             <button className="hover:text-gray-800"><RefreshCcw size={14} /></button>
                             <button className="hover:text-gray-800 flex items-center text-sm font-serif">T <ChevronDown size={10} className="ml-0.5"/></button>
                             <div className="w-px h-4 bg-gray-200"></div>
                             <button className="hover:text-gray-800"><Underline size={14} /></button>
                             <button className="hover:text-gray-800"><Bold size={14} /></button>
                             <button className="hover:text-gray-800"><Italic size={14} /></button>
                             <div className="w-px h-4 bg-gray-200 hidden xl:block"></div>
                             <button className="hover:text-gray-800 hidden xl:block"><List size={14} /></button>
                             <button className="hover:text-gray-800 hidden xl:block"><CheckSquare size={14} /></button>
                             <button className="hover:text-gray-800 hidden xl:block"><ImageIcon size={14} /></button>
                        </div>
                        <div className="flex-1"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto font-sans text-sm text-gray-700 leading-relaxed space-y-6">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">访谈开场</h4>
                            <p className="text-gray-600">您好，非常感谢您抽出时间参与我们这次的访谈。我们这次访谈主要是想了解一下您在使用我们系统中绩效考核模块时的一些体验和感受，整个访谈大概会持续 [60] 分钟左右，您的所有反馈对我们都特别重要，那咱们就开始吧。</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">访谈背景</h4>
                            <p className="text-gray-600">了解用户对智慧绩效产品功能的需求、探究用户使用现有产品过程中的痛点、体验感受。</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">访谈纪要</h4>
                            <ul className="list-disc list-inside space-y-1 ml-1 text-gray-600">
                                <li>访谈议题一</li>
                                <li className="pl-5 text-gray-400 text-xs">条 AI不确定信息，数据信息模糊或存在多解</li>
                            </ul>
                        </div>
                        <div>
                             <h4 className="font-bold text-gray-900 mb-2">建议总结</h4>
                             <p className="text-gray-400 italic">（此处将自动生成总结...）</p>
                        </div>
                    </div>
                    
                    {/* Regenerate Button */}
                    <div className="absolute bottom-6 right-6">
                         <button className="flex items-center px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-full shadow-sm hover:bg-purple-50 hover:shadow-md transition-all text-xs font-medium">
                             <Sparkles size={14} className="mr-1.5" /> 重新生成
                         </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 lg:px-8 py-5 flex justify-end items-center gap-4 bg-[#F3F4F6] border-t border-transparent shrink-0">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-white rounded-full text-sm font-medium text-gray-600 hover:text-gray-800 hover:shadow-sm transition-all shadow-sm"
            >
                取消
            </button>
            <button 
                onClick={() => onConfirm({
                    topic,
                    method,
                    date,
                    time,
                    duration
                })}
                className="px-6 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full text-sm font-medium shadow-lg shadow-purple-300 hover:shadow-purple-400 transition-all"
            >
                创建并发起会议邀请
            </button>
        </div>

      </div>
    </div>
  );
};

export default ScheduleMeetingModal;
