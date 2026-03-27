import React from 'react';
import { Sparkles, RotateCw, Plus, Star, Calendar, ChevronDown } from 'lucide-react';

interface FeedbackFormMobileProps {
  template: any;
  feedbackFormValues: Record<string, string>;
  setFeedbackFormValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isGeneratingAI: string | null;
  hasGeneratedAI: boolean;
  handleGlobalAIGenerate: () => void;
  readOnly?: boolean;
}

const FeedbackFormMobile: React.FC<FeedbackFormMobileProps> = ({
  template,
  feedbackFormValues,
  setFeedbackFormValues,
  isGeneratingAI,
  hasGeneratedAI,
  handleGlobalAIGenerate,
  readOnly = false
}) => {
  return (
    <div className="space-y-4 pb-4 animate-in fade-in">
      {/* Global AI Generate Button - Compact Version */}
      {!readOnly && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-3 py-2 rounded-lg border border-purple-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <Sparkles size={14} className="text-purple-600 mr-2" />
            <span className="text-xs font-bold text-purple-900">AI 智能辅助填写</span>
            <span className="text-[10px] text-purple-400 ml-2 scale-90 origin-left">基于员工表现自动生成</span>
          </div>
          <button 
            onClick={handleGlobalAIGenerate}
            disabled={isGeneratingAI === 'global'}
            className="px-2.5 py-1 bg-white text-purple-600 text-[10px] font-bold rounded-md border border-purple-100 shadow-sm active:scale-95 transition-transform flex items-center"
          >
            {isGeneratingAI === 'global' ? (
              <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-purple-600 mr-1"></div>
            ) : (
              hasGeneratedAI ? <RotateCw size={10} className="mr-1" /> : <Sparkles size={10} className="mr-1" />
            )}
            {isGeneratingAI === 'global' ? '生成中...' : (hasGeneratedAI ? '重新生成' : '一键生成')}
          </button>
        </div>
      )}

      {template.sections.map((section: any) => (
        <div key={section.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-3">
            <div className="w-1 h-3 bg-blue-500 rounded-full mr-2"></div>
            <h4 className="font-bold text-sm text-gray-800">{section.title}</h4>
          </div>
          
          {section.viewType === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {section.fields.map((field: any) => (
                      <th key={field.id} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    {section.fields.map((field: any) => (
                      <td key={field.id} className="px-3 py-2 whitespace-nowrap min-w-[120px]">
                        {field.type === 'text' ? (
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder={field.placeholder}
                            value={feedbackFormValues[field.id] || ''}
                            onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                            disabled={readOnly}
                          />
                        ) : field.type === 'date' ? (
                          <input 
                            type="date" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                            value={feedbackFormValues[field.id] || ''}
                            onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                            disabled={readOnly}
                          />
                        ) : field.type === 'select' ? (
                          <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none disabled:bg-gray-100 disabled:text-gray-500"
                            value={feedbackFormValues[field.id] || ''}
                            onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                            disabled={readOnly}
                          >
                            <option value="">请选择</option>
                            {field.options?.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-xs text-gray-400">不支持的类型</div>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              {!readOnly && (
                <button className="mt-2 text-xs text-blue-600 flex items-center font-medium px-1 py-1 hover:bg-blue-50 rounded">
                  <Plus size={12} className="mr-1" /> 添加行
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {section.fields.map((field: any) => (
                <div key={field.id}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-500">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                  </div>
                  {field.type === 'textarea' ? (
                    <textarea 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors h-24 resize-none disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder={field.placeholder || "请输入..."}
                      value={feedbackFormValues[field.id] || ''}
                      onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                      disabled={readOnly}
                    ></textarea>
                  ) : field.type === 'rating' ? (
                    <div className="flex space-x-2">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={24} className={`text-gray-300 ${!readOnly && 'hover:text-yellow-400 cursor-pointer'} fill-gray-100`} />
                      ))}
                    </div>
                  ) : field.type === 'date' ? (
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none disabled:bg-gray-100 disabled:text-gray-500"
                        value={feedbackFormValues[field.id] || ''}
                        onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                        disabled={readOnly}
                      />
                      <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  ) : field.type === 'select' ? (
                    <div className="relative">
                      <select 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors appearance-none disabled:bg-gray-100 disabled:text-gray-500"
                        value={feedbackFormValues[field.id] || ''}
                        onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                        disabled={readOnly}
                      >
                        <option value="">{field.placeholder || "请选择"}</option>
                        {field.options?.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  ) : field.type === 'number' ? (
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder={field.placeholder}
                      value={feedbackFormValues[field.id] || ''}
                      onChange={(e) => setFeedbackFormValues({...feedbackFormValues, [field.id]: e.target.value})}
                      disabled={readOnly}
                    />
                  ) : field.type === 'graph' ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center h-40">
                      <div className="text-center">
                        <div className="w-20 h-20 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin mx-auto mb-2"></div>
                        <span className="text-xs text-gray-500">雷达图生成中...</span>
                      </div>
                    </div>
                  ) : field.type === 'attachment' ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-xs text-gray-500 mb-2">支持 PDF, Word, Excel, 图片格式</div>
                      {!readOnly && (
                        <button className="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50">
                          点击上传
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FeedbackFormMobile;
