import React, { useState } from 'react';
import { useAppContext } from '../store';
import { getTranslation } from '../translations';
import { downloadCSV } from '../utils';
import { Edit2, Trash2, Users, UserPlus, ChevronDown, ChevronRight, X, FileSpreadsheet, Search } from 'lucide-react';

export default function Committees({
  onEditCommittee,
  onAssignVolunteer,
  onBulkAdd
}: {
  onEditCommittee: (id: string) => void;
  onAssignVolunteer: (id: string) => void;
  onBulkAdd: () => void;
}) {
  const { language, committees, assignments, volunteers, deleteCommittee, deleteAssignment } = useAppContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [centerFilter, setCenterFilter] = useState('');

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      deleteCommittee(id);
    }
  };

  const handleExportSingleCommittee = (c: any, commAssignments: any[]) => {
    const headers = [
      language === 'gu' ? 'સ્વયંસેવકનું નામ' : 'Volunteer Name',
      language === 'gu' ? 'મોબાઇલ' : 'Mobile',
      language === 'gu' ? 'સભ્ય ID' : 'Member ID',
      language === 'gu' ? 'કેન્દ્ર' : 'Center',
      language === 'gu' ? 'હોદ્દો' : 'Role',
      language === 'gu' ? 'જવાબદારી' : 'Responsibility',
      language === 'gu' ? 'નોંધ' : 'Notes'
    ];

    const rows = commAssignments.map(a => {
      const v = volunteers.find(vol => vol.id === a.volunteerId);
      return [
        v ? v.name : 'Unknown',
        v ? v.mobile : '',
        v ? v.memberId : '',
        v ? v.center : '',
        a.role || '',
        a.responsibility || '',
        a.notes || ''
      ];
    });

    downloadCSV(`${c.name}_roster.csv`, headers, rows);
  };

  const centers = Array.from(new Set(committees.flatMap(c => c.centers || []).filter(Boolean))).sort();

  const filteredCommittees = committees.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      c.name.toLowerCase().includes(term) ||
      (c.leader && c.leader.toLowerCase().includes(term)) ||
      (c.coordinator && c.coordinator.toLowerCase().includes(term)) ||
      (c.sanyojakSant && c.sanyojakSant.toLowerCase().includes(term)) ||
      (c.centers && c.centers.some(cent => cent.toLowerCase().includes(term)));

    const matchesCenter = centerFilter === '' ||
      (c.centers && c.centers.includes(centerFilter));

    return matchesSearch && matchesCenter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif text-[#1a1a1a] font-medium leading-tight">{t('committees')}</h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <button onClick={onBulkAdd} className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#e5e5de] text-[#5a5a40] text-sm font-bold rounded-2xl shadow-sm hover:bg-[#f0f0e8] transition-colors flex items-center justify-center gap-2">
            <Users size={16} /> Bulk Add
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e70]" size={20} />
          <input
            type="text"
            placeholder={t('searchCommittees' as any)}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#e5e5de] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a5a40] transition-shadow placeholder-[#8e8e70] font-medium"
          />
        </div>
        <select
          value={centerFilter}
          onChange={e => setCenterFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-[#e5e5de] text-[#1a1a1a] text-sm font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5a5a40] transition-all cursor-pointer min-w-[180px] shadow-sm appearance-none"
        >
          <option value="">{t('centerFilter')}</option>
          {centers.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filteredCommittees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[32px] border border-dashed border-[#e5e5de]">
          <p className="text-[#8e8e70] font-medium">{committees.length === 0 ? t('emptyCommitteesPrompt') : 'No matching committees found.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredCommittees.map(c => {
            const commAssignments = assignments.filter(a => a.committeeId === c.id);
            const assignedCount = commAssignments.length;
            const capacity = Number(c.capacity);
            const isFull = assignedCount >= capacity;
            const percentage = Math.min(100, capacity > 0 ? (assignedCount / capacity) * 100 : 0);
            const isExpanded = expandedId === c.id;

            return (
              <div key={c.id} className="bg-white rounded-[32px] border border-[#e5e5de] shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">{c.name}</h3>
                      {c.description && <p className="text-sm text-[#8e8e70] mt-1">{c.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onEditCommittee(c.id)} className="p-2 text-[#8e8e70] hover:text-[#5a5a40] hover:bg-[#f0f0e8] rounded-xl transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-[#8e8e70] hover:text-[#a36b5e] hover:bg-[#a36b5e]/10 rounded-xl transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-6 bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5de]">
                    {c.sanyojakSant && (
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-[#8e8e70] uppercase tracking-wider font-bold mb-1 block">{t('sanyojakSant' as any)}</span>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{c.sanyojakSant}</p>
                      </div>
                    )}
                    {c.leader && (
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-[#8e8e70] uppercase tracking-wider font-bold mb-1 block">{t('leader')}</span>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{c.leader}</p>
                      </div>
                    )}
                    {c.sanyojakVolunteers && c.sanyojakVolunteers.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-[#8e8e70] uppercase tracking-wider font-bold mb-1 block">{t('sanyojakVolunteer' as any)}</span>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {c.sanyojakVolunteers.map((vol, idx) => {
                            const name = typeof vol === 'string' ? vol : vol.name;
                            const mobile = typeof vol === 'string' ? '' : vol.mobile;
                            return (
                              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e5e5de] text-[#5a5a40] text-xs font-bold rounded-md">
                                {name} {mobile && <span className="text-[10px] opacity-75 font-mono">({mobile})</span>}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {c.nirikshakVolunteers && c.nirikshakVolunteers.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-[#8e8e70] uppercase tracking-wider font-bold mb-1 block">{t('nirikshakVolunteer' as any)}</span>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {c.nirikshakVolunteers.map((vol, idx) => {
                            const name = typeof vol === 'string' ? vol : vol.name;
                            const mobile = typeof vol === 'string' ? '' : vol.mobile;
                            return (
                              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e5e5de] text-[#5a5a40] text-xs font-bold rounded-md">
                                {name} {mobile && <span className="text-[10px] opacity-75 font-mono">({mobile})</span>}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {c.coordinator && (
                      <div>
                        <span className="text-[10px] text-[#8e8e70] uppercase tracking-wider font-bold mb-1 block">{t('coordinator')}</span>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{c.coordinator}</p>
                      </div>
                    )}
                    {c.program && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-[#8e8e70] uppercase tracking-wider font-bold mb-1 block">Program</span>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{c.program}</p>
                      </div>
                    )}
                    {c.centers && c.centers.length > 0 && (
                      <div className="col-span-2 border-t border-[#e5e5de]/50 pt-3 mt-1">
                        <span className="text-[10px] text-[#8e8e70] uppercase tracking-wider font-bold mb-1 block">
                          {language === 'gu' ? 'જોડાયેલ કેન્દ્રો (Centers)' : 'Associated Centers'}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {c.centers.map((center, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-[#5a5a40]/10 text-[#5a5a40] text-xs font-bold rounded-md">
                              {center}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {!c.coordinator && !c.leader && !c.sanyojakSant && !c.program && (!c.sanyojakVolunteers || c.sanyojakVolunteers.length === 0) && (!c.nirikshakVolunteers || c.nirikshakVolunteers.length === 0) && (!c.centers || c.centers.length === 0) && (
                       <p className="text-sm text-[#8e8e70] col-span-2">No leadership assigned.</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-[#1a1a1a]">{assignedCount} / {capacity} <span className="text-[#8e8e70] font-normal">{t('assignedRequired').split('/')[0]}</span></span>
                      {isFull ? (
                        <span className="text-[#6b8a6e] font-bold text-[10px] bg-[#6b8a6e]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">{t('full')}</span>
                      ) : (
                        <span className="text-[#a36b5e] font-bold text-[10px] bg-[#a36b5e]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">{capacity - assignedCount} {t('remaining')}</span>
                      )}
                    </div>
                    <div className="h-2 bg-[#f0f0e8] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isFull ? 'bg-[#6b8a6e]' : 'bg-[#5a5a40]'}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#e5e5de] bg-[#fbfbf9] px-6 py-4 flex items-center justify-between">
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="flex items-center gap-2 text-sm font-bold text-[#5a5a40] hover:text-[#1a1a1a] transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {t('roster')} ({assignedCount})
                  </button>
                  <button 
                    onClick={() => onAssignVolunteer(c.id)}
                    className="px-4 py-2 bg-[#5a5a40] text-white text-xs font-bold rounded-2xl border border-[#5a5a40] shadow-sm flex items-center gap-1.5 hover:bg-[#4a4a35] transition-colors"
                  >
                    <UserPlus size={14} /> {t('assign')}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#e5e5de] bg-white">
                    {commAssignments.length === 0 ? (
                      <p className="text-sm text-[#8e8e70] p-6 text-center font-medium">No volunteers assigned yet.</p>
                    ) : (
                      <>
                        <div className="px-6 py-2.5 bg-[#fbfbf9] border-b border-[#e5e5de] flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#8e8e70] uppercase tracking-wider">
                            {language === 'gu' ? 'કુલ સ્વયંસેવકો' : 'Total Volunteers'}: {commAssignments.length}
                          </span>
                          <button
                            onClick={() => handleExportSingleCommittee(c, commAssignments)}
                            className="px-2.5 py-1 text-[10px] font-bold text-[#5a5a40] bg-white border border-[#e5e5de] hover:bg-[#f0f0e8] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileSpreadsheet size={12} />
                            <span>{language === 'gu' ? 'એક્સેલ નિકાસ' : 'Excel Export'}</span>
                          </button>
                        </div>
                        <ul className="divide-y divide-[#e5e5de]">
                        {commAssignments.map(a => {
                          const v = volunteers.find(vol => vol.id === a.volunteerId);
                          if (!v) return null;
                          return (
                            <li key={a.id} className="p-4 px-6 flex items-center justify-between hover:bg-[#fbfbf9] transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#f0f0e8] text-[#5a5a40] flex items-center justify-center font-bold text-sm shrink-0">
                                  {v.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#1a1a1a]">{v.name} {v.mobile && <span className="text-xs font-normal text-[#8e8e70] ml-1">({v.mobile})</span>}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {a.role && <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5e5de] text-[#5a5a40] px-2 py-0.5 rounded-md">{a.role}</span>}
                                    <p className="text-xs text-[#8e8e70] font-medium">{a.responsibility}</p>
                                  </div>
                                  {a.notes && <p className="text-xs text-[#8e8e70] mt-1">{a.notes}</p>}
                                </div>
                              </div>
                              <button 
                                onClick={() => deleteAssignment(a.id)}
                                className="text-[#8e8e70] hover:text-[#a36b5e] p-2 rounded-xl hover:bg-[#a36b5e]/10 transition-colors"
                                title={t('remove')}
                              >
                                <X size={16} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
