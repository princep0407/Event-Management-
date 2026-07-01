import React, { useState } from 'react';
import { useAppContext } from '../store';
import { getTranslation } from '../translations';
import { exportToCSV } from '../utils';
import { Search, Download, Upload, Edit2, Trash2, Plus } from 'lucide-react';

export default function Volunteers({
  onEditVolunteer,
  onBulkAdd
}: {
  onEditVolunteer: (id?: string) => void;
  onBulkAdd: () => void;
}) {
  const { language, volunteers, assignments, committees, deleteVolunteer } = useAppContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  const [search, setSearch] = useState('');
  const [centerFilter, setCenterFilter] = useState('');

  const centers = Array.from(new Set(volunteers.map(v => v.center).filter(Boolean))).sort();

  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch = search === '' || 
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.mobile.includes(search) ||
      v.memberId.toLowerCase().includes(search.toLowerCase());
    
    const matchesCenter = centerFilter === '' || v.center === centerFilter;
    
    return matchesSearch && matchesCenter;
  });

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      deleteVolunteer(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-serif text-[#1a1a1a] font-medium leading-tight">{t('volunteers')}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => exportToCSV(volunteers, committees, assignments)}
            className="px-4 py-2 rounded-2xl bg-white border border-[#e5e5de] text-[#5a5a40] font-bold flex items-center gap-2 shadow-sm hover:bg-[#f0f0e8] transition-colors text-sm"
          >
            <Download size={16} /> {t('exportCsv')}
          </button>
          <button 
            onClick={onBulkAdd}
            className="px-4 py-2 rounded-2xl bg-white border border-[#e5e5de] text-[#5a5a40] font-bold flex items-center gap-2 shadow-sm hover:bg-[#f0f0e8] transition-colors text-sm"
          >
            <Upload size={16} /> {t('bulkAdd')}
          </button>
          <button 
            onClick={() => onEditVolunteer()}
            className="px-4 py-2 rounded-2xl bg-[#5a5a40] text-white font-bold flex items-center gap-2 shadow-lg hover:bg-[#4a4a35] transition-colors text-sm"
          >
            <Plus size={16} /> {t('add')}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[24px] border border-[#e5e5de] shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e70]" size={18} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] text-[#1a1a1a] transition-all font-medium"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] text-[#1a1a1a] transition-all font-medium appearance-none"
          >
            <option value="">{t('centerFilter')}</option>
            {centers.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-[#e5e5de] shadow-sm overflow-hidden p-2">
        {/* Mobile-Friendly Card Layout */}
        <div className="block md:hidden space-y-3 p-2">
          {filteredVolunteers.length === 0 ? (
            <div className="py-16 text-center text-[#8e8e70] font-medium">
              No volunteers found.
            </div>
          ) : (
            filteredVolunteers.map((v) => {
              const assignedCount = assignments.filter(a => a.volunteerId === v.id).length;
              return (
                <div key={v.id} className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5de]/60 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f0f0e8] text-[#5a5a40] flex items-center justify-center font-bold text-sm shrink-0">
                        {v.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a1a1a] text-sm">{v.name}</h4>
                        <p className="text-xs text-[#8e8e70] font-medium mt-0.5">{v.mobile}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => onEditVolunteer(v.id)} className="p-2 text-[#8e8e70] hover:text-[#5a5a40] hover:bg-[#f0f0e8] rounded-xl"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 text-[#8e8e70] hover:text-[#a36b5e] hover:bg-[#a36b5e]/10 rounded-xl"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#e5e5de]/40 text-xs">
                    <span className="bg-[#e5e5de] px-2 py-0.5 rounded-md font-mono font-semibold text-[#5a5a40] text-[10px]">{v.memberId}</span>
                    <span className="font-bold uppercase tracking-wider text-[#5a5a40] text-[10px] bg-white border border-[#e5e5de] px-2 py-0.5 rounded-md">{v.role || '-'}</span>
                    {v.center && <span className="bg-[#f0f0e8] text-[#5a5a40] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#e5e5de]">{v.center}</span>}
                    <div className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-[#8e8e70]">
                      Slots: {assignedCount > 0 ? (
                        <span className="bg-[#6b8a6e]/10 text-[#6b8a6e] px-2 py-0.5 rounded-full font-bold">{assignedCount}</span>
                      ) : (
                        <span>0</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#fbfbf9] text-[#8e8e70] font-bold text-xs uppercase tracking-wider rounded-xl">
              <tr>
                <th className="px-6 py-4 rounded-l-xl">{t('name')}</th>
                <th className="px-6 py-4">{t('mobile')}</th>
                <th className="px-6 py-4">{t('memberId')}</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">{t('center')}</th>
                <th className="px-6 py-4">{t('assignedSlots')}</th>
                <th className="px-6 py-4 text-right rounded-r-xl">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="text-[#1a1a1a]">
              {filteredVolunteers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-[#8e8e70] font-medium">
                    No volunteers found.
                  </td>
                </tr>
              ) : (
                filteredVolunteers.map((v, i) => {
                  const assignedCount = assignments.filter(a => a.volunteerId === v.id).length;
                  return (
                    <tr key={v.id} className="hover:bg-[#fbfbf9] transition-colors group border-b border-[#e5e5de]/50 last:border-0">
                      <td className="px-6 py-4 font-bold text-[#1a1a1a] flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#f0f0e8] text-[#5a5a40] flex items-center justify-center font-bold text-sm shrink-0">
                          {v.name.charAt(0)}
                        </div>
                        {v.name}
                      </td>
                      <td className="px-6 py-4 font-medium">{v.mobile}</td>
                      <td className="px-6 py-4"><span className="bg-[#e5e5de] px-2.5 py-1 rounded-md text-xs font-mono font-semibold text-[#5a5a40]">{v.memberId}</span></td>
                      <td className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-[#5a5a40]">{v.role || '-'}</td>
                      <td className="px-6 py-4">
                        {v.center && <span className="bg-[#f0f0e8] text-[#5a5a40] px-3 py-1 rounded-full text-xs font-bold border border-[#e5e5de]">{v.center}</span>}
                      </td>
                      <td className="px-6 py-4">
                        {assignedCount > 0 ? (
                          <span className="bg-[#6b8a6e]/10 text-[#6b8a6e] px-3 py-1 rounded-full text-xs font-bold">{assignedCount}</span>
                        ) : (
                          <span className="text-[#8e8e70] font-semibold">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEditVolunteer(v.id)} className="p-2 text-[#8e8e70] hover:text-[#5a5a40] hover:bg-[#f0f0e8] rounded-xl"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(v.id)} className="p-2 text-[#8e8e70] hover:text-[#a36b5e] hover:bg-[#a36b5e]/10 rounded-xl"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
