import React, { useState } from 'react';
import { X, TrendingUp, Users, BarChart3, Target } from 'lucide-react';
import AssessmentDetailTable from './AssessmentDetailTable';
import { AssessmentDetail } from '../types';

interface AssessmentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  detail: AssessmentDetail;
}

const AssessmentDetailDrawer: React.FC<AssessmentDetailDrawerProps> = ({ isOpen, onClose, employee, detail }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detail'>('summary');

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab('summary');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px] transition-all">
      <div className="w-[900px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
           <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-white shadow-sm overflow-hidden">
                  {employee?.avatar ? <img src={employee.avatar} alt="" className="w-full h-full object-cover" /> : employee?.name?.charAt(0)}
              </div>
              <div>
                  <div className="font-bold text-gray-900 text-lg">{employee?.name}</div>
                  <div className="text-xs text-gray-500">{employee?.department} · {employee?.role}</div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200 flex space-x-8 bg-white">
            <button
                onClick={() => setActiveTab('summary')}
                className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                总结概览
            </button>
            <button
                onClick={() => setActiveTab('detail')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'detail' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                考核表明细
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 p-6">
            {activeTab === 'summary' && <SummaryOverview detail={detail} />}
            {activeTab === 'detail' && <AssessmentDetailTable detail={detail} period={employee?.currentTask} />}
        </div>
      </div>
    </div>
  );
};

const SummaryOverview: React.FC<{ detail: AssessmentDetail }> = ({ detail }) => {
    // Mock Data for Summary View matching the screenshot
    const summaryData = {
        totalScore: 88.5,
        grade: 'A',
        coefficient: 1.2,
        ranking: '65%',
        selfScore: 98.5,
        othersAvg: 86.9,
        variance: 11.6,
        roleScores: [
            { role: '直属上级', score: 82 },
            { role: '虚线主管', score: 86 },
            { role: '互评同事', score: 88 },
            { role: '下属', score: 92 },
        ]
    };

    return (
        <div className="space-y-6">
            {/* 1. Performance Summary Cards */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2 mb-8">
                    <Target size={20} className="text-blue-500" />
                    <h3 className="font-bold text-gray-800 text-base">绩效摘要</h3>
                </div>
                <div className="grid grid-cols-4 gap-6">
                    <SummaryCard label="绩效总分" value={summaryData.totalScore} color="blue" />
                    <SummaryCard label="绩效等级" value={summaryData.grade} color="purple" />
                    <SummaryCard label="绩效系数" value={summaryData.coefficient} color="green" />
                    <SummaryCard label="百分位排名" value={summaryData.ranking} color="orange" />
                </div>
            </div>

            {/* 2. Detailed Indicator Analysis */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center space-x-2">
                        <BarChart3 size={20} className="text-blue-500" />
                        <h3 className="font-bold text-gray-800 text-base">指标明细分析</h3>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">数据更新至: 2024-Q4</span>
                </div>

                <div className="bg-purple-50/40 rounded-2xl p-8 border border-purple-100/50">
                    {/* Variance Analysis Header */}
                    <div className="flex items-center justify-between mb-10">
                         <div className="flex items-center space-x-2">
                            <Users size={18} className="text-purple-700" />
                            <h4 className="font-bold text-gray-800">总评分差异分析</h4>
                         </div>
                         <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">分差: {summaryData.variance}</span>
                    </div>

                    {/* Variance Scores */}
                    <div className="flex justify-center items-center space-x-24 mb-12">
                        <div className="text-center">
                            <div className="text-xs text-purple-500 font-medium mb-2">员工自评</div>
                            <div className="text-5xl font-bold text-purple-900 tracking-tight">{summaryData.selfScore}</div>
                        </div>
                        <div className="h-16 w-px bg-purple-200"></div>
                        <div className="text-center">
                            <div className="text-xs text-purple-500 font-medium mb-2">他人评价 (平均)</div>
                            <div className="text-5xl font-bold text-purple-900 tracking-tight">{summaryData.othersAvg}</div>
                        </div>
                    </div>

                    {/* Role Breakdown */}
                    <div>
                        <div className="flex justify-between items-end mb-4 px-1">
                            <span className="text-xs font-bold text-purple-400">角色评分明细</span>
                            <span className="text-[10px] text-purple-300">(分差越大颜色越深)</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {summaryData.roleScores.map((role, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <span className="text-xs text-purple-500 font-medium mb-2">{role.role}</span>
                                    <div className="w-full bg-purple-500 text-white font-bold text-center py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-default">
                                        {role.score}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, color }: { label: string, value: string | number, color: string }) => {
    const colorStyles = {
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        green: 'text-green-600',
        orange: 'text-orange-600',
    };

    return (
        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow h-32">
            <span className={`text-xs font-bold mb-3 ${colorStyles[color as keyof typeof colorStyles]}`}>{label}</span>
            <span className="text-4xl font-bold text-gray-900 tracking-tight">{value}</span>
        </div>
    );
}

export default AssessmentDetailDrawer;
