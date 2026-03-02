
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  FileText, 
  Users, 
  Settings, 
  BarChart2, 
  Briefcase,
  ChevronDown,
  Menu,
  ListTodo,
  MessageSquare,
  FolderOpen,
  PieChart
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (p: string) => void;
  currentRole: 'HR' | 'Employee';
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, currentRole }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['todo', 'my_team']);

  // Reset expanded menus when role changes if needed, or keep as is.
  // We can ensure the relevant menus are expanded by default.
  useEffect(() => {
      if (currentRole === 'Employee') {
          setExpandedMenus(prev => [...new Set([...prev, 'todo', 'my_team'])]);
      }
      // HR top level menus don't need expansion logic anymore
  }, [currentRole]);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Define all possible menu items with role visibility
  const allMenuItems = [
    { 
        id: 'dashboard', 
        icon: LayoutDashboard, 
        label: '工作台', 
        roles: ['HR', 'Employee'] 
    },
    { 
      id: 'todo', 
      icon: ListTodo, 
      label: '待办',
      badge: 18,
      roles: ['Employee'], // Only for Employee
      subItems: [
        { id: 'todo_plans', label: '计划制定', badge: 13 },
        { id: 'todo_reviews', label: '考核评分', badge: 4 },
        { id: 'todo_interviews', label: '绩效面谈', badge: 1 }
      ]
    },
    { 
        id: 'goals', 
        icon: Target, 
        label: '目标管理', 
        roles: ['Employee'] 
    },
    {
      id: 'my_team',
      icon: Users,
      label: '我的团队',
      roles: ['Employee'],
      subItems: [
        { id: 'my_team_org', label: '组织绩效' },
        { id: 'my_team_sub', label: '下属绩效' }
      ]
    },
    { 
        id: 'okr', 
        icon: BarChart2, 
        label: 'OKR 管理', 
        roles: ['Employee'] 
    },
    { 
      id: 'assessments', 
      icon: FileText, 
      label: '考核管理',
      roles: ['HR']
    },
    { 
      id: 'interviews', 
      icon: MessageSquare, 
      label: '绩效面谈',
      roles: ['HR']
    },
    { 
        id: 'indicators', 
        icon: Briefcase, 
        label: '指标库', 
        roles: ['HR'] 
    },
    { 
        id: 'archives', 
        icon: FolderOpen, 
        label: '绩效档案', 
        roles: ['HR'] 
    },
    { 
        id: 'settings', 
        icon: Settings, 
        label: '系统设置', 
        roles: ['HR'] 
    },
  ];

  // Filter items based on current role
  const menuItems = allMenuItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className={`bg-white h-screen border-r border-gray-300 flex flex-col transition-all duration-300 ${isOpen ? 'w-60' : 'w-16'}`}>
      <div className="h-14 flex items-center justify-center border-b border-gray-300 bg-gray-50/50">
        {isOpen ? (
          <span className="text-xl font-bold text-primary tracking-tight">智绩 SmartPerf</span>
        ) : (
          <span className="text-xl font-bold text-primary">智</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {menuItems.map((item) => {
          const isParentActive = activePage === item.id || (item.subItems && item.subItems.some(sub => sub.id === activePage));
          const isExpanded = expandedMenus.includes(item.id);

          return (
            <div key={item.id} className="mb-1">
              <div 
                className={`flex items-center px-4 py-2.5 cursor-pointer mx-2 rounded-lg transition-colors ${
                  isParentActive && !item.subItems
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => {
                  if (item.subItems) {
                    toggleMenu(item.id);
                  } else {
                    setActivePage(item.id);
                  }
                }}
              >
                <item.icon size={20} className={isParentActive && !item.subItems ? 'text-primary-600' : 'text-gray-500'} />
                {isOpen && (
                  <div className="flex-1 flex justify-between items-center ml-3">
                      <span className="text-sm">{item.label}</span>
                      {item.badge && <span className="bg-red-50 text-red-600 text-xs px-1.5 rounded-full font-medium min-w-[1.25rem] text-center">{item.badge}</span>}
                  </div>
                )}
                {isOpen && item.subItems && <ChevronDown size={14} className={`ml-auto text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
              </div>
              
              {isOpen && item.subItems && (
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="mt-1 space-y-0.5">
                    {item.subItems.map((sub) => (
                      <div
                        key={sub.id}
                        className={`pl-12 pr-4 py-2 text-sm cursor-pointer flex justify-between items-center rounded-lg mx-2 transition-colors ${
                          activePage === sub.id 
                            ? 'text-primary-600 bg-primary-50 font-medium' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setActivePage(sub.id)}
                      >
                        <span>{sub.label}</span>
                        {sub.badge && <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 rounded-full">{sub.badge}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-300">
         <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100 text-gray-500 w-full flex justify-center transition-colors">
            <Menu size={20} />
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
