import React, { useState } from 'react';
import { X, Filter, Info, ChevronLeft, ChevronRight, Globe, HelpCircle } from 'lucide-react';
import { ChangeLogRecord } from '../types';

interface ChangeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ChangeLogRecord[];
  title?: string;
  breadcrumb?: string;
}

const ChangeLogModal: React.FC<ChangeLogModalProps> = ({ 
  isOpen, 
  onClose, 
  logs,
  title = "变更记录",
  breadcrumb = "绩效面谈 / 操作日志"
}) => {
  const [showAlert, setShowAlert] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Breadcrumb / Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 mr-2 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-gray-500">{breadcrumb}</span>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
          {/* Title and Filter */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">{title}({logs.length})</h2>
            <button className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter size={16} />
            </button>
          </div>
          
          {/* Alert */}
          {showAlert && (
            <div className="mx-6 mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-md flex justify-between items-start text-sm text-gray-700">
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <Info size={12} />
                </div>
                <span>
                  默认查询近60天内的操作记录，可调整筛选条件查询近3年内的操作记录，支持一次性查询180天区间内的操作记录。
                  <button className="text-blue-600 hover:text-blue-800 ml-2">不再显示</button>
                </span>
              </div>
              <button onClick={() => setShowAlert(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto mt-4">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 border-b border-gray-200 font-medium text-gray-900 whitespace-nowrap">操作时间</th>
                  <th className="p-4 border-b border-gray-200 font-medium text-gray-900 whitespace-nowrap">操作人</th>
                  <th className="p-4 border-b border-gray-200 font-medium text-gray-900 whitespace-nowrap">操作模块</th>
                  <th className="p-4 border-b border-gray-200 font-medium text-gray-900 whitespace-nowrap">操作类型</th>
                  <th className="p-4 border-b border-gray-200 font-medium text-gray-900">操作内容</th>
                  <th className="p-4 border-b border-gray-200 font-medium text-gray-900 whitespace-nowrap">操作结果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 text-gray-600 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{log.operator}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{log.module || '-'}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{log.operationType}</td>
                    <td className="p-4 text-gray-600 max-w-xl">{log.content}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{log.result || '成功'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      暂无变更记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-2 bg-white">
            <button className="p-1 border border-gray-300 rounded text-gray-400 hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded border border-blue-600">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">3</button>
            <button className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
            <select className="border border-gray-300 rounded text-sm px-2 py-1 ml-2 text-gray-600 focus:outline-none focus:border-blue-500">
              <option>10 条/页</option>
              <option>20 条/页</option>
              <option>50 条/页</option>
            </select>
            <span className="text-sm text-gray-600 ml-2">跳至</span>
            <input type="text" className="w-10 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-blue-500" />
            <span className="text-sm text-gray-600">页</span>
          </div>
        </div>
      </div>
      
      {/* Floating Action Buttons (from the image) */}
      <div className="fixed right-6 bottom-24 flex flex-col space-y-3">
        <button className="w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors">
          <Globe size={20} />
        </button>
        <button className="w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors">
          <HelpCircle size={20} />
        </button>
        <div className="w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};

export default ChangeLogModal;
