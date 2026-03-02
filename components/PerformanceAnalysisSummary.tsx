import React, { useState } from 'react';
import { 
  TrendingUp, ThumbsUp, AlertTriangle, Target, 
  Activity, BarChart, CheckCircle2, AlertCircle, Users,
  ChevronDown, ChevronUp, Target as TargetIcon,
  ChevronRight, History, Calendar, ExternalLink,
  Award, ListTodo
} from 'lucide-react';
import { AssessmentDetail } from '../types';
import { MOCK_CONFLICT_DETAILS_ENHANCED } from '../constants';

interface PerformanceAnalysisSummaryProps {
  assessmentDetail: AssessmentDetail;
  onOpenIndicatorDetails?: (indicator: any) => void;
}

const PerformanceAnalysisSummary: React.FC<PerformanceAnalysisSummaryProps> = ({ assessmentDetail, onOpenIndicatorDetails }) => {
  const [isIndicatorsExpanded, setIsIndicatorsExpanded] = useState(false);

  // Use enhanced conflict data for comparison
  const conflictData = MOCK_CONFLICT_DETAILS_ENHANCED;
  
  // Calculate "Others" average score (Manager, Matrix, Peer, Sub)
  const otherRoles = ['manager', 'matrix', 'peer', 'sub'];
  const othersScores = otherRoles.map(role => (conflictData.summary as any)[role].score);
  const othersAverage = othersScores.reduce((a, b) => a + b, 0) / othersScores.length;
  const selfScore = conflictData.summary.self.score;
  const scoreDiff = Math.abs(selfScore - othersAverage).toFixed(1);

  // Flatten all indicators from projects for comparison list
  const allIndicators = conflictData.projects.flatMap(p => p.indicators);

  return (
    <div className="space-y-6">
        {/* 1. Performance Summary (绩效摘要) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <TargetIcon size={16} className="mr-2 text-blue-500" /> 绩效摘要
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50/30 rounded-xl p-3 text-center border border-blue-50">
                    <div className="text-[10px] text-blue-600 font-medium mb-1">绩效总分</div>
                    <div className="text-xl font-bold text-gray-900">{assessmentDetail.performanceScore || '-'}</div>
                </div>
                <div className="bg-indigo-50/30 rounded-xl p-3 text-center border border-indigo-50">
                    <div className="text-[10px] text-indigo-600 font-medium mb-1">绩效等级</div>
                    <div className="text-xl font-bold text-indigo-600">{assessmentDetail.performanceGrade || '-'}</div>
                </div>
                <div className="bg-emerald-50/30 rounded-xl p-3 text-center border border-emerald-50">
                    <div className="text-[10px] text-emerald-600 font-medium mb-1">绩效系数</div>
                    <div className="text-xl font-bold text-gray-900">{assessmentDetail.performanceCoefficient || '-'}</div>
                </div>
                <div className="bg-orange-50/30 rounded-xl p-3 text-center border border-orange-50">
                    <div className="text-[10px] text-orange-600 font-medium mb-1">百分位排名</div>
                    <div className="text-xl font-bold text-gray-900">{assessmentDetail.percentile ? `${assessmentDetail.percentile}%` : '-'}</div>
                </div>
            </div>
        </div>

        {/* 2. Indicator Detail Analysis (指标明细分析) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-bold text-gray-900 flex items-center">
                    <BarChart size={16} className="mr-2 text-blue-500"/> 指标明细分析
                </h4>
                <div className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                    数据更新至: 2024-Q4
                </div>
            </div>
            
            {/* 2.1 Overall Score Difference Analysis (总评分差异分析) */}
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-5 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-xs font-bold text-purple-900 flex items-center">
                        <Users size={14} className="mr-1.5" /> 总评分差异分析
                    </span>
                    <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${parseFloat(scoreDiff) > 10 ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                            分差: {scoreDiff}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-8 relative z-10">
                    <div className="text-center">
                        <div className="text-[10px] text-purple-400 uppercase tracking-wider font-bold mb-1">员工自评</div>
                        <div className="text-3xl font-bold text-purple-900">{selfScore.toFixed(1)}</div>
                    </div>
                    <div className="text-center border-l border-purple-100">
                        <div className="text-[10px] text-purple-400 uppercase tracking-wider font-bold mb-1">他人评价 (平均)</div>
                        <div className="text-3xl font-bold text-purple-900">{othersAverage.toFixed(1)}</div>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-purple-100 relative z-10">
                    <div className="flex justify-between items-center text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-3">
                        <span>角色评分明细</span>
                        <span className="normal-case font-medium opacity-60">(分差越大颜色越深)</span>
                    </div>
                    <div className="flex justify-between space-x-2">
                        {conflictData.roles.filter(r => r.key !== 'self').map(role => {
                            const score = (conflictData.summary as any)[role.key].score;
                            const diff = Math.abs(score - selfScore);
                            return (
                                <div key={role.key} className="flex-1 flex flex-col items-center">
                                    <div className="text-[9px] text-purple-500 font-medium mb-1.5 truncate w-full text-center">{role.label}</div>
                                    <div className={`w-full py-2 rounded-lg text-xs font-bold text-center transition-all ${diff > 15 ? 'bg-purple-600 text-white shadow-sm' : diff > 10 ? 'bg-purple-400 text-white' : 'bg-purple-100 text-purple-700'}`}>
                                        {score.toFixed(0)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 2.2 Assessment Project Analysis (考核项目分析) */}
            {assessmentDetail.dimensions && (
                <div className="mb-8">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-1 flex items-center">
                        <Target size={12} className="mr-2" /> 考核项目分析
                    </h5>
                    <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">维度名称</th>
                                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">得分</th>
                                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">与上期对比</th>
                                    <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">与均分对比</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {assessmentDetail.dimensions.map(dim => (
                                    <tr key={dim.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-gray-700">{dim.name}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="text-blue-600 font-bold">{dim.score}</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-500">{dim.comparisonPrevious}</td>
                                        <td className="py-3.5 px-4 text-gray-500">{dim.comparisonAverage}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 2.3 Indicator Detail Analysis (指标明细分析 - Merged Cards) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                        <Activity size={12} className="mr-2" /> 指标明细分析
                    </h5>
                    <button 
                        onClick={() => setIsIndicatorsExpanded(!isIndicatorsExpanded)}
                        className="flex items-center text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded-full"
                    >
                        <span className="mr-1">{isIndicatorsExpanded ? '收起详情' : '展开详情'}</span>
                        {isIndicatorsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                </div>

                {/* Collapsible Content */}
                <div className={`space-y-4 overflow-hidden transition-all duration-500 ease-in-out ${isIndicatorsExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 gap-4">
                        {allIndicators.map((item) => {
                            const indicatorOthersScores = otherRoles.map(role => (item.scores as any)[role]);
                            const indicatorOthersAvg = indicatorOthersScores.reduce((a, b) => a + b, 0) / indicatorOthersScores.length;
                            const indicatorSelf = item.scores.self;
                            const diff = Math.abs(indicatorSelf - indicatorOthersAvg);
                            const isHighDiff = diff >= 15;
                            
                            const detailInd = assessmentDetail.indicators?.find(ind => ind.name.includes(item.name) || item.name.includes(ind.name));
                            
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => onOpenIndicatorDetails?.(item)}
                                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-600 transition-colors">
                                                <Activity size={16} className="text-blue-600 group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-900">{item.name}</h5>
                                                <span className="text-[10px] text-gray-400 font-medium">权重 {item.weight}%</span>
                                            </div>
                                        </div>
                                        {isHighDiff && (
                                            <span className="flex items-center text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                                                <AlertTriangle size={10} className="mr-1" /> 高分差
                                            </span>
                                        )}
                                    </div>

                                    {/* Score Metrics & Rating Comparison - Simplified & Merged */}
                                    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 mb-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-baseline space-x-3">
                                                <span className="text-2xl font-bold text-blue-700">{detailInd?.score || item.scores.manager}</span>
                                                <span className="text-[10px] text-gray-500">指标得分</span>
                                            </div>
                                            <div className="flex space-x-6 text-[10px]">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-gray-400 mb-0.5">与上期</span>
                                                    <span className="font-bold text-gray-700">{detailInd?.comparisonPrevious || '-'}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-gray-400 mb-0.5">与均分</span>
                                                    <span className="font-bold text-gray-700">{detailInd?.comparisonAverage || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Breakdown of scores */}
                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-400 mb-0.5">自评</span>
                                                        <span className="font-bold text-gray-800">{indicatorSelf}</span>
                                                    </div>
                                                    {otherRoles.map(role => {
                                                        const score = (item.scores as any)[role];
                                                        if (score === undefined) return null;
                                                        const roleLabel = conflictData.roles.find(r => r.key === role)?.label || role;
                                                        return (
                                                            <div key={role} className="flex flex-col">
                                                                <span className="text-gray-400 mb-0.5">{roleLabel}</span>
                                                                <span className="font-bold text-gray-800">{score}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-gray-400 mb-0.5">最大分差</span>
                                                    <span className={`font-bold ${isHighDiff ? 'text-red-600' : 'text-gray-600'}`}>
                                                        Δ {diff.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments & Analysis */}
                                    <div className="space-y-3">
                                        {item.comments.self && item.comments.self !== '-' && (
                                            <div className="text-[11px] text-gray-600 bg-orange-50/30 p-3 rounded-xl border border-orange-100/30 italic relative">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-200 rounded-l-xl"></div>
                                                <span className="font-bold text-orange-700 not-italic mr-2">自评:</span>
                                                "{item.comments.self}"
                                            </div>
                                        )}
                                        {detailInd?.description && (
                                            <div className="text-[11px] text-gray-600 bg-blue-50/30 p-3 rounded-xl border border-blue-100/30 relative">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-200 rounded-l-xl"></div>
                                                <span className="font-bold text-blue-700 mr-2">分析:</span>
                                                {detailInd.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Collapsed Preview */}
                {!isIndicatorsExpanded && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        {allIndicators
                            .map(item => {
                                const indicatorOthersAvg = otherRoles.map(role => (item.scores as any)[role]).reduce((a, b) => a + b, 0) / otherRoles.length;
                                return { ...item, diff: Math.abs(item.scores.self - indicatorOthersAvg) };
                            })
                            .sort((a, b) => b.diff - a.diff)
                            .slice(0, 2)
                            .map(item => (
                                <div 
                                    key={`preview-${item.id}`} 
                                    onClick={() => onOpenIndicatorDetails?.(item)}
                                    className="flex items-center justify-between bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[10px] hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                                >
                                    <span className="text-gray-700 font-bold truncate max-w-[120px]">{item.name}</span>
                                    <span className={`font-bold px-2 py-0.5 rounded-full ${item.diff >= 15 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        Δ {item.diff.toFixed(1)}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </div>

        {/* 3. Completion Status Summary (完成情况总结) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-5 flex items-center">
                <ListTodo size={16} className="mr-2 text-indigo-500" /> 完成情况总结
            </h4>
            <div className="space-y-4">
                <div className="bg-indigo-50/30 rounded-xl p-4 border border-indigo-50">
                    <h5 className="text-xs font-bold text-indigo-900 mb-3 flex items-center">
                        <Award size={14} className="mr-1.5 text-indigo-600" /> 主要成就
                    </h5>
                    <ul className="space-y-2.5">
                        <li className="text-[11px] text-gray-700 flex items-start leading-relaxed">
                            <span className="mr-2 mt-1.5 w-1 h-1 bg-indigo-400 rounded-full shrink-0"></span>
                            超额完成本季度核心业务指标，业绩达成率115%。
                        </li>
                        <li className="text-[11px] text-gray-700 flex items-start leading-relaxed">
                            <span className="mr-2 mt-1.5 w-1 h-1 bg-indigo-400 rounded-full shrink-0"></span>
                            成功主导并上线了重点项目，获得客户高度认可。
                        </li>
                    </ul>
                </div>
                <div className="bg-orange-50/30 rounded-xl p-4 border border-orange-50">
                    <h5 className="text-xs font-bold text-orange-900 mb-3 flex items-center">
                        <AlertCircle size={14} className="mr-1.5 text-orange-600" /> 待改进领域
                    </h5>
                    <ul className="space-y-2.5">
                        <li className="text-[11px] text-gray-700 flex items-start leading-relaxed">
                            <span className="mr-2 mt-1.5 w-1 h-1 bg-orange-400 rounded-full shrink-0"></span>
                            跨部门协作沟通效率有待提升，需加强信息同步。
                        </li>
                        <li className="text-[11px] text-gray-700 flex items-start leading-relaxed">
                            <span className="mr-2 mt-1.5 w-1 h-1 bg-orange-400 rounded-full shrink-0"></span>
                            团队内知识沉淀和分享频率较低。
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        {/* 4. Action & Development Advice */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-5 flex items-center">
                <ThumbsUp size={16} className="mr-2 text-orange-500" /> 行动与发展建议
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-emerald-50/50 to-white p-5 rounded-2xl border border-emerald-100/50 shadow-sm">
                    <h5 className="text-xs font-bold text-emerald-900 mb-4 flex items-center">
                        <CheckCircle2 size={14} className="mr-2 text-emerald-600" /> 优势强化建议
                    </h5>
                    <ul className="space-y-3">
                        {[
                            '总结近三个月销售成功经验，形成标准化销售流程和方法论',
                            '在团队内分享销售技巧，帮助其他成员提升',
                            '尝试拓展更高价值客户群体，提升单客贡献'
                        ].map((item, i) => (
                            <li key={i} className="text-[11px] text-emerald-700 flex items-start leading-relaxed">
                                <span className="mr-2.5 mt-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-gradient-to-br from-orange-50/50 to-white p-5 rounded-2xl border border-orange-100/50 shadow-sm">
                    <h5 className="text-xs font-bold text-orange-900 mb-4 flex items-center">
                        <AlertCircle size={14} className="mr-2 text-orange-600" /> 改进方向建议
                    </h5>
                    <ul className="space-y-3">
                        {[
                            '虽然得分已达90分，仍有提升空间',
                            '主动参与跨部门项目，增加协作机会',
                            '定期组织团队经验分享会'
                        ].map((item, i) => (
                            <li key={i} className="text-[11px] text-orange-700 flex items-start leading-relaxed">
                                <span className="mr-2.5 mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PerformanceAnalysisSummary;
