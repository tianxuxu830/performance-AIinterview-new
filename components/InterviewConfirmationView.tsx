
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, Sparkles, FileText, 
  Info, BookOpen, Video, Send, X, ShieldCheck, 
  AlertTriangle, PenLine, FileSignature, Edit3, ChevronRight, Eraser,
  Clock
} from 'lucide-react';
import { InterviewSession, ShareConfig, Status } from '../types';
import { MOCK_TEMPLATES, MOCK_ASSESSMENT_DETAILS } from '../constants';
import AssessmentDetailTable from './AssessmentDetailTable';
import ActivityLog from './ActivityLog';

interface InterviewConfirmationViewProps {
  session: InterviewSession;
  onBack: () => void;
  onConfirm: (feedback?: string) => void;
  onReject: (reason: string) => void;
}

const InterviewConfirmationView: React.FC<InterviewConfirmationViewProps> = ({ session, onBack, onConfirm, onReject }) => {
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
    onConfirm(employeeFeedback);
  };

  const handleReject = () => {
    if (!rejectReason) return alert('请输入申请重新沟通的理由');
    onReject(rejectReason);
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
            返回重新沟通
          </button>
          <button 
            onClick={handleConfirmAction}
            className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-600 transition-all flex items-center"
          >
            <CheckCircle2 size={16} className="mr-2" /> 确认结果
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-50/30 p-6 gap-6">
        {/* Left Column: Assessment Details */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center">
                    <BookOpen size={18} className="text-blue-600 mr-2" />
                    <h3 className="font-bold text-gray-900">考核详情与参考资料</h3>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    周期：{session.assessmentCycle || '当前周期'}
                </span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                <AssessmentDetailTable detail={assessmentDetail} period={session.period} />
            </div>
        </div>

        {/* Right Column: Feedback & Summary */}
        <div className="flex-[1.2] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center">
                    <FileText size={18} className="text-blue-600 mr-2" />
                    <h3 className="font-bold text-gray-900">面谈反馈与共识</h3>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${config.formPermission === 'edit' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {config.formPermission === 'edit' ? '允许补充说明' : '只读视图'}
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-gray-50/10">
                {/* Feedback Form Sections */}
                <div className="space-y-6">
                    {template.sections.map(section => (
                        <div key={section.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                <div className="w-1 h-3 bg-blue-600 rounded-full mr-2"></div>
                                {section.title}
                            </h3>
                            <div className="space-y-4">
                                {section.fields.map(field => (
                                    <div key={field.id}>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">{field.label}</label>
                                        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 border border-gray-100 min-h-[60px] leading-relaxed">
                                            {session.content?.[field.id] || <span className="text-gray-300 italic">未填写</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Employee Feedback Input */}
                    {config.formPermission === 'edit' && (
                        <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm bg-blue-50/5">
                            <label className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                <Edit3 size={16} className="mr-2 text-primary" /> 员工个人总结与确认说明
                            </label>
                            <textarea
                                value={employeeFeedback}
                                onChange={(e) => setEmployeeFeedback(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[120px] transition-all bg-white hover:border-gray-300"
                                placeholder="针对以上面谈结果，如有任何补充说明请在此输入..."
                            ></textarea>
                        </div>
                    )}
                </div>

                {/* Activity Log Section */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                        <Clock size={16} className="text-gray-400 mr-2" />
                        调整记录与活动日志
                    </h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <ActivityLog logs={session.activityLogs || []} hideHeader={true} />
                    </div>
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
                <h3 className="text-lg font-bold">确定要申请重新沟通吗？</h3>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[100px]"
                placeholder="请输入申请重新沟通的理由..."
              ></textarea>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">申请后，任务状态将变更为“进行中”，面谈官将收到通知进行重新沟通。</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t">
              <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-gray-600 font-medium">取消</button>
              <button onClick={handleReject} className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">确认申请</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewConfirmationView;
