
import React, { useState, useRef, useEffect } from 'react';
import { 
    X, Plus, FileText, Trash2, Edit2, ArrowLeft, 
    Save, Copy, Layout, Square, Columns, 
    MoreHorizontal, Check, AlignLeft, Paperclip, Star, Type,
    Grid, Table, List, Settings, ChevronDown, CheckSquare, GripVertical, Search, Eye,
    FileUp, FileDown, Loader2
} from 'lucide-react';
import { MOCK_TEMPLATES } from '../constants';
import { InterviewTemplate, TemplateField, TemplateSection, FieldType } from '../types';

interface TemplateConfigPageProps {
  onBack: () => void;
}

// Field Library Constants
const FIELD_LIBRARY = [
    { label: '绩效目标', type: 'textarea' as const, placeholder: '请输入目标描述' },
    { label: '完成情况', type: 'textarea' as const, placeholder: '请输入完成情况' },
    { label: '自评分数', type: 'number' as const, placeholder: '0-100' },
    { label: '上级评分', type: 'number' as const, placeholder: '0-100' },
    { label: '权重(%)', type: 'number' as const, placeholder: '0-100' },
    { label: 'KPI指标', type: 'text' as const, placeholder: '请输入指标名称' },
    { label: '改进措施', type: 'textarea' as const, placeholder: '请输入具体措施' },
    { label: '截止时间', type: 'date' as const, placeholder: '选择日期' },
    { label: '附件上传', type: 'attachment' as const, placeholder: '' },
    { label: '通用备注', type: 'textarea' as const, placeholder: '其他补充信息' },
];

const TemplateConfigPage: React.FC<TemplateConfigPageProps> = ({ onBack }) => {
  const [templates, setTemplates] = useState<InterviewTemplate[]>(MOCK_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<InterviewTemplate | null>(null);
  
  // Viewer State
  const [viewingTemplate, setViewingTemplate] = useState<InterviewTemplate | null>(null);

  // Import/Export State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'parsing' | 'success'>('upload');
  const [importProgress, setImportProgress] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // UI State for menus
  const [activeAddSectionId, setActiveAddSectionId] = useState<string | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Multi-select State for Field Library
  const [selectedLibItems, setSelectedLibItems] = useState<Set<number>>(new Set());

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<{sectionId: string, index: number} | null>(null);

  // Close add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setActiveAddSectionId(null);
        setSelectedLibItems(new Set()); // Clear selection on close
      }
    };
    if (activeAddSectionId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeAddSectionId]);


  // --- Actions ---

  const handleCreateNew = () => {
      const newTemplate: InterviewTemplate = {
          id: `temp_${Date.now()}`,
          name: '新面谈模板',
          description: '',
          status: 'active',
          sections: [
              {
                  id: `s_${Date.now()}`,
                  title: '基础信息',
                  viewType: 'form',
                  columns: 1,
                  fields: [
                      { id: `f_${Date.now()}_1`, label: '面谈问题 1', type: 'textarea', required: true, placeholder: '请输入问题描述...', width: 'full' }
                  ]
              }
          ]
      };
      setCurrentTemplate(newTemplate);
      setIsEditing(true);
  };

  const handleEdit = (template: InterviewTemplate) => {
      setCurrentTemplate(JSON.parse(JSON.stringify(template)));
      setIsEditing(true);
  };

  const handleView = (template: InterviewTemplate) => {
      setViewingTemplate(template);
  };

  const handleCloseView = () => {
      setViewingTemplate(null);
  };

  const handleEditFromView = () => {
      if (viewingTemplate) {
          handleEdit(viewingTemplate);
          setViewingTemplate(null);
      }
  };

  const handleDuplicate = (e: React.MouseEvent, template: InterviewTemplate) => {
      e.stopPropagation();
      const newTemplate: InterviewTemplate = {
          ...JSON.parse(JSON.stringify(template)),
          id: `temp_${Date.now()}`,
          name: `${template.name} (副本)`,
          status: 'disabled'
      };
      setTemplates(prev => [...prev, newTemplate]);
  };

  const handleDelete = (id: string) => {
      if (window.confirm('确定要删除这个模板吗？')) {
          setTemplates(prev => prev.filter(t => t.id !== id));
      }
  };

  const handleToggleStatus = (e: React.MouseEvent, template: InterviewTemplate) => {
      e.stopPropagation();
      setTemplates(prev => prev.map(t => 
          t.id === template.id 
          ? { ...t, status: t.status === 'active' ? 'disabled' : 'active' } 
          : t
      ));
  };

  const handleSave = () => {
      if (!currentTemplate) return;
      if (!currentTemplate.name.trim()) {
          alert('请输入模板名称');
          return;
      }
      setTemplates(prev => {
          const exists = prev.some(t => t.id === currentTemplate.id);
          if (exists) {
              return prev.map(t => t.id === currentTemplate.id ? currentTemplate : t);
          } else {
              return [...prev, currentTemplate];
          }
      });
      setIsEditing(false);
      setCurrentTemplate(null);
  };

  const handleCancelEdit = () => {
      setIsEditing(false);
      setCurrentTemplate(null);
  };

  // --- Import / Export Logic ---

  const handleFileDrop = (e: React.DragEvent | React.ChangeEvent) => {
      e.preventDefault();
      // Mock file processing
      setImportStep('parsing');
      let progress = 0;
      const interval = setInterval(() => {
          progress += 10;
          setImportProgress(progress);
          if (progress >= 100) {
              clearInterval(interval);
              setImportStep('success');
          }
      }, 200);
  };

  const confirmImport = () => {
      const newTemplate: InterviewTemplate = {
          id: `temp_import_${Date.now()}`,
          name: '导入: 销售人员年度考核',
          description: '从 "2023销售考核标准.docx" 自动识别导入',
          status: 'active',
          sections: [
              {
                  id: 's_imp_1',
                  title: '销售业绩',
                  viewType: 'table',
                  columns: 1,
                  fields: [
                      { id: 'f_imp_1', label: '销售额', type: 'number', required: true, width: 'one-third' },
                      { id: 'f_imp_2', label: '回款率', type: 'number', required: true, width: 'one-third' },
                      { id: 'f_imp_3', label: '新客户数', type: 'number', required: true, width: 'one-third' },
                  ]
              },
              {
                  id: 's_imp_2',
                  title: '能力评估',
                  viewType: 'form',
                  columns: 2,
                  fields: [
                      { id: 'f_imp_4', label: '沟通能力', type: 'rating', required: true, width: 'half' },
                      { id: 'f_imp_5', label: '抗压能力', type: 'rating', required: true, width: 'half' },
                  ]
              }
          ]
      };
      setTemplates(prev => [newTemplate, ...prev]);
      setIsImportModalOpen(false);
      setImportStep('upload');
      setImportProgress(0);
  };

  const handleExport = (type: 'pdf' | 'word') => {
      setShowExportMenu(false);
      alert(`正在批量导出 ${templates.length} 个模板为 ${type.toUpperCase()} 文件...`);
  };

  // --- Template Editor Logic ---

  const updateTemplateInfo = (key: keyof InterviewTemplate, value: string) => {
      if (!currentTemplate) return;
      setCurrentTemplate({ ...currentTemplate, [key]: value });
  };

  const addSection = () => {
      if (!currentTemplate) return;
      const newSection: TemplateSection = {
          id: `s_${Date.now()}`,
          title: '新模块',
          viewType: 'form',
          columns: 1,
          fields: []
      };
      setCurrentTemplate({
          ...currentTemplate,
          sections: [...currentTemplate.sections, newSection]
      });
  };

  const removeSection = (sectionId: string) => {
      if (!currentTemplate) return;
      setCurrentTemplate({
          ...currentTemplate,
          sections: currentTemplate.sections.filter(s => s.id !== sectionId)
      });
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
       if (!currentTemplate) return;
       setCurrentTemplate({
           ...currentTemplate,
           sections: currentTemplate.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
       });
  };

  const handleSectionLayoutChange = (sectionId: string, cols: 1 | 2 | 3) => {
      if (!currentTemplate) return;
      setCurrentTemplate({
          ...currentTemplate,
          sections: currentTemplate.sections.map(s => 
              s.id === sectionId 
              ? { 
                  ...s, 
                  columns: cols,
                  fields: s.fields.map(f => ({ ...f, width: undefined })) 
                } 
              : s
          )
      });
  };

  const handleDragStart = (e: React.DragEvent, sectionId: string, index: number) => {
      setDraggedItem({ sectionId, index });
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string, targetIndex: number) => {
      e.preventDefault();
      if (!currentTemplate || !draggedItem) return;

      if (draggedItem.sectionId !== targetSectionId) return;

      const sectionIndex = currentTemplate.sections.findIndex(s => s.id === targetSectionId);
      if (sectionIndex === -1) return;

      const newSections = [...currentTemplate.sections];
      const section = { ...newSections[sectionIndex] };
      const newFields = [...section.fields];

      const [movedItem] = newFields.splice(draggedItem.index, 1);
      newFields.splice(targetIndex, 0, movedItem);

      section.fields = newFields;
      newSections[sectionIndex] = section;

      setCurrentTemplate({ ...currentTemplate, sections: newSections });
      setDraggedItem(null);
  };

  const toggleLibItemSelection = (idx: number) => {
      const newSet = new Set(selectedLibItems);
      if (newSet.has(idx)) {
          newSet.delete(idx);
      } else {
          newSet.add(idx);
      }
      setSelectedLibItems(newSet);
  };

  const addSelectedFields = (sectionId: string) => {
       if (!currentTemplate || selectedLibItems.size === 0) return;

       const newFields: TemplateField[] = [];
       selectedLibItems.forEach(idx => {
            const item = FIELD_LIBRARY[idx];
            newFields.push({
                id: `f_${Date.now()}_${idx}`,
                label: item.label,
                type: item.type as any,
                required: false,
                placeholder: item.placeholder,
                width: undefined // Inherit from section
            });
       });

       setCurrentTemplate({
          ...currentTemplate,
          sections: currentTemplate.sections.map(s => 
              s.id === sectionId ? { ...s, fields: [...s.fields, ...newFields] } : s
          )
      });
      setSelectedLibItems(new Set());
      setActiveAddSectionId(null);
  };

  const removeField = (sectionId: string, fieldId: string) => {
      if (!currentTemplate) return;
      setCurrentTemplate({
          ...currentTemplate,
          sections: currentTemplate.sections.map(s => 
              s.id === sectionId ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) } : s
          )
      });
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<TemplateField>) => {
      if (!currentTemplate) return;
      setCurrentTemplate({
          ...currentTemplate,
          sections: currentTemplate.sections.map(s => 
              s.id === sectionId 
              ? { 
                  ...s, 
                  fields: s.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) 
                } 
              : s
          )
      });
  };

  // --- Renderers ---

  const getWidthClass = (section: TemplateSection, field: TemplateField) => {
      if (field.width) {
          switch(field.width) {
              case 'half': return 'w-1/2';
              case 'one-third': return 'w-1/3';
              case 'full': return 'w-full';
              default: return 'w-full';
          }
      }
      if (section.columns === 2) return 'w-1/2';
      if (section.columns === 3) return 'w-1/3';
      return 'w-full';
  };

  const renderFieldPreview = (field: TemplateField) => {
      if (field.type === 'attachment') {
          return (
             <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center bg-gray-50 text-gray-400 h-20">
                 <Paperclip size={18} className="mb-1" />
                 <span className="text-[10px]">附件</span>
             </div>
          );
      } else if (field.type === 'rating') {
          return (
             <div className="flex space-x-1 text-gray-300 py-2">
                 {[1,2,3,4,5].map(i => <Star key={i} size={18} />)}
             </div>
          );
      } else if (field.type === 'date') {
          return (
            <div className="relative">
                <input type="text" disabled className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50" placeholder={field.placeholder || 'YYYY-MM-DD'} />
                <div className="absolute right-3 top-2.5 text-gray-400"><List size={14}/></div>
            </div>
          );
      } else {
          return (
             <input 
                 type="text" 
                 disabled
                 className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 text-gray-500"
                 placeholder={field.placeholder || '在此输入内容...'}
             />
          );
      }
  };

  const renderTemplatePreview = (template: InterviewTemplate) => {
      const isDisabled = template.status === 'disabled';
      return (
          <div className={`w-full h-36 bg-gray-50/50 rounded-lg border border-gray-100 p-3 overflow-hidden flex flex-col gap-3 relative transition-opacity cursor-pointer ${isDisabled ? 'opacity-50 grayscale' : ''}`}>
              {template.sections.slice(0, 3).map((section, idx) => (
                  <div key={idx} className="w-full bg-white border border-gray-200 rounded-md p-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                      {/* Section Title Skeleton */}
                      <div className="w-16 h-1.5 bg-gray-200 rounded mb-2"></div>
                      
                      {section.viewType === 'table' ? (
                          /* Table View Preview */
                          <div className="border border-gray-100 rounded overflow-hidden">
                              <div className="bg-gray-50 h-3 border-b border-gray-100 grid grid-cols-4 gap-px">
                                  {[1,2,3,4].map(i => <div key={i} className="bg-gray-100/50"></div>)}
                              </div>
                              <div className="bg-white h-3 grid grid-cols-4 gap-px">
                                  {[1,2,3,4].map(i => <div key={i}></div>)}
                              </div>
                              <div className="bg-gray-50/30 h-3 grid grid-cols-4 gap-px">
                                  {[1,2,3,4].map(i => <div key={i}></div>)}
                              </div>
                          </div>
                      ) : (
                          /* Form View Preview */
                          <div className="space-y-1.5">
                              {section.fields.slice(0, 2).map((field, i) => (
                                  <div key={i} className="flex flex-col gap-0.5">
                                      <div className="w-8 h-1 bg-gray-100 rounded-sm"></div>
                                      <div className="w-full h-2 bg-gray-50 border border-gray-100 rounded-sm"></div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              ))}
              
              {/* Fade out effect */}
              {template.sections.length > 2 && (
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
              )}
          </div>
      );
  };

  const renderImportModal = () => {
      if (!isImportModalOpen) return null;
      return (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden animate-in zoom-in-95">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900">导入模板</h3>
                      <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  </div>
                  
                  <div className="p-8">
                      {importStep === 'upload' && (
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group"
                            onClick={() => document.getElementById('file-upload')?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                          >
                              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <FileUp size={32} className="text-blue-500" />
                              </div>
                              <h4 className="text-sm font-bold text-gray-800 mb-1">点击或拖拽文件到此处</h4>
                              <p className="text-xs text-gray-500 mb-4">支持 Word, Excel, PDF 文件</p>
                              <input type="file" id="file-upload" className="hidden" onChange={handleFileDrop} />
                              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">选择文件</button>
                          </div>
                      )}

                      {importStep === 'parsing' && (
                          <div className="flex flex-col items-center justify-center py-8">
                              <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                              <h4 className="text-sm font-bold text-gray-800 mb-2">正在 AI 识别字段...</h4>
                              <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600 transition-all duration-200" style={{ width: `${importProgress}%` }}></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">{importProgress}%</p>
                          </div>
                      )}

                      {importStep === 'success' && (
                          <div className="flex flex-col items-center justify-center py-4">
                              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in">
                                  <Check size={32} className="text-green-600" />
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 mb-1">识别成功!</h4>
                              <p className="text-sm text-gray-500 mb-6 text-center">
                                  已成功从文档中识别出 2 个模块，5 个评估字段。
                              </p>
                              <div className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 mb-6 text-left">
                                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">预览结构</div>
                                  <div className="space-y-2">
                                      <div className="flex items-center text-sm text-gray-700"><div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>销售业绩 (3 字段)</div>
                                      <div className="flex items-center text-sm text-gray-700"><div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>能力评估 (2 字段)</div>
                                  </div>
                              </div>
                              <button 
                                onClick={confirmImport}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-all"
                              >
                                  确认导入并创建
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  const renderViewModal = () => {
    if (!viewingTemplate) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm" onClick={handleCloseView}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{viewingTemplate.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{viewingTemplate.description || '无描述'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                         <button 
                            onClick={handleEditFromView}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center"
                        >
                            <Edit2 size={14} className="mr-1.5" /> 编辑配置
                        </button>
                        <button onClick={handleCloseView} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 custom-scrollbar">
                    {viewingTemplate.sections.map((section, idx) => (
                        <div key={section.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-1 h-4 bg-blue-500 rounded-full mr-3"></div>
                                    <h4 className="font-bold text-gray-800 text-sm">{section.title}</h4>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 font-medium">
                                    {section.viewType === 'table' ? '表格视图' : '表单视图'}
                                </span>
                            </div>
                            
                            {section.viewType === 'table' ? (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600">
                                        {section.fields.map((f, i) => (
                                            <div key={f.id} className="col-span-3 p-2.5 border-r border-gray-200 last:border-0 truncate">{f.label}</div>
                                        ))}
                                    </div>
                                    <div className="p-3 text-center text-xs text-gray-400 bg-white italic">
                                        (预览数据行)
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {section.fields.map(f => (
                                        <div key={f.id} className={`${f.width === 'full' ? 'col-span-2' : 'col-span-1'}`}>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center">
                                                {f.label} 
                                                {f.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {f.type === 'attachment' ? (
                                                <div className="border border-dashed border-gray-300 rounded p-2 text-center text-xs text-gray-400 bg-gray-50">
                                                    附件上传区
                                                </div>
                                            ) : (
                                                <div className="h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 flex items-center text-xs text-gray-400">
                                                    {f.placeholder || '输入框'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  const renderEditor = () => {
      if (!currentTemplate) return null;
      return (
        <div className="flex flex-col h-full bg-[#F4F6F9]">
            {/* Top Toolbar */}
            <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center">
                    <button onClick={handleCancelEdit} className="mr-4 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">配置面谈模板</h2>
                        <p className="text-xs text-gray-500 mt-0.5">模块化配置：支持表单与表格两种布局方式</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    className="flex items-center px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-all"
                >
                    <Save size={16} className="mr-2" /> 保存配置
                </button>
            </div>

            {/* WYSIWYG Editor Canvas */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-5xl mx-auto space-y-5 pb-20">
                    
                    {/* 1. Template Header (Compact) */}
                    <div className="bg-white px-6 py-5 rounded-xl shadow-sm border border-gray-200 group relative hover:border-blue-300 transition-colors">
                        <div className="space-y-2">
                            <input 
                                type="text" 
                                className="w-full text-lg font-bold text-gray-900 border-none p-0 focus:ring-0 placeholder-gray-300 bg-transparent"
                                placeholder="请输入模板名称"
                                value={currentTemplate.name}
                                onChange={e => updateTemplateInfo('name', e.target.value)}
                            />
                            <input 
                                type="text"
                                className="w-full text-gray-500 text-xs border-none p-0 focus:ring-0 placeholder-gray-300 bg-transparent"
                                placeholder="请输入模板描述（选填）"
                                value={currentTemplate.description}
                                onChange={e => updateTemplateInfo('description', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 2. Modules Loop */}
                    {currentTemplate.sections.map((section, sIndex) => (
                        <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible transition-shadow hover:shadow-md">
                             {/* Module Header */}
                             <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
                                <div className="flex items-center flex-1">
                                    <div className="w-1 h-3 bg-blue-500 rounded-full mr-3"></div>
                                    <input 
                                        type="text" 
                                        value={section.title}
                                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                        className="font-bold text-gray-800 text-sm bg-transparent border-none focus:ring-0 p-0 hover:bg-white/50 rounded px-1 transition-colors w-48"
                                        placeholder="模块标题"
                                    />
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    {/* View Type Toggle */}
                                    <div className="flex bg-gray-200 rounded-lg p-0.5 text-[10px]">
                                        <button 
                                            onClick={() => updateSection(section.id, { viewType: 'form' })}
                                            className={`flex items-center px-2 py-1 rounded-md transition-all ${section.viewType === 'form' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <Grid size={10} className="mr-1" /> 表单
                                        </button>
                                        <button 
                                            onClick={() => updateSection(section.id, { viewType: 'table' })}
                                            className={`flex items-center px-2 py-1 rounded-md transition-all ${section.viewType === 'table' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <Table size={10} className="mr-1" /> 表格
                                        </button>
                                    </div>

                                    <div className="w-px h-3 bg-gray-300 mx-1"></div>

                                    {/* Column Layout (Form View Only) */}
                                    {section.viewType === 'form' && (
                                        <div className="flex items-center space-x-1">
                                            <span className="text-[10px] text-gray-400 mr-1">布局:</span>
                                            <button onClick={() => handleSectionLayoutChange(section.id, 1)} className={`p-1 rounded ${section.columns === 1 || !section.columns ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`} title="单列"><Square size={12} /></button>
                                            <button onClick={() => handleSectionLayoutChange(section.id, 2)} className={`p-1 rounded ${section.columns === 2 ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`} title="双列"><Columns size={12} /></button>
                                            <button onClick={() => handleSectionLayoutChange(section.id, 3)} className={`p-1 rounded ${section.columns === 3 ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`} title="三列"><Layout size={12} /></button>
                                        </div>
                                    )}

                                    <div className="w-px h-3 bg-gray-300 mx-1"></div>

                                    <button 
                                        onClick={() => removeSection(section.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="删除模块"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                             </div>

                             {/* Module Content */}
                             <div className="p-6">
                                {section.viewType === 'table' ? (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    {section.fields.map((field) => (
                                                        <th key={field.id} className="p-0 border-r border-gray-200 last:border-0 relative group/th">
                                                            <div className="px-3 py-2">
                                                                <input 
                                                                    type="text" 
                                                                    value={field.label}
                                                                    onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                                                                    className="w-full bg-transparent border-none p-0 text-xs font-bold text-gray-700 focus:ring-0 text-center"
                                                                    placeholder="列名"
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => removeField(section.id, field.id)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/th:opacity-100 transition-opacity z-10"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </th>
                                                    ))}
                                                    <th className="w-10 bg-gray-50/50"></th> 
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {section.fields.map((field) => (
                                                        <td key={field.id} className="p-3 border-r border-gray-200 last:border-0 bg-gray-50/10">
                                                            <div className="h-8 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400">
                                                                {field.type}
                                                            </div>
                                                        </td>
                                                    ))}
                                                    <td className="p-2 text-center">
                                                        <div className="relative">
                                                             <button 
                                                                onClick={() => setActiveAddSectionId(activeAddSectionId === section.id ? null : section.id)}
                                                                className="p-1 hover:bg-blue-50 text-blue-500 rounded"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                            
                                                            {/* Inline Add Menu for Table */}
                                                            {activeAddSectionId === section.id && (
                                                                <div ref={addMenuRef} className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-2 text-left">
                                                                     <div className="text-xs font-bold text-gray-400 px-2 py-1 mb-1">选择列字段</div>
                                                                     <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                                                                        {FIELD_LIBRARY.map((item, idx) => (
                                                                            <button 
                                                                                key={idx}
                                                                                onClick={() => {
                                                                                    const newField = {
                                                                                        id: `f_${Date.now()}_${idx}`,
                                                                                        label: item.label,
                                                                                        type: item.type as any,
                                                                                        required: false,
                                                                                        placeholder: item.placeholder,
                                                                                        width: 'full' as const
                                                                                    };
                                                                                    setCurrentTemplate({
                                                                                        ...currentTemplate,
                                                                                        sections: currentTemplate.sections.map(s => s.id === section.id ? { ...s, fields: [...s.fields, newField] } : s)
                                                                                    });
                                                                                    setActiveAddSectionId(null);
                                                                                }}
                                                                                className="flex items-center px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded text-left w-full"
                                                                            >
                                                                                <Plus size={10} className="mr-2" />
                                                                                {item.label}
                                                                            </button>
                                                                        ))}
                                                                     </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        {section.fields.length === 0 && (
                                            <div className="p-4 text-center text-xs text-gray-400">
                                                暂无列，请点击右侧“+”添加
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // FORM VIEW RENDER (With DnD)
                                    <div className="flex flex-wrap -mx-3">
                                        {section.fields.map((field, fieldIndex) => (
                                            <div 
                                                key={field.id} 
                                                className={`${getWidthClass(section, field)} px-3 mb-6 relative group/field transition-all duration-200 ${draggedItem?.sectionId === section.id && draggedItem?.index === fieldIndex ? 'opacity-30' : 'opacity-100'}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, section.id, fieldIndex)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, section.id, fieldIndex)}
                                            >
                                                
                                                {/* Field Hover Toolbar */}
                                                <div className="absolute right-4 -top-3 z-20 hidden group-hover/field:flex items-center bg-gray-800 text-white rounded-md shadow-lg py-1 px-1.5 gap-1 transform transition-all text-[10px]">
                                                    <div className="cursor-move mr-1 p-0.5 hover:bg-gray-600 rounded" title="拖拽排序">
                                                        <GripVertical size={10} />
                                                    </div>
                                                    <div className="w-px h-3 bg-gray-600 mx-1"></div>
                                                    <button onClick={() => updateField(section.id, field.id, { required: !field.required })} className={`flex items-center px-1.5 py-0.5 rounded hover:bg-gray-600 ${field.required ? 'text-red-400' : ''}`}>
                                                        {field.required ? '必填' : '选填'}
                                                    </button>
                                                    <div className="w-px h-3 bg-gray-600 mx-1"></div>
                                                    <button onClick={() => removeField(section.id, field.id)} className="p-1 hover:bg-red-600 rounded"><Trash2 size={10} /></button>
                                                </div>

                                                {/* Field Preview */}
                                                <div className="p-3 border border-transparent rounded-lg group-hover/field:border-blue-300 group-hover/field:bg-blue-50/10 transition-all relative dashed-border-on-hover cursor-default">
                                                    <div className="mb-2 flex items-center">
                                                        <GripVertical size={14} className="mr-2 text-gray-300 cursor-move opacity-0 group-hover/field:opacity-100" />
                                                        <input 
                                                            type="text" 
                                                            value={field.label}
                                                            onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                                                            className="block w-full text-sm font-bold text-gray-700 border-none p-0 focus:ring-0 bg-transparent"
                                                        />
                                                        {field.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                                                    </div>
                                                    {renderFieldPreview(field)}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Field Button (Multi-Select Dropdown) */}
                                        <div className="w-full px-3 relative">
                                            <button 
                                                onClick={() => setActiveAddSectionId(activeAddSectionId === section.id ? null : section.id)}
                                                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center font-medium"
                                            >
                                                <Plus size={16} className="mr-1.5" /> 添加字段
                                            </button>

                                            {/* Field Library Dropdown */}
                                            {activeAddSectionId === section.id && (
                                                <div ref={addMenuRef} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-80">
                                                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-50 mb-1 shrink-0">
                                                        <span className="text-xs font-bold text-gray-500">从字段库选择</span>
                                                        <span className="text-[10px] text-blue-500">已选: {selectedLibItems.size}</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-0.5 overflow-y-auto custom-scrollbar p-1">
                                                        {FIELD_LIBRARY.map((item, idx) => {
                                                            const isSelected = selectedLibItems.has(idx);
                                                            return (
                                                                <button 
                                                                    key={idx}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleLibItemSelection(idx);
                                                                    }}
                                                                    className={`flex items-center px-2 py-2 text-xs rounded text-left transition-colors w-full group/item ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                                >
                                                                    <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white group-hover/item:border-blue-300'}`}>
                                                                        {isSelected && <Check size={10} />}
                                                                    </div>
                                                                    <span className="flex-1">{item.label}</span>
                                                                    <span className="text-[10px] text-gray-300 ml-2">{item.type}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="pt-2 mt-1 border-t border-gray-100 px-1 shrink-0">
                                                        <button 
                                                            onClick={() => addSelectedFields(section.id)}
                                                            disabled={selectedLibItems.size === 0}
                                                            className="w-full py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            确认添加 ({selectedLibItems.size})
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    ))}
                    
                    {/* Add Module Button */}
                    <div className="flex justify-center pt-4">
                         <button 
                            onClick={addSection}
                            className="flex items-center px-6 py-3 bg-white border border-gray-300 shadow-sm text-gray-700 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all font-medium"
                        >
                            <Plus size={18} className="mr-2" /> 添加模块 (Module)
                        </button>
                    </div>

                </div>
            </div>
        </div>
      );
  };

  const filteredTemplates = templates.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderList = () => (
    <div className="flex flex-col h-full bg-white">
        {/* List Header */}
        <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-white shrink-0 sticky top-0 z-20">
            <div className="flex items-center">
                 <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">绩效面谈模板配置</h2>
            </div>
            <div className="flex items-center space-x-2">
                 <div className="relative">
                    <input 
                        type="text" 
                        placeholder="搜索模板..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                    />
                    <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                 </div>
            </div>
        </div>

        {/* List Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
          <div className="mb-8 flex justify-between items-center bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
              <div>
                  <h3 className="text-base font-bold text-blue-900">模板管理</h3>
                  <p className="text-sm text-blue-700 mt-1">为不同的考核周期定义标准问题集，统一面谈标准。</p>
              </div>
              <div className="flex space-x-3">
                  {/* Export Group */}
                  <div className="relative">
                      <button 
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="flex items-center px-4 py-2.5 bg-white text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50 transition-all shadow-sm"
                      >
                          <FileDown size={18} className="mr-2" /> 导出
                          <ChevronDown size={14} className="ml-1 opacity-50" />
                      </button>
                      {showExportMenu && (
                          <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
                          <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 animate-in fade-in zoom-in-95">
                              <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                                  <FileText size={14} className="mr-2 text-red-500" /> PDF 文档
                              </button>
                              <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                                  <FileText size={14} className="mr-2 text-blue-500" /> Word 文档
                              </button>
                          </div>
                          </>
                      )}
                  </div>

                  {/* Import Button */}
                  <button 
                    onClick={() => {
                        setImportStep('upload');
                        setIsImportModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2.5 bg-white text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50 transition-all shadow-sm"
                  >
                      <FileUp size={18} className="mr-2" /> 导入
                  </button>

                  {/* New Template Button */}
                  <button 
                    onClick={handleCreateNew}
                    className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center shadow-sm shadow-blue-200 transition-all"
                  >
                      <Plus size={18} className="mr-2" /> 新建模板
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div 
                key={template.id} 
                onClick={() => handleView(template)}
                className={`group bg-white border rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all relative flex flex-col h-full cursor-pointer ${template.status === 'disabled' ? 'border-gray-200 opacity-90' : 'border-gray-200'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 border ${template.status === 'disabled' ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className={`font-bold text-base transition-colors line-clamp-1 ${template.status === 'disabled' ? 'text-gray-500' : 'text-gray-800 group-hover:text-blue-600'}`}>{template.name}</h3>
                            {template.status === 'disabled' && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">已禁用</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{template.sections.length} 个模块 • {template.sections.reduce((acc, s) => acc + s.fields.length, 0)} 个字段</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-4 leading-relaxed line-clamp-2 min-h-[40px]">{template.description || '暂无描述'}</p>
                
                {/* CSS Preview Area */}
                <div className="mb-4">
                    {renderTemplatePreview(template)}
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    {/* Status Toggle Switch */}
                    <button 
                        onClick={(e) => handleToggleStatus(e, template)} 
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${template.status !== 'disabled' ? 'bg-green-500' : 'bg-gray-300'}`}
                        title={template.status !== 'disabled' ? '点击禁用' : '点击启用'}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${template.status !== 'disabled' ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>

                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="编辑"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button 
                            onClick={(e) => handleDuplicate(e, template)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="复制模板"
                        >
                            <Copy size={16} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
              </div>
            ))}
            
            {/* Create New Card (Placeholder style) */}
             <button 
                onClick={handleCreateNew}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-[380px]"
            >
                <Plus size={48} className="mb-4 opacity-50" />
                <span className="font-medium">新建模板</span>
            </button>
          </div>
        </div>
        
        {/* View Details Modal */}
        {renderViewModal()}
        {/* Import Modal */}
        {renderImportModal()}
    </div>
  );

  return (
      <div className="w-full h-full">
          {isEditing ? renderEditor() : renderList()}
      </div>
  );
};

export default TemplateConfigPage;
