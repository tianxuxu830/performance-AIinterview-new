import React, { useState } from 'react';

const MOCK_MOBILE_DETAIL_DATA = [
  {
    id: 'd1',
    name: '业绩考核',
    weight: 50,
    remainingWeight: 20,
    indicators: [
      {
        id: 'i1',
        name: '指标名称名称名称名称',
        weight: 50,
        targetValue: '100万元',
        guaranteedValue: '100万元',
        challengeValue: '100万元'
      },
      {
        id: 'i2',
        name: '指标名称名称名称名称',
        weight: 50,
        targetValue: '100万元',
        guaranteedValue: '100万元',
        challengeValue: '100万元'
      }
    ]
  },
  {
    id: 'd2',
    name: '团队协作',
    weight: 50,
    remainingWeight: 20,
    indicators: [
      {
        id: 'i3',
        name: '指标名称名称名称名称',
        weight: 50,
        targetValue: '100万元',
        guaranteedValue: '100万元',
        challengeValue: '100万元'
      },
      {
        id: 'i4',
        name: '指标名称名称名称名称',
        weight: 50,
        targetValue: '100万元',
        guaranteedValue: '100万元',
        challengeValue: '100万元'
      }
    ]
  }
];

const AssessmentDetailMobile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('d1');
  const [showDetail, setShowDetail] = useState(true);

  return (
    <div className="flex flex-col bg-[#F7F8FA] min-h-full">
      {/* Top Sticky Header with Tabs */}
      <div className="bg-white px-4 py-2 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1 flex-1">
          {MOCK_MOBILE_DETAIL_DATA.map(dim => (
            <button
              key={dim.id}
              onClick={() => setActiveTab(dim.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                activeTab === dim.id 
                  ? 'bg-[#E6F7F4] text-[#00B294] border border-[#B3EBE1]' 
                  : 'bg-[#F2F3F5] text-[#86909C] border border-transparent'
              }`}
            >
              {dim.name}({dim.weight}%)
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#F2F3F5] text-[#86909C] border border-transparent whitespace-nowrap">
            特殊奖惩
          </button>
        </div>
        
        <div className="flex items-center ml-3 shrink-0 border-l border-gray-100 pl-3">
          <span className="text-[11px] text-[#86909C] mr-1.5">明细</span>
          <div 
            onClick={() => setShowDetail(!showDetail)}
            className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${showDetail ? 'bg-[#00B294]' : 'bg-[#C9CDD4]'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${showDetail ? 'right-0.5' : 'left-0.5'}`} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 space-y-3 pb-20">
        {MOCK_MOBILE_DETAIL_DATA.map(dim => (
          <div key={dim.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Dimension Header */}
            <div className="px-4 py-3 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#1D2129]">
                  {dim.name} <span className="text-[#86909C] font-normal text-[12px]">({dim.weight}%)</span>
                </h3>
              </div>
              <div className="text-[11px] text-[#86909C] mt-1">
                剩余可输入权重：<span className="text-[#FF7D00] font-bold">{dim.remainingWeight}%</span>
              </div>
            </div>

            {/* Indicators List */}
            <div className="px-4 pb-4 space-y-6">
              {dim.indicators.map((indicator, idx) => (
                <div key={indicator.id} className="relative">
                  {/* Indicator Title */}
                  <div className="flex items-start mb-3">
                    <div className="w-[3px] h-[14px] bg-[#00B294] rounded-full mr-2 mt-[3px] shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-[13px] font-bold text-[#1D2129] leading-tight mb-2">{indicator.name}</h4>
                      <div className="inline-flex px-2 py-0.5 bg-[#F2F3F5] rounded text-[10px] text-[#4E5969] font-medium">
                        权重 {indicator.weight}%
                      </div>
                    </div>
                  </div>

                  {/* Values Grid */}
                  <div className="space-y-3 pl-[11px]">
                    <div className="flex items-center text-[12px]">
                      <span className="text-[#86909C] w-16">目标值</span>
                      <span className="text-[#4E5969] font-medium">{indicator.targetValue}</span>
                    </div>
                    <div className="flex items-center text-[12px]">
                      <span className="text-[#86909C] w-16">保底值</span>
                      <span className="text-[#4E5969] font-medium">{indicator.guaranteedValue}</span>
                    </div>
                    <div className="flex items-center text-[12px]">
                      <span className="text-[#86909C] w-16">挑战值</span>
                      <span className="text-[#4E5969] font-medium">{indicator.challengeValue}</span>
                    </div>
                  </div>
                  
                  {/* Dashed Separator */}
                  {idx < dim.indicators.length - 1 && (
                    <div className="mt-6 border-t border-dashed border-[#E5E6EB]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentDetailMobile;
