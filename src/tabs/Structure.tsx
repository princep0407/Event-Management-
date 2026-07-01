import React, { useState } from 'react';
import { useAppContext } from '../store';
import { getTranslation } from '../translations';
import { FolderTree, ChevronRight, ChevronDown, User, Printer, Search, Filter, Check } from 'lucide-react';

export default function Structure() {
  const { language, eventInfo, committees, volunteers, assignments } = useAppContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSants, setSelectedSants] = useState<string[]>([]);
  const [selectedLeaders, setSelectedLeaders] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);

  // Unique list of options from current committees
  const allSanyojakSants = Array.from(new Set(committees.map(c => c.sanyojakSant).filter(Boolean))).sort() as string[];
  const allLeaders = Array.from(new Set(committees.map(c => c.leader).filter(Boolean))).sort() as string[];
  const allCenters = Array.from(new Set(committees.flatMap(c => c.centers || []).filter(Boolean))).sort() as string[];

  const toggleNode = (id: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNodes(newSet);
  };

  const expandAll = () => {
    setExpandedNodes(new Set(['root', ...committees.map(c => c.id)]));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['root']));
  };

  const handlePrint = () => {
    expandAll();
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const toggleSant = (sant: string) => {
    setSelectedSants(prev => 
      prev.includes(sant) ? prev.filter(x => x !== sant) : [...prev, sant]
    );
  };

  const toggleLeader = (leader: string) => {
    setSelectedLeaders(prev =>
      prev.includes(leader) ? prev.filter(x => x !== leader) : [...prev, leader]
    );
  };

  const toggleCenter = (center: string) => {
    setSelectedCenters(prev =>
      prev.includes(center) ? prev.filter(x => x !== center) : [...prev, center]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSants([]);
    setSelectedLeaders([]);
    setSelectedCenters([]);
  };

  // Filter logic
  const filteredCommittees = committees.filter(c => {
    // 1. Sant filter
    if (selectedSants.length > 0) {
      if (!c.sanyojakSant || !selectedSants.includes(c.sanyojakSant)) return false;
    }

    // 2. Leader filter
    if (selectedLeaders.length > 0) {
      if (!c.leader || !selectedLeaders.includes(c.leader)) return false;
    }

    // 3. Center filter
    if (selectedCenters.length > 0) {
      const matchesCenter = c.centers?.some(cent => selectedCenters.includes(cent));
      if (!matchesCenter) return false;
    }

    // 4. Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesCommittee = 
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.program || '').toLowerCase().includes(q) ||
        (c.leader || '').toLowerCase().includes(q) ||
        (c.sanyojakSant || '').toLowerCase().includes(q);

      const matchesLeaderVols = 
        (c.sanyojakVolunteers || []).some(v => (typeof v === 'string' ? v : v.name).toLowerCase().includes(q)) ||
        (c.nirikshakVolunteers || []).some(v => (typeof v === 'string' ? v : v.name).toLowerCase().includes(q));

      const commAssignments = assignments.filter(a => a.committeeId === c.id);
      const matchesAssigned = commAssignments.some(a => {
        const v = volunteers.find(vol => vol.id === a.volunteerId);
        return v && (v.name.toLowerCase().includes(q) || v.mobile.includes(q));
      });

      return matchesCommittee || matchesLeaderVols || matchesAssigned;
    }

    return true;
  });

  const isAnyFilterActive = searchTerm !== '' || selectedSants.length > 0 || selectedLeaders.length > 0 || selectedCenters.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-4xl font-serif text-[#1a1a1a] font-medium leading-tight">{t('structure')}</h2>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <button onClick={collapseAll} className="px-4 py-2 rounded-2xl bg-white border border-[#e5e5de] text-[#5a5a40] font-bold shadow-sm hover:bg-[#f0f0e8] transition-colors text-sm cursor-pointer">
            {t('collapseAll')}
          </button>
          <button onClick={expandAll} className="px-4 py-2 rounded-2xl bg-[#5a5a40] text-white font-bold shadow-sm hover:bg-[#4a4a35] transition-colors text-sm cursor-pointer">
            {t('expandAll')}
          </button>
          <button onClick={handlePrint} className="px-4 py-2 rounded-2xl bg-white border border-[#e5e5de] text-[#5a5a40] font-bold shadow-sm hover:bg-[#f0f0e8] transition-colors text-sm flex items-center gap-2 cursor-pointer">
            <Printer size={16} /> Download PDF
          </button>
        </div>
      </div>


      {/* Filter and Search Bar */}
      <div className="bg-[#fbfbf9] p-4 rounded-3xl border border-[#e5e5de] space-y-4 no-print shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e70]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={language === 'gu' ? 'સમિતિ, પ્રોગ્રામ અથવા સભ્યનું નામ સર્ચ કરો...' : 'Search committee, program, or volunteer...'}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e5de] rounded-2xl text-sm focus:ring-2 focus:ring-[#5a5a40] outline-none font-medium transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3 rounded-2xl border font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer ${
              showFilters || isAnyFilterActive
                ? 'bg-[#5a5a40] text-white border-[#5a5a40]'
                : 'bg-white text-[#5a5a40] border-[#e5e5de] hover:bg-[#f0f0e8]'
            }`}
          >
            <Filter size={16} />
            <span>{language === 'gu' ? 'ફિલ્ટર્સ' : 'Filters'}</span>
            {isAnyFilterActive && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse ml-1" />
            )}
          </button>
        </div>

        {/* Expandable Multi-select Filter Panel */}
        {showFilters && (
          <div className="border-t border-[#e5e5de] pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-200">
            {/* Sanyojak Sant Multiple Option */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#8e8e70] uppercase tracking-wider block mb-1">
                {language === 'gu' ? 'સંયોજક સંત (Sanyojak Sant)' : 'Sanyojak Sant'}
              </span>
              {allSanyojakSants.length === 0 ? (
                <p className="text-xs text-[#8e8e70] italic">No Sant assigned to any committee.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto p-1 bg-white rounded-xl border border-[#e5e5de]">
                  {allSanyojakSants.map(sant => {
                    const selected = selectedSants.includes(sant);
                    return (
                      <button
                        key={sant}
                        onClick={() => toggleSant(sant)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-sm'
                            : 'bg-white text-[#5a5a40] border-[#e5e5de] hover:bg-[#f0f0e8]'
                        }`}
                      >
                        {selected && <Check size={10} />}
                        {sant}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Leader Multiple Option */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#8e8e70] uppercase tracking-wider block mb-1">
                {language === 'gu' ? 'લીડર સંત (Leader)' : 'Leader Sant'}
              </span>
              {allLeaders.length === 0 ? (
                <p className="text-xs text-[#8e8e70] italic">No Leader assigned.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto p-1 bg-white rounded-xl border border-[#e5e5de]">
                  {allLeaders.map(leader => {
                    const selected = selectedLeaders.includes(leader);
                    return (
                      <button
                        key={leader}
                        onClick={() => toggleLeader(leader)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-sm'
                            : 'bg-white text-[#5a5a40] border-[#e5e5de] hover:bg-[#f0f0e8]'
                        }`}
                      >
                        {selected && <Check size={10} />}
                        {leader}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Centers filter */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#8e8e70] uppercase tracking-wider block mb-1">
                {language === 'gu' ? 'કેન્દ્રો (Centers)' : 'Centers'}
              </span>
              {allCenters.length === 0 ? (
                <p className="text-xs text-[#8e8e70] italic">No centers configured.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto p-1 bg-white rounded-xl border border-[#e5e5de]">
                  {allCenters.map(center => {
                    const selected = selectedCenters.includes(center);
                    return (
                      <button
                        key={center}
                        onClick={() => toggleCenter(center)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-sm'
                            : 'bg-white text-[#5a5a40] border-[#e5e5de] hover:bg-[#f0f0e8]'
                        }`}
                      >
                        {selected && <Check size={10} />}
                        {center}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reset option */}
            {isAnyFilterActive && (
              <div className="col-span-1 md:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {language === 'gu' ? 'બધા ફિલ્ટર્સ સાફ કરો' : 'Clear All Filters'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-[#e5e5de] shadow-sm font-sans print-section">
        {/* Print Header */}
        <div className="hidden print:block print-only-header">
          <h2 className="text-xl font-bold text-[#1a1a1a]">{eventInfo.name}</h2>
          <p className="text-sm text-[#8e8e70]">{eventInfo.date}</p>
        </div>
        
        {/* Root Event Node */}
        <div className="flex items-start">
          <button 
            onClick={() => toggleNode('root')}
            className="mt-1 p-1 text-[#8e8e70] hover:text-[#1a1a1a] hover:bg-[#f0f0e8] rounded-lg transition-colors cursor-pointer no-print"
          >
            {expandedNodes.has('root') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <div className="ml-2 w-full">
            <div className="flex items-center gap-3">
              <FolderTree className="text-[#5a5a40] no-print" size={24} />
              <span className="font-serif font-bold text-xl md:text-2xl text-[#1a1a1a]">{eventInfo.name}</span>
            </div>
            
            {expandedNodes.has('root') && (
              <div className="mt-4 ml-1 md:ml-3 pl-3 md:pl-6 border-l-2 border-[#e5e5de] space-y-5">
                {filteredCommittees.length === 0 && (
                  <p className="text-[#8e8e70] text-sm py-2 italic">
                    {isAnyFilterActive ? 'No committees match active filters.' : 'No committees.'}
                  </p>
                )}
                
                {filteredCommittees.map(c => {
                  const commAssignments = assignments.filter(a => a.committeeId === c.id);
                  const isExpanded = expandedNodes.has(c.id);
                  
                  return (
                    <div key={c.id} className="relative">
                      <div className="flex items-center group">
                        <button 
                          onClick={() => toggleNode(c.id)}
                          className="absolute -left-[22px] md:-left-[35px] mt-0.5 p-1 bg-white text-[#8e8e70] hover:text-[#1a1a1a] hover:bg-[#f0f0e8] rounded-lg transition-colors no-print cursor-pointer"
                        >
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 bg-[#fbfbf9] px-4 py-2 rounded-xl border border-[#e5e5de] w-full sm:w-auto">
                          <span className="font-bold text-sm md:text-base text-[#1a1a1a]">{c.name}</span>
                          <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                            {c.program && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#e5e5de] text-[#8e8e70]">Program: {c.program}</span>}
                            {c.sanyojakSant && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#5a5a40]/5 border border-[#5a5a40]/20 text-[#5a5a40]">Sant: {c.sanyojakSant}</span>}
                            {c.leader && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#5a5a40]/5 border border-[#5a5a40]/20 text-[#5a5a40]">Leader: {c.leader}</span>}
                            {c.centers && c.centers.length > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#e5e5de] text-[#8e8e70]">
                                Centers: {c.centers.join(', ')}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e5e5de] text-[#5a5a40]">
                              {commAssignments.length} / {c.capacity}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-3 ml-2 md:ml-4 pl-3 md:pl-6 border-l-2 border-dashed border-[#e5e5de] space-y-2">
                          {c.sanyojakVolunteers && c.sanyojakVolunteers.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 py-1.5 px-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                {language === 'gu' ? 'સંયોજક' : 'Sanyojak'}
                              </span>
                              {c.sanyojakVolunteers.map((sv, sidx) => {
                                const name = typeof sv === 'string' ? sv : sv.name;
                                const mobile = typeof sv === 'string' ? '' : sv.mobile;
                                return (
                                  <span key={sidx} className="text-xs text-[#1a1a1a] font-bold flex items-center gap-1">
                                    {name} {mobile && <span className="text-[10px] text-[#8e8e70] font-mono">({mobile})</span>}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {c.nirikshakVolunteers && c.nirikshakVolunteers.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 py-1.5 px-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                                {language === 'gu' ? 'નિરીક્ષક' : 'Nirikshak'}
                              </span>
                              {c.nirikshakVolunteers.map((nv, nidx) => {
                                const name = typeof nv === 'string' ? nv : nv.name;
                                const mobile = typeof nv === 'string' ? '' : nv.mobile;
                                return (
                                  <span key={nidx} className="text-xs text-[#1a1a1a] font-bold flex items-center gap-1">
                                    {name} {mobile && <span className="text-[10px] text-[#8e8e70] font-mono">({mobile})</span>}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {commAssignments.length === 0 && (!c.sanyojakVolunteers || c.sanyojakVolunteers.length === 0) && (!c.nirikshakVolunteers || c.nirikshakVolunteers.length === 0) && (
                            <p className="text-[#8e8e70] text-sm py-1">No volunteers.</p>
                          )}
                          {commAssignments.map(a => {
                            const v = volunteers.find(vol => vol.id === a.volunteerId);
                            if (!v) return null;
                            return (
                              <div key={a.id} className="flex flex-col py-1.5 group">
                                <div className="flex flex-wrap items-center gap-2">
                                  <User className="text-[#8e8e70] group-hover:text-[#5a5a40] transition-colors shrink-0 no-print" size={16} />
                                  <span className="text-sm text-[#1a1a1a] font-bold">{v.name}</span>
                                  {v.center && <span className="text-[10px] font-bold text-[#5a5a40] bg-[#f0f0e8] px-2 py-0.5 rounded-md border border-[#e5e5de]">{v.center}</span>}
                                  {a.role && <span className="text-[10px] font-bold text-[#5a5a40] bg-[#e5e5de] px-2 py-0.5 rounded-md uppercase tracking-wider">{a.role}</span>}
                                  <span className="text-xs text-[#8e8e70] font-medium truncate max-w-[250px]">{a.responsibility}</span>
                                  {v.mobile && <span className="text-[10px] text-[#8e8e70] font-mono">({v.mobile})</span>}
                                </div>
                                {a.notes && <p className="text-xs text-[#8e8e70] mt-1 ml-4 md:ml-6">{a.notes}</p>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
