import React, { useState, useRef } from 'react';
import { ChevronLeft, Send, CheckCircle2, Edit3, X, Minus, Info, AlertTriangle } from 'lucide-react';
import { InterviewSession, ActivityLogEntry } from '../types';
import { MOCK_TEMPLATES, MOCK_ASSESSMENT_DETAILS } from '../constants';
import FeedbackFormMobile from './FeedbackFormMobile';
import PerformanceAnalysisSummary from './PerformanceAnalysisSummary';
import AssessmentDetailMobile from './AssessmentDetailMobile';
import MobileEmployeeCard from './MobileEmployeeCard';
import ActivityLog from './ActivityLog';

interface InterviewDetailMobileProps {
  session: InterviewSession;
  mode: 'feedback' | 'prepare' | 'confirm';
  onBack: () => void;
  onReject?: (reason: string) => void;
  onSubmit?: () => void;
}

const InterviewDetailMobile: React.FC<InterviewDetailMobileProps> = ({
  session,
  mode,
  onBack,
  onReject,
  onSubmit
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'analysis' | 'detail' | 'logs'>('form');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  
  // Feedback Form State
  const [feedbackFormValues, setFeedbackFormValues] = useState<Record<string, string>>(session.content || {});
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);
  const [hasGeneratedAI, setHasGeneratedAI] = useState(false);

  React.useEffect(() => {
    setFeedbackFormValues(session.content || {});
  }, [session]);

  // Signature Modal State
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reject Modal State
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Submit Confirmation Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitPermission, setSubmitPermission] = useState<'read' | 'edit'>('read');

  const template = MOCK_TEMPLATES.find(t => t.id === session.templateId) || MOCK_TEMPLATES[0];
  const assessmentDetail = MOCK_ASSESSMENT_DETAILS[session.employeeId] || MOCK_ASSESSMENT_DETAILS['default'];

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleGlobalAIGenerate = async () => {
    setIsGeneratingAI('global');
    
    const mockResponses: Record<string, any> = {
        'summary': "基于该员工本周期的表现，整体业绩达成率较高，但在跨部门协作方面仍有提升空间。建议后续加强与产品团队的沟通频次，确保需求理解的一致性。同时，在项目管理方面表现出色，能够有效把控进度风险。",
        'achievements': "1. 成功主导了 Q4 核心版本的发布，上线后用户活跃度提升 15%。\n2. 优化了前端构建流程，打包速度提升 40%。\n3. 输出了 3 篇高质量的技术分享文档，帮助团队成员快速成长。",
        'improvements': "1. 跨部门沟通时需更加主动，避免信息滞后。\n2. 代码注释规范性有待加强，建议遵循团队最新规范。\n3. 对新技术的探索深度不够，建议投入更多时间进行技术预研。",
        'plan': "1. 制定详细的 Q1 个人成长计划，重点攻克 Serverless 架构落地。\n2. 每周组织一次代码走查，提升代码质量。\n3. 参与开源社区贡献，提升个人及团队影响力。",
        'date': new Date().toISOString().split('T')[0],
        'select': '正式绩效',
        'number': '92',
        'graph': { radar: [80, 90, 85, 70, 95] },
        'attachment': [{ name: 'Q4述职报告.pdf', size: '2.4MB' }]
    };

    const targets: {id: string, type: string, value: any}[] = [];
    template.sections.forEach(section => {
        section.fields.forEach(field => {
            let value: any = "";
            if (field.type === 'textarea' || field.type === 'text') {
                if (field.id.includes('summary')) value = mockResponses['summary'];
                else if (field.id.includes('achievement')) value = mockResponses['achievements'];
                else if (field.id.includes('improvement')) value = mockResponses['improvements'];
                else if (field.id.includes('plan')) value = mockResponses['plan'];
                else if (field.label.includes('行动')) value = "完成系统架构重构";
                else value = mockResponses['summary'];
            } else if (field.type === 'date') {
                value = mockResponses['date'];
            } else if (field.type === 'select') {
                value = field.options ? field.options[0] : '选项1';
            } else if (field.type === 'number') {
                value = '95';
            } else if (field.type === 'graph') {
                value = mockResponses['graph'];
            } else if (field.type === 'attachment') {
                value = mockResponses['attachment'];
            }
            targets.push({ id: field.id, type: field.type, value });
        });
    });

    for (const target of targets) {
        if (target.type === 'textarea' || target.type === 'text') {
            await new Promise<void>(resolve => {
                let currentText = "";
                const interval = setInterval(() => {
                    if (currentText.length < target.value.length) {
                        const charsToAdd = Math.floor(Math.random() * 4) + 2;
                        currentText = target.value.substring(0, currentText.length + charsToAdd);
                        setFeedbackFormValues(prev => ({ ...prev, [target.id]: currentText }));
                    } else {
                        clearInterval(interval);
                        resolve();
                    }
                }, 10);
            });
        } else {
            await new Promise(resolve => setTimeout(resolve, 400));
            setFeedbackFormValues(prev => ({ ...prev, [target.id]: target.value }));
        }
    }

    setIsGeneratingAI(null);
    setHasGeneratedAI(true);
  };

  const isReadOnly = mode === 'prepare' || mode === 'confirm';
  const pageTitle = mode === 'feedback' ? '面谈反馈' : (mode === 'prepare' ? '面谈准备' : '确认结果');
  const statusLabel = mode === 'feedback' ? '正在反馈' : '待确认';

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 relative z-20">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm shrink-0 z-10 border-b border-gray-100">
        <ChevronLeft size={24} className="text-gray-600 cursor-pointer mr-2" onClick={onBack} />
        <span className="text-base font-bold text-gray-800">{pageTitle}</span>
      </div>

      {/* Employee Info Card - Collapsible */}
      <div className={`bg-white px-4 shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isHeaderCollapsed ? 'pt-2 pb-0 h-14' : 'pt-4 pb-2 h-auto'}`}>
        <MobileEmployeeCard session={session} statusLabel={statusLabel} isCollapsed={isHeaderCollapsed} />
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 border-b border-gray-100 flex space-x-6 sticky top-0 z-10 shadow-sm overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveTab('form')}
          className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'form' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          绩效反馈表
        </button>
        {mode !== 'confirm' && (
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'analysis' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            考核总结分析
          </button>
        )}
        <button 
          onClick={() => setActiveTab('detail')}
          className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'detail' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          考核表明细
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          活动日志
        </button>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24"
        onScroll={(e) => setIsHeaderCollapsed(e.currentTarget.scrollTop > 20)}
      >
        {session.rejectReason && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start">
              <AlertTriangle size={20} className="text-orange-500 mr-3 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-orange-800 mb-1">申请重新沟通</h4>
                <p className="text-xs text-orange-700 leading-relaxed">
                  <span className="font-bold">原因：</span>{session.rejectReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <FeedbackFormMobile 
            template={template}
            feedbackFormValues={feedbackFormValues}
            setFeedbackFormValues={setFeedbackFormValues}
            isGeneratingAI={isGeneratingAI}
            hasGeneratedAI={hasGeneratedAI}
            handleGlobalAIGenerate={handleGlobalAIGenerate}
            readOnly={isReadOnly}
          />
        )}

        {activeTab === 'analysis' && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <PerformanceAnalysisSummary assessmentDetail={assessmentDetail} />
          </div>
        )}

        {activeTab === 'detail' && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <AssessmentDetailMobile />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 p-4 bg-white min-h-full">
            <ActivityLog logs={session.activityLogs || []} hideHeader={true} />
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        {mode === 'feedback' ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[10px] text-gray-400">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
              自动保存 {currentTime}
            </div>
            <button 
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center"
            >
              <Send size={16} className="mr-2" /> 发送给员工确认
            </button>
          </div>
        ) : mode === 'prepare' ? (
          <button 
            onClick={onSubmit}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-sm shadow-blue-200"
          >
            <CheckCircle2 size={18} className="mr-2" /> 确认面谈结果
          </button>
        ) : mode === 'confirm' ? (
          <div className="flex space-x-3 w-full">
            <button 
              onClick={() => setIsRejecting(true)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold active:scale-95 transition-transform bg-white shadow-sm"
            >
              需要重新沟通
            </button>
            <button 
              onClick={() => setIsSignatureModalOpen(true)}
              className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-sm shadow-blue-200"
            >
              <CheckCircle2 size={18} className="mr-2" /> 确认结果
            </button>
          </div>
        ) : null}
      </div>

      {/* Signature Drawer */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh]">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center text-lg">
                <Edit3 size={20} className="mr-2 text-blue-600" />
                手写签名确认
              </h3>
              <button onClick={() => setIsSignatureModalOpen(false)} className="text-gray-400 p-2 active:scale-90 transition-transform">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-700">签署人：{session.employeeName}</span>
                <button 
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      ctx?.clearRect(0, 0, canvas.width, canvas.height);
                      setHasSignature(false);
                    }
                  }}
                  className="text-sm text-blue-600 font-medium flex items-center active:opacity-70"
                >
                  <Minus size={14} className="mr-1" /> 清除重签
                </button>
              </div>
              
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden relative h-48 shrink-0">
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none select-none">
                    <span className="text-base font-medium tracking-widest">在此处手写签名</span>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="w-full h-full cursor-crosshair touch-none"
                  onMouseDown={(e) => {
                    setIsDrawing(true);
                    const ctx = canvasRef.current?.getContext('2d');
                    if (ctx && canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      ctx.beginPath();
                      ctx.lineWidth = 3;
                      ctx.lineCap = 'round';
                      ctx.strokeStyle = '#1a1a1a';
                      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!isDrawing) return;
                    const ctx = canvasRef.current?.getContext('2d');
                    if (ctx && canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                      ctx.stroke();
                      setHasSignature(true);
                    }
                  }}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  onTouchStart={(e) => {
                    setIsDrawing(true);
                    const ctx = canvasRef.current?.getContext('2d');
                    if (ctx && canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      const touch = e.touches[0];
                      ctx.beginPath();
                      ctx.lineWidth = 3;
                      ctx.lineCap = 'round';
                      ctx.strokeStyle = '#1a1a1a';
                      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
                    }
                  }}
                  onTouchMove={(e) => {
                    if (!isDrawing) return;
                    const ctx = canvasRef.current?.getContext('2d');
                    if (ctx && canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      const touch = e.touches[0];
                      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
                      ctx.stroke();
                      setHasSignature(true);
                    }
                  }}
                  onTouchEnd={() => setIsDrawing(false)}
                />
              </div>
              
              <div className="mt-6 bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-start">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5 mr-3" />
                <p className="text-xs text-blue-800/80 leading-relaxed">
                  签署即视为本人确认并同意上述绩效面谈结果。法律效力等同于纸质签名。
                </p>
              </div>
            </div>

            <div className="px-6 py-6 border-t border-gray-100 flex space-x-4 bg-white pb-10">
              <button 
                onClick={() => setIsSignatureModalOpen(false)}
                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-2xl text-base font-bold active:scale-95 transition-transform"
              >
                取消
              </button>
              <button 
                disabled={!hasSignature}
                onClick={() => {
                  setIsSignatureModalOpen(false);
                  alert("签名已提交，面谈完成！");
                  if (onSubmit) onSubmit();
                }}
                className={`flex-1 py-3.5 rounded-2xl text-base font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center ${
                  hasSignature ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                确认结果
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Drawer */}
      {isRejecting && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh]">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <AlertTriangle size={20} className="mr-2 text-orange-500" />
                重新沟通
              </h3>
              <button onClick={() => setIsRejecting(false)} className="text-gray-400 p-2 active:scale-90 transition-transform"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center space-x-3 mb-6 text-orange-600 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <AlertTriangle size={24} className="shrink-0" />
                <p className="text-sm font-medium leading-relaxed">确定要退回给面谈官重新沟通吗？请填写具体原因。</p>
              </div>
              <textarea 
                className="w-full border border-gray-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none min-h-[160px] transition-all bg-gray-50/30 hover:bg-white resize-none"
                placeholder="请输入具体的修改意见或沟通需求..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>
            </div>

            <div className="px-6 py-6 border-t border-gray-100 flex space-x-4 bg-white pb-10">
              <button 
                onClick={() => setIsRejecting(false)} 
                className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-base font-bold text-gray-500 active:scale-95 transition-transform"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  if (!rejectReason) return alert('请输入原因');
                  alert('已提交重新沟通申请');
                  setIsRejecting(false);
                  if (onReject) onReject(rejectReason);
                }} 
                className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-base font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Drawer */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh]">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Send size={20} className="mr-2 text-blue-600" />
                发送确认
              </h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-gray-400 p-2 active:scale-90 transition-transform"><X size={24} /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">发送给员工确认</h3>
              <p className="text-sm text-gray-500 text-center mb-8 px-4">
                即将把绩效面谈结果发送给 <span className="font-bold text-gray-800">{session.employeeName}</span>。请选择员工的权限：
              </p>
              
              <div className="space-y-4">
                <div 
                  onClick={() => setSubmitPermission('read')}
                  className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all ${submitPermission === 'read' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${submitPermission === 'read' ? 'border-blue-600' : 'border-gray-300'}`}>
                        {submitPermission === 'read' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                      </div>
                      <span className={`text-base font-bold ${submitPermission === 'read' ? 'text-blue-900' : 'text-gray-700'}`}>仅阅读和确认</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-8 leading-relaxed">员工只能查看内容并手写签名确认，无法修改任何字段。</p>
                  </div>
                </div>
                
                <div 
                  onClick={() => setSubmitPermission('edit')}
                  className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all ${submitPermission === 'edit' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${submitPermission === 'edit' ? 'border-blue-600' : 'border-gray-300'}`}>
                        {submitPermission === 'edit' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                      </div>
                      <span className={`text-base font-bold ${submitPermission === 'edit' ? 'text-blue-900' : 'text-gray-700'}`}>允许修改并确认</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-8 leading-relaxed">员工可以补充或修改内容，修改后需双方再次确认。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 border-t border-gray-100 flex space-x-4 bg-white pb-10">
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-2xl text-base font-bold active:scale-95 transition-transform"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  alert(`已发送给 ${session.employeeName} 确认 (权限: ${submitPermission === 'read' ? '仅阅读' : '可修改'})`);
                  if (onSubmit) onSubmit();
                }}
                className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-base font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
              >
                确认发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewDetailMobile;
