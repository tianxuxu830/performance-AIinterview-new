
import React, { useState } from 'react';
import { 
  GitMerge, UserCog, FileText, Database, Target, 
  MessageSquare, ListOrdered, BarChart3, Calendar, 
  Gauge, Hash, Sliders, FileInput, Settings
} from 'lucide-react';

interface SystemSettingsProps {
    onNavigate: (page: string) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState('assessment');

    const sections = [
        {
            title: '流程规则设置',
            items: [
                { id: 'process', title: '流程设置', icon: GitMerge, color: 'text-blue-500 bg-blue-50' },
                { id: 'roles', title: '考核角色', icon: UserCog, color: 'text-blue-500 bg-blue-50' },
            ]
        },
        {
            title: '考核模板设置',
            items: [
                { id: 'templates', title: '模板设置', icon: FileText, color: 'text-blue-500 bg-blue-50' },
                { id: 'fields', title: '字段库', icon: Database, color: 'text-orange-500 bg-orange-50' },
                { id: 'goals', title: '目标模板设置', icon: Target, color: 'text-orange-500 bg-orange-50' },
                // Updated Item
                { 
                    id: 'interview_templates', 
                    title: '面谈模板配置', 
                    icon: MessageSquare, 
                    color: 'text-purple-500 bg-purple-50',
                    action: () => onNavigate('template_config'),
                    badge: 'New'
                },
            ]
        },
        {
            title: '考核结果设置',
            items: [
                { id: 'rating', title: '评分规则', icon: ListOrdered, color: 'text-green-500 bg-green-50' },
                { id: 'grades', title: '等级设置', icon: BarChart3, color: 'text-orange-500 bg-orange-50' },
            ]
        },
        {
            title: '基础配置',
            items: [
                { id: 'period', title: '周期设置', icon: Calendar, color: 'text-blue-500 bg-blue-50' },
                { id: 'units', title: '计量单位设置', icon: Gauge, color: 'text-blue-500 bg-blue-50' },
                { id: 'codes', title: '指标编码设置', icon: Hash, color: 'text-green-500 bg-green-50' },
                { id: 'prefs', title: '偏好设置', icon: Sliders, color: 'text-blue-500 bg-blue-50' },
                { id: 'refs', title: '数据引用规则', icon: FileInput, color: 'text-blue-500 bg-blue-50' },
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Top Tabs */}
            <div className="px-8 pt-6 pb-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex space-x-8">
                    <button 
                        onClick={() => setActiveTab('assessment')}
                        className={`pb-3 text-sm font-medium transition-all ${
                            activeTab === 'assessment' 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        考核设置
                    </button>
                    <button 
                        onClick={() => setActiveTab('goals')}
                        className={`pb-3 text-sm font-medium transition-all ${
                            activeTab === 'goals' 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        目标设置
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-7xl">
                    {sections.map((section, idx) => (
                        <div key={idx} className="mb-10">
                            {/* Section Header */}
                            <div className="flex items-center mb-6">
                                <div className="w-1 h-4 bg-blue-600 rounded-full mr-3"></div>
                                <h2 className="text-base font-bold text-gray-800">{section.title}</h2>
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {section.items.map((item) => (
                                    <div 
                                        key={item.id} 
                                        onClick={item.action}
                                        className={`group bg-white border border-gray-200 rounded-lg p-5 flex items-center space-x-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative ${item.action ? '' : 'opacity-80'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                                            <item.icon size={22} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {item.action ? '点击配置' : '系统默认'}
                                            </p>
                                        </div>
                                        {item.badge && (
                                            <span className="absolute top-3 right-3 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded font-medium">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
             <div className="fixed bottom-8 right-8 flex flex-col items-center space-y-4">
                 <button className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-blue-500 hover:bg-gray-50">
                    <Settings size={20} />
                 </button>
            </div>
        </div>
    );
};

export default SystemSettings;
