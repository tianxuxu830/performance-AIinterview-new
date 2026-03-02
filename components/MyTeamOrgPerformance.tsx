
import React from 'react';
import { Building2, TrendingUp, Users, Target, CheckCircle2, AlertCircle, BarChart3, Calendar } from 'lucide-react';

const MyTeamOrgPerformance: React.FC = () => {
  // Mock Data
  const orgInfo = {
    name: '产研中心 / 产品部',
    manager: '张伟',
    memberCount: 24,
    currentCycle: '2025 Q4 组织绩效',
    status: '进行中',
    progress: 75
  };

  const currentMetrics = [
    { label: '整体目标达成率', value: '88%', trend: '+5%', status: 'good' },
    { label: '全员自评完成率', value: '92%', trend: '-2%', status: 'warning' },
    { label: '预算执行率', value: '95%', trend: '持平', status: 'normal' },
    { label: '人才流失率', value: '0%', trend: '优', status: 'good' },
  ];

  const historyData = [
    { cycle: '2025 Q3', score: 94.5, grade: 'S', rank: 'Top 10%', date: '2025-10-15' },
    { cycle: '2025 Q2', score: 89.0, grade: 'A', rank: 'Top 30%', date: '2025-07-12' },
    { cycle: '2025 Q1', score: 85.5, grade: 'B+', rank: 'Top 50%', date: '2025-04-10' },
    { cycle: '2024 年度', score: 92.0, grade: 'A', rank: 'Top 20%', date: '2025-01-20' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 text-blue-600">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{orgInfo.name}</h1>
              <div className="text-sm text-gray-500 mt-1 flex items-center space-x-4">
                <span className="flex items-center"><Users size={14} className="mr-1" /> {orgInfo.memberCount} 人</span>
                <span className="flex items-center"><Target size={14} className="mr-1" /> 负责人: {orgInfo.manager}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
               当前周期: {orgInfo.currentCycle}
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Current Cycle Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <BarChart3 size={18} className="mr-2 text-blue-600" /> 本期进度看板
                </h3>
                <span className="text-xs text-gray-400">截止日期: 2026-01-15</span>
             </div>

             <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">考核整体进度</span>
                  <span className="font-bold text-blue-600">{orgInfo.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${orgInfo.progress}%` }}></div>
                </div>
             </div>

             <div className="grid grid-cols-4 gap-6">
                {currentMetrics.map((m, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100 relative overflow-hidden">
                     <div className="text-gray-500 text-xs mb-1">{m.label}</div>
                     <div className="text-2xl font-bold text-gray-900">{m.value}</div>
                     <div className={`text-xs mt-2 flex items-center ${m.status === 'good' ? 'text-green-600' : m.status === 'warning' ? 'text-orange-500' : 'text-gray-400'}`}>
                        {m.status === 'good' ? <TrendingUp size={12} className="mr-1" /> : m.status === 'warning' ? <AlertCircle size={12} className="mr-1" /> : null}
                        {m.trend}
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <Calendar size={18} className="mr-2 text-blue-600" /> 历史考核结果
                </h3>
             </div>
             <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
                   <tr>
                      <th className="px-6 py-4">考核周期</th>
                      <th className="px-6 py-4">归档日期</th>
                      <th className="px-6 py-4">组织绩效得分</th>
                      <th className="px-6 py-4">绩效等级</th>
                      <th className="px-6 py-4">公司排名</th>
                      <th className="px-6 py-4 text-right">操作</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {historyData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                         <td className="px-6 py-4 font-bold text-gray-800">{item.cycle}</td>
                         <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.date}</td>
                         <td className="px-6 py-4 font-bold text-gray-900">{item.score}</td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                ['S', 'A'].includes(item.grade) ? 'bg-green-50 text-green-700 border-green-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                                {item.grade}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-gray-600">{item.rank}</td>
                         <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline">查看详情</button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyTeamOrgPerformance;
