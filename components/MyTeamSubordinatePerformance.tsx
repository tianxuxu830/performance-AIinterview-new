
import React, { useState } from 'react';
import { 
  Search, Filter, MoreHorizontal, User, FileText, 
  ChevronDown, CheckCircle2, Clock, Eye, ArrowRight, X,
  History, BarChart3, PieChart, AlertCircle, TrendingUp
} from 'lucide-react';
import { MOCK_EMPLOYEES, MOCK_ASSESSMENT_DETAILS } from '../constants';
import AssessmentDetailDrawer from './AssessmentDetailDrawer';
import EmployeeArchiveDrawer from './EmployeeArchiveDrawer';

const MyTeamSubordinatePerformance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer States
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isArchiveDrawerOpen, setIsArchiveDrawerOpen] = useState(false);
  
  // Selection States
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null); // For Detail
  const [archiveTarget, setArchiveTarget] = useState<any>(null); // For Archive

  // Mock Manager Dashboard Data
  const dashboardStats = {
      cycleName: '2025 Q4 绩效考核',
      total: 12,
      completed: 4,
      inProgress: 6,
      pendingConfirm: 2,
      abnormal: 0,
      completionRate: 33
  };

  // Mock Subordinate Data (Enhanced)
  const subordinates = [
      { id: '1', name: '李莎', role: '高级产品经理', department: '产品部', status: '评分中', score: '-', grade: '-', currentTask: '2025 Q4 绩效考核', avatar: 'https://picsum.photos/id/64/100/100', empId: 'GH0027', level: 'P7' },
      { id: '4', name: '陈飞', role: '工程师', department: '云演示组', status: '待确认', score: 88.5, grade: 'A', currentTask: '2025 Q4 绩效考核', avatar: 'https://picsum.photos/id/338/100/100', empId: 'GH0338', level: 'P5' },
      { id: 'u3', name: '小赵', role: '产品助理', department: '产品部', status: '自评中', score: '-', grade: '-', currentTask: '2025 Q4 绩效考核', avatar: 'https://picsum.photos/id/100/100/100', empId: 'GH0412', level: 'P4' },
      { id: 'u4', name: '王强', role: '技术专家', department: '架构组', status: '已完成', score: 92.0, grade: 'S', currentTask: '2025 Q4 绩效考核', avatar: 'https://picsum.photos/id/12/100/100', empId: 'GH0098', level: 'P8' },
      { id: 'u5', name: '孙敏', role: 'UI设计师', department: '设计组', status: '上级评估', score: '-', grade: '-', currentTask: '2025 Q4 绩效考核', avatar: 'https://picsum.photos/id/65/100/100', empId: 'GH0551', level: 'P5' },
  ];

  const getStatusStyle = (status: string) => {
      switch(status) {
          case '已完成': return 'bg-green-50 text-green-700 border-green-200';
          case '待确认': return 'bg-blue-50 text-blue-700 border-blue-200';
          case '评分中': 
          case '上级评估':
              return 'bg-orange-50 text-orange-700 border-orange-200';
          case '自评中': return 'bg-purple-50 text-purple-700 border-purple-200';
          default: return 'bg-gray-50 text-gray-600 border-gray-200';
      }
  };

  const filteredList = subordinates.filter(s => s.name.includes(searchTerm));

  // Open Current Assessment Detail
  const handleViewDetail = (employee: any) => {
      setSelectedEmployee(employee);
      setIsDetailDrawerOpen(true);
  };

  // Open Historical Archive
  const handleViewArchive = (employee: any) => {
      // Adapt employee object to match ArchiveDrawer expectation
      setArchiveTarget({
          name: employee.name,
          empId: employee.empId,
          dept: employee.department,
          position: employee.role,
          level: employee.level,
          avatar: employee.avatar
      });
      setIsArchiveDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      
      {/* 1. Management Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 pb-8">
          <div className="flex justify-between items-center mb-6">
              <div>
                  <h1 className="text-xl font-bold text-gray-900">下属绩效管理</h1>
                  <p className="text-sm text-gray-500 mt-1">当前考核周期：<span className="font-bold text-blue-600">{dashboardStats.cycleName}</span></p>
              </div>
              <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center transition-colors">
                      <History size={16} className="mr-2" /> 历史周期报表
                  </button>
              </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                      <div className="text-xs text-blue-600 font-medium mb-1">团队总人数</div>
                      <div className="text-2xl font-bold text-gray-900">{dashboardStats.total}</div>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <User size={20} />
                  </div>
              </div>
              
              <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                      <div className="text-xs text-green-600 font-medium mb-1">已完成考核</div>
                      <div className="text-2xl font-bold text-gray-900">{dashboardStats.completed}</div>
                  </div>
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle2 size={20} />
                  </div>
              </div>

              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                      <div className="text-xs text-orange-600 font-medium mb-1">流程进行中</div>
                      <div className="text-2xl font-bold text-gray-900">{dashboardStats.inProgress}</div>
                  </div>
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      <Clock size={20} />
                  </div>
              </div>

              <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-2">
                      <div className="text-xs text-purple-600 font-medium">整体完成率</div>
                      <div className="text-xl font-bold text-purple-700">{dashboardStats.completionRate}%</div>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${dashboardStats.completionRate}%` }}></div>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. Employee List Toolbar */}
      <div className="px-8 py-4 flex justify-between items-center bg-gray-50/50 border-b border-gray-200">
         <div className="flex items-center space-x-2">
             <h3 className="font-bold text-gray-700 text-sm">成员列表</h3>
             <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">{filteredList.length}</span>
         </div>
         <div className="flex space-x-3">
             <div className="relative">
                 <input 
                    type="text" 
                    placeholder="搜索姓名..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm w-56 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                 />
                 <Search className="absolute left-3 top-2 text-gray-400" size={14} />
             </div>
             <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center">
                 <Filter size={14} className="mr-2" /> 状态筛选
             </button>
         </div>
      </div>

      {/* 3. Table */}
      <div className="flex-1 overflow-auto custom-scrollbar px-8 pb-8 bg-gray-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                      <tr>
                          <th className="px-6 py-4">姓名 / 职位</th>
                          <th className="px-6 py-4">当前考核任务</th>
                          <th className="px-6 py-4">考核状态</th>
                          <th className="px-6 py-4">当前得分</th>
                          <th className="px-6 py-4">当前等级</th>
                          <th className="px-6 py-4 text-right">操作</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredList.map(emp => (
                          <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center">
                                      <img src={emp.avatar} alt="" className="w-9 h-9 rounded-full border border-gray-100 mr-3" />
                                      <div>
                                          <div className="font-bold text-gray-900">{emp.name}</div>
                                          <div className="text-xs text-gray-500">{emp.department} · {emp.role}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-gray-700 font-medium text-xs">{emp.currentTask}</td>
                              <td className="px-6 py-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(emp.status)}`}>
                                      {emp.status}
                                  </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-900">{emp.score}</td>
                              <td className="px-6 py-4">
                                  {emp.grade !== '-' && (
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                          ['S', 'A'].includes(emp.grade) ? 'bg-green-50 text-green-700 border-green-200' : 
                                          'bg-blue-50 text-blue-700 border-blue-200'
                                      }`}>
                                          {emp.grade}
                                      </span>
                                  )}
                                  {emp.grade === '-' && <span className="text-gray-400">-</span>}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end space-x-4">
                                      <button 
                                        onClick={() => handleViewArchive(emp)}
                                        className="text-gray-500 hover:text-gray-700 text-xs font-medium flex items-center transition-colors"
                                        title="查看历史档案"
                                      >
                                          <History size={14} className="mr-1" /> 历史档案
                                      </button>
                                      <button 
                                        onClick={() => handleViewDetail(emp)}
                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center transition-colors border border-blue-100 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
                                      >
                                          <Eye size={14} className="mr-1" /> 本期详情
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              {filteredList.length === 0 && (
                  <div className="p-12 text-center text-gray-400">暂无团队成员数据</div>
              )}
          </div>
      </div>

      {/* Detail Drawer (Current Task) */}
      <AssessmentDetailDrawer 
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        employee={selectedEmployee}
        detail={MOCK_ASSESSMENT_DETAILS[selectedEmployee?.id] || MOCK_ASSESSMENT_DETAILS['default']}
      />

      {/* Archive Drawer (History) */}
      <EmployeeArchiveDrawer 
          isOpen={isArchiveDrawerOpen}
          onClose={() => setIsArchiveDrawerOpen(false)}
          employee={archiveTarget}
      />
    </div>
  );
};

export default MyTeamSubordinatePerformance;
