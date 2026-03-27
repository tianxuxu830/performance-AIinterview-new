import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../constants';

interface SharePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedUserIds: string[]) => void;
  initialSelectedUserIds?: string[];
}

const SharePermissionModal: React.FC<SharePermissionModalProps> = ({ isOpen, onClose, onSave, initialSelectedUserIds = [] }) => {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set(initialSelectedUserIds));

  if (!isOpen) return null;

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] max-h-[90vh] flex flex-col shadow-xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">分享权限</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b">
          <div className="relative">
            <input 
              type="text" 
              placeholder="请输入用户名、姓名、角色名称" 
              className="w-full pl-4 pr-10 py-2 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">账户</th>
                <th className="px-4 py-3">姓名</th>
                <th className="px-4 py-3">部门</th>
                <th className="px-4 py-3">角色名称</th>
                <th className="px-4 py-3">权限</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {MOCK_EMPLOYEES.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{user.account || '13800000000'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{user.department}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" 
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                      />
                      <span>管理</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">取消</button>
          <button onClick={() => onSave(Array.from(selectedUserIds))} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">保存</button>
        </div>
      </div>
    </div>
  );
};

export default SharePermissionModal;
