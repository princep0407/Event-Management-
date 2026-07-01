import React from 'react';
import { useAppContext } from '../store';
import { getTranslation } from '../translations';
import { Users, LayoutGrid, CheckCircle, AlertCircle, Plus } from 'lucide-react';

export default function Dashboard({
  onAddCommittee,
  onAddVolunteer
}: {
  onAddCommittee: () => void;
  onAddVolunteer: () => void;
}) {
  const { language, committees, volunteers, assignments } = useAppContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const totalRequired = committees.reduce((sum, c) => sum + Number(c.capacity), 0);
  const totalAssigned = assignments.length;
  const remainingSlots = Math.max(0, totalRequired - totalAssigned);

  const shortStaffed = committees.map(c => {
    const assigned = assignments.filter(a => a.committeeId === c.id).length;
    return { ...c, assigned, remaining: Math.max(0, Number(c.capacity) - assigned) };
  }).filter(c => c.remaining > 0).sort((a, b) => b.remaining - a.remaining).slice(0, 6);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8 shrink-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif text-[#1a1a1a] font-medium leading-tight">{t('dashboard')}</h2>
          <p className="text-[#8e8e70] font-medium mt-1 text-xs md:text-sm">ઇવેન્ટનું વર્તમાન વિઝ્યુલાઇઝેશન અને ડેટા સારાંશ</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
          <button onClick={onAddVolunteer} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#5a5a40] text-white font-bold flex items-center justify-center space-x-2 shadow-md active:translate-y-0.5 transition-transform text-sm">
            <Plus size={18} />
            <span>{t('addVolunteer')}</span>
          </button>
          <button onClick={onAddCommittee} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#5a5a40] text-[#5a5a40] font-bold flex items-center justify-center space-x-2 shadow-sm hover:bg-[#f5f5f0] transition-colors text-sm">
            <Plus size={18} />
            <span>{t('addCommittee')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 shrink-0">
        <div className="bg-white p-6 rounded-[32px] border border-[#e5e5de] shadow-sm">
          <p className="text-xs font-bold text-[#8e8e70] uppercase tracking-wider">{t('totalCommittees')}</p>
          <p className="text-4xl font-serif mt-2 text-[#1a1a1a]">{committees.length}</p>
          <p className="text-xs text-[#6b8a6e] mt-2 font-semibold font-sans uppercase">+ {t('committees')}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-[#e5e5de] shadow-sm">
          <p className="text-xs font-bold text-[#8e8e70] uppercase tracking-wider">{t('totalVolunteers')}</p>
          <p className="text-4xl font-serif mt-2 text-[#1a1a1a]">{volunteers.length}</p>
          <p className="text-xs text-[#6b8a6e] mt-2 font-semibold font-sans uppercase">+ {t('volunteers')}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-[#e5e5de] shadow-sm">
          <p className="text-xs font-bold text-[#8e8e70] uppercase tracking-wider">{t('assignedRequired')}</p>
          <p className="text-4xl font-serif mt-2 text-[#1a1a1a]">{totalAssigned}/{totalRequired}</p>
          <p className="text-xs text-[#8e8e70] mt-2 font-semibold font-sans uppercase">{(totalRequired ? (totalAssigned/totalRequired*100).toFixed(1) : 0)}% {t('full')}</p>
        </div>
        <div className="bg-[#5a5a40] p-6 rounded-[32px] border border-[#5a5a40] shadow-sm text-white">
          <p className="text-xs font-bold opacity-70 uppercase tracking-wider">{t('remainingSlots')}</p>
          <p className="text-4xl font-serif mt-2">{remainingSlots}</p>
          <p className="text-xs opacity-80 mt-2 font-semibold font-sans uppercase underline">{t('mostShortStaffed')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0 pb-8">
        <div className="col-span-1 lg:col-span-3 bg-white rounded-[32px] border border-[#e5e5de] p-6 flex flex-col min-h-0 shadow-sm">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="font-serif text-xl text-[#1a1a1a]">{t('mostShortStaffed')}</h3>
            <span className="px-3 py-1 bg-[#f5f5f0] text-xs font-bold rounded-full text-[#5a5a40]">Top 6</span>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2">
            {committees.length === 0 ? (
              <div className="p-8 text-center text-[#8e8e70]">
                <LayoutGrid size={48} className="mx-auto text-[#e5e5de] mb-3" />
                <p>{t('emptyCommitteesPrompt')}</p>
              </div>
            ) : shortStaffed.length === 0 ? (
              <div className="p-8 text-center text-[#6b8a6e]">
                <CheckCircle size={48} className="mx-auto text-[#6b8a6e] mb-3 opacity-50" />
                <p className="font-medium">All committees are fully staffed!</p>
              </div>
            ) : (
              shortStaffed.map((c, index) => (
                <div key={c.id} className="p-4 rounded-2xl bg-[#fbfbf9] border border-[#e5e5de] flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#f0f0e8] flex items-center justify-center font-bold text-[#5a5a40] shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 ml-4 min-w-0">
                    <p className="font-bold text-sm text-[#1a1a1a] truncate">{c.name}</p>
                    <div className="w-full h-1.5 bg-[#e5e5de] rounded-full mt-2">
                      <div 
                        className="h-full bg-[#a36b5e] rounded-full" 
                        style={{ width: `${Math.min(100, (c.assigned / Number(c.capacity)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-6 text-right shrink-0">
                    <span className="inline-block px-2 py-1 bg-[#a36b5e]/10 text-[#a36b5e] text-[10px] font-bold rounded-md uppercase mb-1">
                      {c.remaining} {t('remaining')}
                    </span>
                    <p className="text-[10px] font-medium text-[#8e8e70] block">
                      {c.assigned}/{c.capacity} {t('assignedRequired').split('/')[0]}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-[#e5e5de] p-6 h-full flex flex-col shadow-sm">
            <h3 className="font-serif text-xl mb-4 text-[#1a1a1a]">Quick Information</h3>
            <div className="flex-1 border-2 border-dashed border-[#e5e5de] rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-[#fbfbf9]">
              <div className="w-12 h-12 bg-[#f5f5f0] rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-[#8e8e70]" />
              </div>
              <p className="text-sm font-semibold text-[#5a5a40] mb-1">Dashboard Overview</p>
              <p className="text-xs text-[#8e8e70] leading-relaxed">
                Use this dashboard to get a quick overview of your entire volunteer force, track assignment progress, and identify areas that need urgent attention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
