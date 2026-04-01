import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ImprovementPlan {
    id: string;
    action: string;
    deadline: string;
    status: 'pending' | 'completed';
}

interface ImprovementPlanTableProps {
    plans: ImprovementPlan[];
    onChange: (plans: ImprovementPlan[]) => void;
    readOnly?: boolean;
}

const ImprovementPlanTable: React.FC<ImprovementPlanTableProps> = ({ plans, onChange, readOnly = false }) => {
    const addRow = () => {
        const newPlan: ImprovementPlan = {
            id: Date.now().toString(),
            action: '',
            deadline: '',
            status: 'pending'
        };
        onChange([...plans, newPlan]);
    };

    const deleteRow = (id: string) => {
        onChange(plans.filter(p => p.id !== id));
    };

    const updateRow = (id: string, field: keyof ImprovementPlan, value: string) => {
        onChange(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    return (
        <div className="space-y-2">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">改进行动</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">截止日期</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">状态</th>
                        {!readOnly && <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">操作</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {plans.map(plan => (
                        <tr key={plan.id}>
                            <td className="px-3 py-2">
                                <input 
                                    disabled={readOnly}
                                    type="text" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800"
                                    value={plan.action}
                                    onChange={(e) => updateRow(plan.id, 'action', e.target.value)}
                                />
                            </td>
                            <td className="px-3 py-2">
                                <input 
                                    disabled={readOnly}
                                    type="date" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800"
                                    value={plan.deadline}
                                    onChange={(e) => updateRow(plan.id, 'deadline', e.target.value)}
                                />
                            </td>
                            <td className="px-3 py-2">
                                <select 
                                    disabled={readOnly}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800"
                                    value={plan.status}
                                    onChange={(e) => updateRow(plan.id, 'status', e.target.value as any)}
                                >
                                    <option value="pending">进行中</option>
                                    <option value="completed">已完成</option>
                                </select>
                            </td>
                            {!readOnly && (
                                <td className="px-3 py-2">
                                    <button onClick={() => deleteRow(plan.id)} className="text-red-500 hover:text-red-700">
                                        <X size={16} />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            {!readOnly && (
                <button onClick={addRow} className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-bold">
                    <Plus size={14} className="mr-1" /> 添加改进项
                </button>
            )}
        </div>
    );
};

export default ImprovementPlanTable;
