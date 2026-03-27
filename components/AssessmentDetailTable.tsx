
import React, { useState } from 'react';
import { ChevronUp, FileText, Users, History, Calendar, Clock, MapPin, User, MessageSquare, CheckCircle2, Edit3, Image as ImageIcon } from 'lucide-react';
import { AssessmentDetail } from '../types';
import AssessmentDetailMobile from './AssessmentDetailMobile';

interface AssessmentDetailTableProps {
  detail: AssessmentDetail;
  period: string;
  onViewOthersScores?: () => void;
  onViewActivityLog?: () => void;
}

const MOCK_INTERVIEW_DATA = {
    status: '已完成',
    date: '2023-07-15 14:30',
    interviewer: '张经理',
    interviewee: '李明',
    method: '线下面谈',
    location: '会议室A',
    summary: '确认了Q2的绩效结果，讨论了Q3的改进方向，重点关注项目管理能力的提升。',
    templateFeedback: [
        {
            sectionTitle: '差距分析',
            type: 'table',
            columns: ['绩效目标', '实际完成情况', '原因分析'],
            data: [
                ['完成核心系统重构', '进度延迟15%', '跨部门协调沟通不畅，导致需求确认延期'],
                ['团队技术分享2次', '已完成3次', '团队成员积极性高，分享氛围良好']
            ]
        },
        {
            sectionTitle: '改进计划',
            type: 'form',
            fields: [
                { label: '改进计划', value: '建立跨部门周会机制，提前对齐需求。' },
                { label: '完成标准与时间', value: '每周三下午2点召开，Q3结束前100%按时召开。' },
                { label: '所需资源', value: '需要产品经理和测试负责人的配合。' }
            ]
        },
        {
            sectionTitle: '备注',
            type: 'form',
            fields: [
                { label: '备注信息', value: '员工态度积极，对改进计划表示认可。' }
            ]
        }
    ],
    records: [
        {
            id: 1,
            action: '提交反馈',
            user: '张经理',
            role: '面谈人',
            time: '2023-07-15 15:30:00',
            comment: '已完成面谈，请确认反馈内容。',
            signature: null
        },
        {
            id: 2,
            action: '确认反馈',
            user: '李明',
            role: '被面谈人',
            time: '2023-07-15 16:00:00',
            comment: '内容无误，同意反馈。',
            signature: 'https://picsum.photos/seed/signature/120/40'
        }
    ]
};

const AssessmentDetailTable: React.FC<AssessmentDetailTableProps> = ({ detail, period, onViewOthersScores, onViewActivityLog }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'interview'>('content');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="border-b border-gray-200 bg-gray-50 relative z-20 flex justify-between items-center pr-4">
          <div className="flex">
              <button 
                  onClick={() => setActiveTab('content')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                  考核内容
              </button>
              <button 
                  onClick={() => setActiveTab('interview')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'interview' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                  面谈详情
              </button>
          </div>
          <div className="flex items-center space-x-2">
              {onViewOthersScores && activeTab === 'content' && (
                  <div className="relative group">
                      <button 
                        onClick={onViewOthersScores} 
                        className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                          <Users size={18} />
                      </button>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          查看他人评分
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                      </div>
                  </div>
              )}
              {onViewActivityLog && activeTab === 'content' && (
                  <div className="relative group">
                      <button 
                        onClick={onViewActivityLog} 
                        className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                          <History size={18} />
                      </button>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          查看活动日志
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                      </div>
                  </div>
              )}
              {activeTab === 'content' && (
                  <>
                      <div className="h-4 w-px bg-gray-300 mx-2"></div>
                      <div className="flex items-center space-x-2">
                          <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">显示完整信息</span>
                          <div className="w-8 h-4 bg-blue-600 rounded-full relative cursor-pointer">
                              <div className="absolute right-0.5 top-0.5 bg-white w-3 h-3 rounded-full shadow-sm"></div>
                          </div>
                      </div>
                  </>
              )}
          </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-gray-50/50">
          {activeTab === 'content' ? (
              <div className="space-y-4 md:space-y-8">
                  {/* Mobile Assessment Detail */}
                  <div className="md:hidden -mx-6 -mt-6">
                      <AssessmentDetailMobile />
                  </div>

                  {/* Header Description */}
          <div className="hidden md:block bg-white p-4 rounded-lg border border-gray-200">
             <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center space-x-2">
                     <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                     <span className="font-bold text-gray-800 text-sm">考核说明</span>
                     <ChevronUp size={16} className="text-blue-500" />
                 </div>
             </div>
             <p className="text-sm text-gray-600 pl-3">
                 {detail.description}
             </p>
          </div>

          {/* OKR Section */}
          <div>
              <div className="hidden md:flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                      <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                      <span className="font-bold text-gray-800 text-sm">OKR</span>
                      <ChevronUp size={16} className="text-blue-500" />
                  </div>
                  <div className="text-xs text-gray-500">
                      (项目权重：{detail.okrWeight || 0}%，指标权重：70%)
                  </div>
              </div>

              {/* Desktop OKR Table */}
              <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
                      <div className="col-span-1 p-3 text-center border-r border-gray-100">序号</div>
                      <div className="col-span-4 p-3 border-r border-gray-100"><span className="text-red-500 mr-1">*</span>目标名称 (O)</div>
                      <div className="col-span-1 p-3 border-r border-gray-100 text-center"><span className="text-red-500 mr-1">*</span>权重(%)</div>
                      <div className="col-span-2 p-3 border-r border-gray-100"><span className="text-red-500 mr-1">*</span>KR1</div>
                      <div className="col-span-2 p-3 border-r border-gray-100"><span className="text-red-500 mr-1">*</span>KR2</div>
                      <div className="col-span-2 p-3 border-r border-gray-100"><span className="text-red-500 mr-1">*</span>KR3</div>
                  </div>
                  
                  {detail.okrs?.map((okr, index) => (
                      <div key={okr.id} className="grid grid-cols-12 text-sm border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition-colors">
                          <div className="col-span-1 p-3 text-center text-gray-500 border-r border-gray-100 flex items-center justify-center bg-gray-50/30">
                              {okr.sequence}
                          </div>
                          <div className="col-span-4 p-3 border-r border-gray-100 text-blue-600 hover:underline cursor-pointer flex items-start">
                              {okr.name}
                          </div>
                          <div className="col-span-1 p-3 border-r border-gray-100 text-center flex items-center justify-center">
                              <div className="border border-gray-300 rounded px-2 py-1 bg-white text-xs w-12 flex justify-between items-center">
                                  {okr.weight} <span>%</span>
                              </div>
                          </div>
                          <div className="col-span-2 p-3 border-r border-gray-100 text-gray-700 text-xs leading-relaxed">
                              {okr.krs[0]?.content || '-'}
                          </div>
                          <div className="col-span-2 p-3 border-r border-gray-100 text-gray-700 text-xs leading-relaxed">
                              {okr.krs[1]?.content || '-'}
                          </div>
                          <div className="col-span-2 p-3 border-r border-gray-100 text-gray-700 text-xs leading-relaxed">
                              {okr.krs[2]?.content || '-'}
                          </div>
                      </div>
                  ))}
                  {(!detail.okrs || detail.okrs.length === 0) && (
                      <div className="p-4 text-center text-xs text-gray-400 bg-gray-50/20">暂无 OKR 数据</div>
                  )}
              </div>

              {/* Mobile OKR Cards (Removed in favor of image) */}
          </div>

          {/* KPI Section */}
          <div>
              <div className="hidden md:flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                      <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                      <span className="font-bold text-gray-800 text-sm">KPI</span>
                      <ChevronUp size={16} className="text-blue-500" />
                  </div>
                  <div className="text-xs text-gray-500">
                      (项目权重：{detail.kpiWeight || 0}%，指标权重：10%)
                  </div>
              </div>

              {/* Desktop KPI Table */}
              <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
                      <div className="col-span-1 p-3 text-center border-r border-gray-100">序号</div>
                      <div className="col-span-3 p-3 border-r border-gray-100"><span className="text-red-500 mr-1">*</span>指标名称</div>
                      <div className="col-span-3 p-3 border-r border-gray-100"><span className="text-red-500 mr-1">*</span>指标说明</div>
                      <div className="col-span-3 p-3 border-r border-gray-100"><span className="text-red-500 mr-1">*</span>评分说明</div>
                      <div className="col-span-1 p-3 border-r border-gray-100 text-center"><span className="text-red-500 mr-1">*</span>权重(%)</div>
                      <div className="col-span-1 p-3 border-r border-gray-100"><span className="text-red-500 mr-1">*</span>目标值</div>
                  </div>
                  
                  {detail.kpis?.map((kpi, index) => (
                      <div key={kpi.id} className="grid grid-cols-12 text-sm border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition-colors">
                          <div className="col-span-1 p-3 text-center text-gray-500 border-r border-gray-100 flex items-center justify-center bg-gray-50/30">
                              {kpi.sequence}
                          </div>
                          <div className="col-span-3 p-3 border-r border-gray-100 text-blue-600 hover:underline cursor-pointer">
                              {kpi.name}
                          </div>
                          <div className="col-span-3 p-3 border-r border-gray-100 text-gray-700 text-xs">
                              {kpi.description}
                          </div>
                          <div className="col-span-3 p-3 border-r border-gray-100 text-gray-700 text-xs">
                              {kpi.evaluationMethod}
                          </div>
                          <div className="col-span-1 p-3 border-r border-gray-100 text-center flex items-center justify-center">
                              <div className="border border-gray-300 rounded px-2 py-1 bg-white text-xs w-12 flex justify-between items-center">
                                  {kpi.weight} <span>%</span>
                              </div>
                          </div>
                           <div className="col-span-1 p-3 border-r border-gray-100 text-gray-700 text-xs flex items-center">
                              {kpi.targetValue}
                          </div>
                      </div>
                  ))}
                  {(!detail.kpis || detail.kpis.length === 0) && (
                      <div className="p-4 text-center text-xs text-gray-400 bg-gray-50/20">暂无 KPI 数据</div>
                  )}
              </div>

              {/* Mobile KPI Cards (Removed in favor of image) */}
          </div>
              </div>
          ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                  {/* Interview Basic Info */}
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center space-x-2 mb-6">
                              <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                              <h3 className="font-bold text-gray-900 text-base">面谈基本信息</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                              <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                                  <div className="text-xs text-gray-500 mb-1.5 flex items-center"><Calendar size={14} className="mr-1.5 text-blue-500" /> 面谈时间</div>
                                  <div className="text-sm font-medium text-gray-900">{MOCK_INTERVIEW_DATA.date}</div>
                              </div>
                              <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                                  <div className="text-xs text-gray-500 mb-1.5 flex items-center"><User size={14} className="mr-1.5 text-blue-500" /> 面谈人</div>
                                  <div className="text-sm font-medium text-gray-900">{MOCK_INTERVIEW_DATA.interviewer}</div>
                              </div>
                              <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                                  <div className="text-xs text-gray-500 mb-1.5 flex items-center"><User size={14} className="mr-1.5 text-blue-500" /> 被面谈人</div>
                                  <div className="text-sm font-medium text-gray-900">{MOCK_INTERVIEW_DATA.interviewee}</div>
                              </div>
                              <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                                  <div className="text-xs text-gray-500 mb-1.5 flex items-center"><MapPin size={14} className="mr-1.5 text-blue-500" /> 面谈方式</div>
                                  <div className="text-sm font-medium text-gray-900">{MOCK_INTERVIEW_DATA.method} ({MOCK_INTERVIEW_DATA.location})</div>
                              </div>
                          </div>
                      </div>

                      {/* Interview Summary */}
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center space-x-2 mb-4">
                              <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                              <h3 className="font-bold text-gray-900 text-base">面谈总结</h3>
                          </div>
                          <div className="bg-blue-50/30 border border-blue-100/50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                              {MOCK_INTERVIEW_DATA.summary}
                          </div>
                      </div>

                      {/* Interview Feedback Details (Template Based) */}
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center space-x-2 mb-6">
                              <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                              <h3 className="font-bold text-gray-900 text-base">面谈反馈</h3>
                          </div>
                          <div className="space-y-6">
                              {MOCK_INTERVIEW_DATA.templateFeedback.map((section, index) => (
                                  <div key={index} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                      <div className="bg-gray-50/80 px-5 py-3.5 border-b border-gray-100 font-medium text-sm text-gray-800 flex items-center">
                                          <FileText size={16} className="mr-2 text-gray-400" />
                                          {section.sectionTitle}
                                      </div>
                                      <div className="p-0 bg-white">
                                          {section.type === 'table' && section.columns && section.data ? (
                                              <div className="overflow-x-auto">
                                                  <table className="w-full text-sm text-left">
                                                      <thead className="bg-white text-gray-500 border-b border-gray-100">
                                                          <tr>
                                                              {section.columns.map((col, colIdx) => (
                                                                  <th key={colIdx} className="px-5 py-3 font-medium">{col}</th>
                                                              ))}
                                                          </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-gray-50">
                                                          {section.data.map((row, rowIdx) => (
                                                              <tr key={rowIdx} className="hover:bg-gray-50/30 transition-colors">
                                                                  {row.map((cell, cellIdx) => (
                                                                      <td key={cellIdx} className="px-5 py-4 text-gray-700">{cell}</td>
                                                                  ))}
                                                              </tr>
                                                          ))}
                                                      </tbody>
                                                  </table>
                                              </div>
                                          ) : section.type === 'form' && section.fields ? (
                                              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                  {section.fields.map((field, fieldIdx) => (
                                                      <div key={fieldIdx} className="space-y-2">
                                                          <div className="text-xs font-medium text-gray-500">{field.label}</div>
                                                          <div className="text-sm text-gray-800 bg-gray-50/50 p-3.5 rounded-lg border border-gray-100 min-h-[44px] leading-relaxed">
                                                              {field.value}
                                                          </div>
                                                      </div>
                                                  ))}
                                              </div>
                                          ) : null}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Interview Feedback Records (Timeline) */}
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center space-x-2 mb-8">
                              <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                              <h3 className="font-bold text-gray-900 text-base">面谈反馈记录</h3>
                          </div>
                          <div className="relative pl-6 border-l-2 border-gray-100 space-y-8 ml-2">
                              {MOCK_INTERVIEW_DATA.records.map((record, index) => (
                                  <div key={record.id} className="relative">
                                      {/* Timeline dot */}
                                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                                      
                                      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                          <div className="flex justify-between items-start mb-3">
                                              <div className="flex items-center space-x-3">
                                                  <span className="font-bold text-gray-900 text-sm">{record.action}</span>
                                                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">{record.role}</span>
                                                  <span className="text-sm font-medium text-gray-700">{record.user}</span>
                                              </div>
                                              <div className="text-xs text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded">
                                                  <Clock size={12} className="mr-1.5" />
                                                  {record.time}
                                              </div>
                                          </div>
                                          {record.comment && (
                                              <div className="text-sm text-gray-700 mt-3 bg-gray-50/80 p-3.5 rounded-lg border border-gray-100 leading-relaxed">
                                                  {record.comment}
                                              </div>
                                          )}
                                          {record.signature && (
                                              <div className="mt-4 pt-4 border-t border-gray-100">
                                                  <div className="text-xs text-gray-500 mb-2 flex items-center font-medium">
                                                      <Edit3 size={14} className="mr-1.5 text-gray-400" /> 手写签名
                                                  </div>
                                                  <div className="bg-white border border-gray-200 rounded-lg p-3 inline-block shadow-sm">
                                                      <img src={record.signature} alt="手写签名" className="h-12 object-contain" referrerPolicy="no-referrer" />
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
          )}
      </div>
    </div>
  );
};

export default AssessmentDetailTable;
