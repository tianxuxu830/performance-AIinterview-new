
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, Sparkles, FileText, 
  Info, BookOpen, Video, Send, X, ShieldCheck, 
  AlertTriangle, PenLine, FileSignature, Edit3, ChevronRight, Eraser
} from 'lucide-react';
import { InterviewSession, ShareConfig, Status } from '../types';
import { MOCK_TEMPLATES, MOCK_ASSESSMENT_DETAILS } from '../constants';
import AssessmentDetailTable from './AssessmentDetailTable';

interface InterviewConfirmationViewProps {
  session: InterviewSession;
  onBack: () => void;
  onConfirm: () => void;
}

const InterviewConfirmationView: React.FC<InterviewConfirmationViewProps> = ({ session, onBack, onConfirm }) => {
  // Use session's shareConfig or fallback to defaults
  const config = session.shareConfig || {
    items: { summary: true, form: true, info: false, ref: false, replay: false },
    formPermission: 'read'
  };

  const isDirect = session.method === 'direct';

  const appointmentTabs = [
    { id: 'summary', label: '智能纪要', icon: Sparkles, visible: config.items.summary },
    { id: 'form', label: '绩效面谈表', icon: FileText, visible: config.items.form },
    { id: 'info', label: '个人基本信息', icon: Info, visible: config.items.info },
    { id: 'ref', label: '考核参考资料', icon: BookOpen, visible: config.items.ref },
    { id: 'replay', label: '面谈回放', icon: Video, visible: config.items.replay },
  ].filter(t => t.visible).slice(0, 2);

  const tabs = isDirect 
    ? [
        { id: 'form', label: '面谈反馈表', icon: FileText, visible: true },
        { id: 'details', label: '考核详情页', icon: BookOpen, visible: true },
      ]
    : appointmentTabs;

  const [activeTab, setActiveTab] = useState<string>(() => {
    return tabs[0]?.id || 'form';
  });

  const [employeeFeedback, setEmployeeFeedback] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (showSignatureModal && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [showSignatureModal]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const template = MOCK_TEMPLATES.find(t => t.id === session.templateId) || MOCK_TEMPLATES[0];
  const assessmentDetail = MOCK_ASSESSMENT_DETAILS[session.employeeId] || MOCK_ASSESSMENT_DETAILS['default'];

  const handleConfirmAction = () => {
    setShowSignatureModal(true);
  };

  const handleSignatureSubmit = () => {
    if (!hasSignature) {
      alert('请先完成手写签名');
      return;
    }
    setShowSignatureModal(false);
    onConfirm();
  };

  const handleReject = () => {
    if (!rejectReason) return alert('请输入退回理由');
    alert('任务已退回给面谈官：' + rejectReason);
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 h-16 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{session.period} - 结果确认</h1>
            <p className="text-xs text-gray-500">面谈官：{session.managerName} · 发起日期：{session.date.split(' ')[0]}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsRejecting(true)}
            className="px-4 py-2 text-gray-600 hover:text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
          >
            退回修正
          </button>
          <button 
            onClick={handleConfirmAction}
            className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-600 transition-all flex items-center"
          >
            <CheckCircle2 size={16} className="mr-2" /> 确认结果
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-50/30 p-6">
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-5xl mx-auto w-full">
            {/* Tabs Header */}
            {tabs.length > 0 && (
                <div className="bg-white border-b border-gray-100 px-6 pt-2 shrink-0">
                     <div className="flex space-x-6 overflow-x-auto hide-scrollbar">
                         {tabs.map(tab => (
                             <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center relative whitespace-nowrap px-1 ${
                                    activeTab === tab.id
                                        ? `border-blue-600 text-blue-600 font-bold` 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                }`}
                            >
                                <tab.icon size={16} className={`mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                         ))}
                     </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gray-50/30">
              <div className="max-w-4xl mx-auto w-full">
            {activeTab === 'summary' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mr-3">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">AI 智能面谈纪要</h3>
                  </div>
                  <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed space-y-4">
                    <p>本次绩效面谈于 {session.date} 进行，整体氛围积极建设性。核心讨论点如下：</p>
                    <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-3 flex items-center"><CheckCircle2 size={16} className="mr-2"/> 达成共识事项</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-blue-800/80">
                        <li>确认 Q4 绩效等级为 A，核心项目 A10 表现优异获得认可。</li>
                        <li>针对“跨部门协作”中的认知偏差达成了一致改进方案。</li>
                        <li>下个周期的重点将向“新产品孵化”倾斜，权重调整为 40%。</li>
                      </ul>
                    </div>
                    <div className="bg-orange-50/50 rounded-xl p-5 border border-orange-100">
                      <h4 className="font-bold text-orange-900 mb-3 flex items-center"><PenLine size={16} className="mr-2"/> 后续行动计划</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-orange-800/80">
                        <li>员工：在下周五前输出团队沟通 SOP 初稿。</li>
                        <li>经理：协助协调资源，提供跨部门流程优化的支持。</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'form' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">绩效面谈反馈记录</h3>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold border ${config.formPermission === 'edit' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {config.formPermission === 'edit' ? '允许补充/说明' : '只读视图'}
                  </span>
                </div>
                <div className="space-y-8">
                  {template.sections.map(section => (
                    <div key={section.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center">
                        <div className="w-1.5 h-4 bg-blue-600 rounded-full mr-2"></div>
                        {section.title}
                      </h3>
                      <div className="space-y-5">
                        {section.fields.map(field => (
                          <div key={field.id} className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center justify-between">
                              <span>{field.label}</span>
                            </label>
                            <div className="relative">
                              <textarea
                                value={session.content?.[field.id] || ''}
                                readOnly
                                className="w-full border rounded-xl p-4 text-sm outline-none min-h-[120px] transition-all resize-y leading-relaxed bg-white border-gray-200 text-gray-600"
                                placeholder="[面谈官未填写]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {config.formPermission === 'edit' && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <label className="text-base font-bold text-gray-900 mb-5 flex items-center">
                        <Edit3 size={16} className="mr-2 text-primary" /> 员工个人总结与确认说明
                      </label>
                      <textarea
                        value={employeeFeedback}
                        onChange={(e) => setEmployeeFeedback(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[120px] transition-all bg-gray-50/30 hover:bg-white"
                        placeholder="针对以上面谈结果，如有任何补充说明请在此输入..."
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="h-full">
                <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                    <AssessmentDetailTable detail={assessmentDetail} period={session.period} />
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="p-0 h-full"><div className="bg-white p-8 rounded-2xl border">正在加载员工基本信息...</div></div>
            )}

            {activeTab === 'ref' && (
              <div className="h-full">
                <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                  <AssessmentDetailTable detail={assessmentDetail} period={session.assessmentCycle || '当前周期'} />
                </div>
              </div>
            )}

            {activeTab === 'replay' && (
              <div className="bg-black rounded-2xl aspect-video flex items-center justify-center text-white text-sm font-medium">
                面谈视频回放已就绪，仅限本人查看
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <FileSignature size={20} className="mr-2 text-primary" />
                请完成手写签名
              </h3>
              <button onClick={() => setShowSignatureModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">签署人：{session.employeeName}</span>
                  <button 
                    onClick={clearSignature}
                    className="text-xs text-gray-500 hover:text-gray-800 flex items-center transition-colors"
                  >
                    <Eraser size={14} className="mr-1" /> 清除重签
                  </button>
                </div>
                
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden relative">
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none select-none">
                      <span className="text-lg font-medium tracking-widest">在此处手写签名</span>
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={200}
                    className="w-full h-[200px] cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                
                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 flex items-start space-x-2">
                  <ShieldCheck size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800/80 leading-relaxed">
                    签署即视为本人确认并同意上述绩效面谈结果。系统将记录签署时的 IP 地址与时间戳，法律效力等同于纸质签名。
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowSignatureModal(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">取消</button>
              <button 
                onClick={handleSignatureSubmit}
                disabled={!hasSignature}
                className={`px-8 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${
                  hasSignature 
                    ? 'bg-primary text-white hover:bg-primary-600 shadow-primary/20' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                确认签署并提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4 text-red-600">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold">确定要退回修正吗？</h3>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[100px]"
                placeholder="请输入退回修正的理由..."
              ></textarea>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">退回后，任务状态将变更为“进行中”，面谈官将收到通知进行重新反馈。</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t">
              <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-gray-600 font-medium">取消</button>
              <button onClick={handleReject} className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">确认退回</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewConfirmationView;
