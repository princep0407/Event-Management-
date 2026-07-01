import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useAppContext } from '../store';
import { getTranslation } from '../translations';
import { generateId } from '../utils';
import { Committee, Volunteer, Assignment } from '../types';
import { SMVS_CENTERS } from '../data/centers';

export function Modal({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, size?: 'md' | 'lg' | 'xl' }) {
  if (!isOpen) return null;
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white rounded-[32px] shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col overflow-hidden border border-[#e5e5de] animate-in zoom-in-95 duration-200`}>
        <div className="px-6 py-4 md:py-5 border-b border-[#e5e5de] bg-[#fbfbf9] flex justify-between items-center shrink-0">
          <h3 className="text-lg md:text-xl font-serif font-bold text-[#1a1a1a] truncate pr-2">{title}</h3>
          <button onClick={onClose} className="text-[#8e8e70] hover:text-[#1a1a1a] p-2 rounded-xl hover:bg-[#e5e5de]/50 transition-colors text-2xl leading-none shrink-0">&times;</button>
        </div>
        <div className="p-5 md:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CommitteeModal({ id, onClose }: { id?: string, onClose: () => void }) {
  const { volunteers, committees, addCommittee, updateCommittee, language } = useAppContext();
  const t = (key: any) => getTranslation(language, key);
  
  const existing = id ? committees.find(c => c.id === id) : null;
  
  const [formData, setFormData] = useState<Partial<Committee>>(
    existing || { name: '', description: '', capacity: 0, sanyojakSant: '', leader: '', sanyojakVolunteers: [], nirikshakVolunteers: [], centers: [] }
  );

  const [selectedCenters, setSelectedCenters] = useState<string[]>(
    existing?.centers || []
  );
  const [newCenterInput, setNewCenterInput] = useState('');
  const [centerSearch, setCenterSearch] = useState('');

  const uniqueCenters = Array.from(new Set([
    ...SMVS_CENTERS,
    ...volunteers.map(v => v.center).filter(Boolean)
  ])).sort();

  const handleToggleCenter = (centerName: string) => {
    setSelectedCenters(prev =>
      prev.includes(centerName) ? prev.filter(c => c !== centerName) : [...prev, centerName]
    );
  };

  const handleAddCustomCenter = () => {
    const trimmed = newCenterInput.trim();
    if (trimmed && !selectedCenters.includes(trimmed)) {
      setSelectedCenters(prev => [...prev, trimmed]);
      setNewCenterInput('');
    }
  };

  const [tempSanyojakName, setTempSanyojakName] = useState('');
  const [tempSanyojakMobile, setTempSanyojakMobile] = useState('');
  const [tempNirikshakName, setTempNirikshakName] = useState('');
  const [tempNirikshakMobile, setTempNirikshakMobile] = useState('');

  const handleAddSanyojak = () => {
    if (tempSanyojakName.trim()) {
      const contactObj = {
        name: tempSanyojakName.trim(),
        mobile: tempSanyojakMobile.trim() || undefined
      };
      setFormData(prev => ({
        ...prev,
        sanyojakVolunteers: [...(prev.sanyojakVolunteers || []), contactObj]
      }));
      setTempSanyojakName('');
      setTempSanyojakMobile('');
    }
  };

  const handleAddNirikshak = () => {
    if (tempNirikshakName.trim()) {
      const contactObj = {
        name: tempNirikshakName.trim(),
        mobile: tempNirikshakMobile.trim() || undefined
      };
      setFormData(prev => ({
        ...prev,
        nirikshakVolunteers: [...(prev.nirikshakVolunteers || []), contactObj]
      }));
      setTempNirikshakName('');
      setTempNirikshakMobile('');
    }
  };

  const removeSanyojak = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sanyojakVolunteers: prev.sanyojakVolunteers?.filter((_, i) => i !== index)
    }));
  };

  const removeNirikshak = (index: number) => {
    setFormData(prev => ({
      ...prev,
      nirikshakVolunteers: prev.nirikshakVolunteers?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData, centers: selectedCenters };
    if (existing) {
      updateCommittee({ ...existing, ...finalData } as Committee);
    } else {
      addCommittee({ ...finalData, id: generateId(), coordinator: formData.coordinator || '' } as Committee);
    }
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={existing ? t('edit') : t('addCommittee')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('name')} *</label>
          <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('description')}</label>
          <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('sanyojakSant')}</label>
            <input type="text" value={formData.sanyojakSant || ''} onChange={e => setFormData({...formData, sanyojakSant: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('leader')}</label>
            <input type="text" value={formData.leader || ''} onChange={e => setFormData({...formData, leader: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('sanyojakVolunteer')}</label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input 
              type="text" 
              value={tempSanyojakName} 
              onChange={e => setTempSanyojakName(e.target.value)} 
              className="flex-1 px-3 py-2.5 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium transition-all" 
              placeholder={language === 'gu' ? 'નામ...' : 'Name...'} 
            />
            <input 
              type="text" 
              value={tempSanyojakMobile} 
              onChange={e => setTempSanyojakMobile(e.target.value)} 
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSanyojak(); } }}
              className="w-full sm:w-36 px-3 py-2.5 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium transition-all" 
              placeholder={language === 'gu' ? 'મોબાઇલ...' : 'Mobile...'} 
            />
            <button 
              type="button" 
              onClick={handleAddSanyojak} 
              className="px-4 py-2.5 bg-[#e5e5de] text-[#5a5a40] font-bold rounded-xl hover:bg-[#d8d8d0] transition-colors shrink-0 text-sm"
            >
              {t('add')}
            </button>
          </div>
          {formData.sanyojakVolunteers && formData.sanyojakVolunteers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.sanyojakVolunteers.map((vol, idx) => {
                const name = typeof vol === 'string' ? vol : vol.name;
                const mobile = typeof vol === 'string' ? '' : vol.mobile;
                return (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0f0e8] text-[#5a5a40] text-xs font-bold rounded-lg shadow-sm border border-[#e5e5de]/50">
                    <span>
                      {name} {mobile && <span className="text-[10px] text-[#8e8e70] font-mono ml-1">({mobile})</span>}
                    </span>
                    <button type="button" onClick={() => removeSanyojak(idx)} className="hover:text-red-500 font-bold ml-1 text-sm leading-none">&times;</button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('nirikshakVolunteer')}</label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input 
              type="text" 
              value={tempNirikshakName} 
              onChange={e => setTempNirikshakName(e.target.value)} 
              className="flex-1 px-3 py-2.5 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium transition-all" 
              placeholder={language === 'gu' ? 'નામ...' : 'Name...'} 
            />
            <input 
              type="text" 
              value={tempNirikshakMobile} 
              onChange={e => setTempNirikshakMobile(e.target.value)} 
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNirikshak(); } }}
              className="w-full sm:w-36 px-3 py-2.5 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium transition-all" 
              placeholder={language === 'gu' ? 'મોબાઇલ...' : 'Mobile...'} 
            />
            <button 
              type="button" 
              onClick={handleAddNirikshak} 
              className="px-4 py-2.5 bg-[#e5e5de] text-[#5a5a40] font-bold rounded-xl hover:bg-[#d8d8d0] transition-colors shrink-0 text-sm"
            >
              {t('add')}
            </button>
          </div>
          {formData.nirikshakVolunteers && formData.nirikshakVolunteers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.nirikshakVolunteers.map((vol, idx) => {
                const name = typeof vol === 'string' ? vol : vol.name;
                const mobile = typeof vol === 'string' ? '' : vol.mobile;
                return (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0f0e8] text-[#5a5a40] text-xs font-bold rounded-lg shadow-sm border border-[#e5e5de]/50">
                    <span>
                      {name} {mobile && <span className="text-[10px] text-[#8e8e70] font-mono ml-1">({mobile})</span>}
                    </span>
                    <button type="button" onClick={() => removeNirikshak(idx)} className="hover:text-red-500 font-bold ml-1 text-sm leading-none">&times;</button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Committee Centers Multiple Select/Add */}
        <div className="space-y-2 border-t border-[#e5e5de]/50 pt-4">
          <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">
            {language === 'gu' ? 'સમિતિના કેન્દ્રો (Centers)' : 'Committee Centers'}
          </label>
          <p className="text-[10px] text-[#8e8e70] -mt-1 font-medium">
            {language === 'gu' ? 'આ સમિતિ સાથે જોડાયેલ કેન્દ્રો પસંદ કરો:' : 'Select centers associated with this committee:'}
          </p>
          
          <div className="relative mb-2">
            <input
              type="text"
              placeholder={language === 'gu' ? 'કેન્દ્ર શોધો...' : 'Search center to select...'}
              value={centerSearch}
              onChange={e => setCenterSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-[#e5e5de] rounded-xl text-xs focus:ring-2 focus:ring-[#5a5a40]/30 outline-none text-[#1a1a1a] font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2 max-h-[140px] overflow-y-auto p-2 bg-[#fbfbf9] rounded-xl border border-[#e5e5de]">
            {uniqueCenters.filter(c => c.toLowerCase().includes(centerSearch.toLowerCase())).length === 0 ? (
              <span className="text-xs text-[#8e8e70] italic p-1">
                {language === 'gu' ? 'કોઈ કેન્દ્ર મળ્યું નથી' : 'No matching centers found'}
              </span>
            ) : (
              uniqueCenters
                .filter(c => c.toLowerCase().includes(centerSearch.toLowerCase()))
                .map(center => {
                  const isSelected = selectedCenters.includes(center);
                  return (
                    <button
                      type="button"
                      key={center}
                      onClick={() => handleToggleCenter(center)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-sm'
                          : 'bg-white text-[#5a5a40] border-[#e5e5de] hover:bg-[#f0f0e8]'
                      }`}
                    >
                      {center}
                    </button>
                  );
                })
            )}
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              list="smvs-centers-datalist"
              value={newCenterInput}
              onChange={e => setNewCenterInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCenter(); } }}
              placeholder={language === 'gu' ? 'બીજું નવું કેન્દ્ર ઉમેરો...' : 'Add a new custom center...'}
              className="flex-1 px-3 py-2 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-xs text-[#1a1a1a] font-medium transition-all"
            />
            <button
              type="button"
              onClick={handleAddCustomCenter}
              className="px-3 py-2 bg-[#5a5a40] text-white font-bold rounded-xl hover:bg-[#4a4a35] transition-colors text-xs shrink-0"
            >
              {language === 'gu' ? 'ઉમેરો' : 'Add'}
            </button>
          </div>

          {selectedCenters.length > 0 && (
            <div className="mt-2">
              <span className="text-[10px] font-bold text-[#8e8e70] uppercase tracking-wider block mb-1">
                {language === 'gu' ? 'પસંદ કરેલ કેન્દ્રો:' : 'Selected Centers:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCenters.map(center => (
                  <span key={center} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#f5f5f0] text-[#5a5a40] text-xs font-bold rounded-lg shadow-sm border border-[#e5e5de]">
                    {center}
                    <button type="button" onClick={() => handleToggleCenter(center)} className="hover:text-red-500 font-bold ml-1 text-sm leading-none">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('capacity')} *</label>
          <input required type="number" min="0" value={formData.capacity ?? 0} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" />
        </div>
        <div className="pt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-[#e5e5de] text-[#5a5a40] rounded-2xl font-bold hover:bg-[#f0f0e8] transition-colors">{t('cancel')}</button>
          <button type="submit" className="px-6 py-2.5 bg-[#5a5a40] text-white rounded-2xl font-bold shadow-md hover:bg-[#4a4a35] transition-colors">{t('save')}</button>
        </div>
      </form>
    </Modal>
  );
}

export function VolunteerModal({ id, onClose }: { id?: string, onClose: () => void }) {
  const { volunteers, addVolunteer, updateVolunteer, language } = useAppContext();
  const t = (key: any) => getTranslation(language, key);
  
  const existing = id ? volunteers.find(v => v.id === id) : null;
  
  const [formData, setFormData] = useState<Partial<Volunteer>>(
    existing || { name: '', mobile: '', memberId: '', center: '' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      updateVolunteer({ ...existing, ...formData } as Volunteer);
    } else {
      addVolunteer({ ...formData, id: generateId() } as Volunteer);
    }
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={existing ? t('edit') : t('addVolunteer')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('name')} *</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('mobile')} *</label>
          <input required type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('memberId')}</label>
            <input type="text" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('center')}</label>
            <input type="text" list="smvs-centers-datalist" value={formData.center} onChange={e => setFormData({...formData, center: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" />
            <datalist id="smvs-centers-datalist">
              {SMVS_CENTERS.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>
        <div className="pt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-[#e5e5de] text-[#5a5a40] rounded-2xl font-bold hover:bg-[#f0f0e8] transition-colors">{t('cancel')}</button>
          <button type="submit" className="px-6 py-2.5 bg-[#5a5a40] text-white rounded-2xl font-bold shadow-md hover:bg-[#4a4a35] transition-colors">{t('save')}</button>
        </div>
      </form>
    </Modal>
  );
}

export function AssignModal({ committeeId, onClose }: { committeeId: string, onClose: () => void }) {
  const { volunteers, assignments, addAssignment, bulkAddAssignments, committees, language } = useAppContext();
  const t = (key: any) => getTranslation(language, key);

  const committee = committees.find(c => c.id === committeeId);
  const commCenters = committee?.centers || [];

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  // Single assign state
  const [formData, setFormData] = useState({ volunteerId: '', responsibility: '', role: 'Svaymsevak', notes: '' });

  // Bulk assign state
  const [bulkRole, setBulkRole] = useState('Svaymsevak');
  const [bulkResponsibility, setBulkResponsibility] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');
  const [selectedVolIds, setSelectedVolIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [centerFilter, setCenterFilter] = useState('all');
  const [filterByCommCenters, setFilterByCommCenters] = useState(commCenters.length > 0);

  // Unique centers for dropdown filter
  const uniqueCenters = Array.from(new Set(volunteers.map(v => v.center).filter(Boolean))).sort();

  // Helper to check existing assignments
  const getVolAssignmentInfo = (vId: string) => {
    const a = assignments.find(x => x.volunteerId === vId);
    if (!a) return null;
    const c = committees.find(comm => comm.id === a.committeeId);
    return c ? { committeeName: c.name, role: a.role } : null;
  };

  // Filter volunteers for bulk view
  const filteredVolunteers = volunteers.filter(v => {
    // 1. Comm center filter (active by default if committee has centers)
    if (filterByCommCenters && commCenters.length > 0) {
      if (!commCenters.includes(v.center)) return false;
    }

    // 2. Specific center filter
    if (!filterByCommCenters && centerFilter !== 'all' && v.center !== centerFilter) {
      return false;
    }

    // 3. Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = v.name.toLowerCase().includes(q);
      const matchesMobile = v.mobile.includes(q);
      const matchesId = v.memberId.toLowerCase().includes(q);
      return matchesName || matchesMobile || matchesId;
    }

    return true;
  });

  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredVolunteers.map(v => v.id);
    const allSelected = allFilteredIds.every(id => selectedVolIds.includes(id));
    if (allSelected) {
      setSelectedVolIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedVolIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleToggleVolunteer = (id: string) => {
    setSelectedVolIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.volunteerId) return;
    addAssignment({
      id: generateId(),
      committeeId,
      volunteerId: formData.volunteerId,
      responsibility: formData.responsibility,
      role: formData.role,
      notes: formData.notes
    });
    onClose();
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVolIds.length === 0) return;

    const newAssignments: Assignment[] = selectedVolIds.map(vId => ({
      id: generateId(),
      committeeId,
      volunteerId: vId,
      responsibility: bulkResponsibility,
      role: bulkRole,
      notes: bulkNotes
    }));

    bulkAddAssignments(newAssignments);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`${t('assignVolunteer')} - ${committee?.name}`} size={activeTab === 'bulk' ? 'xl' : 'md'}>
      {/* Tabs Selector */}
      <div className="flex border-b border-[#e5e5de] mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'single'
              ? 'border-[#5a5a40] text-[#5a5a40]'
              : 'border-transparent text-[#8e8e70] hover:text-[#5a5a40]'
          }`}
        >
          {language === 'gu' ? 'એક સભ્ય ફાળવો' : 'Single Assign'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'bulk'
              ? 'border-[#5a5a40] text-[#5a5a40]'
              : 'border-transparent text-[#8e8e70] hover:text-[#5a5a40]'
          }`}
        >
          {language === 'gu' ? 'એકસાથે મલ્ટીપલ ફાળવો (Bulk)' : 'Bulk Assign'}
        </button>
      </div>

      {activeTab === 'single' ? (
        <form onSubmit={handleSingleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('selectVolunteer')} *</label>
            <select required value={formData.volunteerId} onChange={e => setFormData({...formData, volunteerId: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all appearance-none">
              <option value="" disabled>-- Select --</option>
              {volunteers.map(v => {
                const info = getVolAssignmentInfo(v.id);
                return (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.center}){info ? ` [Already assigned in ${info.committeeName}]` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('role')} *</label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all appearance-none">
              <option value="Sanyojak">Sanyojak</option>
              <option value="Nirdeshak">Nirdeshak</option>
              <option value="Nirikshak">Nirikshak</option>
              <option value="Leader">Leader</option>
              <option value="Svaymsevak">Svaymsevak</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">{t('responsibility')}</label>
            <input type="text" placeholder="e.g. Stage Setup" value={formData.responsibility} onChange={e => setFormData({...formData, responsibility: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-2">Notes</label>
            <textarea placeholder="Specific instructions or responsibilities..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-medium transition-all" rows={3} />
          </div>
          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-[#e5e5de] text-[#5a5a40] rounded-2xl font-bold hover:bg-[#f0f0e8] transition-colors">{t('cancel')}</button>
            <button type="submit" disabled={!formData.volunteerId} className="px-6 py-2.5 bg-[#5a5a40] text-white rounded-2xl font-bold shadow-md hover:bg-[#4a4a35] transition-colors disabled:opacity-50">{t('assign')}</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Panel: Search and Checkbox list */}
            <div className="space-y-3 flex flex-col h-[340px]">
              <div className="space-y-2 shrink-0">
                <input
                  type="text"
                  placeholder={language === 'gu' ? 'નામ અથવા મોબાઈલથી સર્ચ કરો...' : 'Search by name or mobile...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] outline-none font-medium"
                />

                <div className="flex gap-2 items-center">
                  {commCenters.length > 0 ? (
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#5a5a40]">
                      <input
                        type="checkbox"
                        checked={filterByCommCenters}
                        onChange={e => {
                          setFilterByCommCenters(e.target.checked);
                          if (e.target.checked) setCenterFilter('all');
                        }}
                        className="rounded accent-[#5a5a40]"
                      />
                      <span>Only {committee?.name}'s centers</span>
                    </label>
                  ) : null}

                  {!filterByCommCenters && (
                    <select
                      value={centerFilter}
                      onChange={e => setCenterFilter(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs bg-[#fbfbf9] border border-[#e5e5de] rounded-lg outline-none font-semibold"
                    >
                      <option value="all">All Centers</option>
                      {uniqueCenters.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-[#8e8e70] font-bold">
                  <span>{filteredVolunteers.length} volunteers found</span>
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-[#5a5a40] hover:underline"
                  >
                    {filteredVolunteers.every(idObj => selectedVolIds.includes(idObj.id)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Checklist scrollable area */}
              <div className="flex-1 overflow-y-auto border border-[#e5e5de] rounded-xl bg-[#fbfbf9] p-2 space-y-1.5">
                {filteredVolunteers.length === 0 ? (
                  <p className="text-center text-xs text-[#8e8e70] py-8 italic">No volunteers match filters.</p>
                ) : (
                  filteredVolunteers.map(v => {
                    const isSelected = selectedVolIds.includes(v.id);
                    const assignmentInfo = getVolAssignmentInfo(v.id);
                    const isCommCenter = commCenters.includes(v.center);
                    return (
                      <div
                        key={v.id}
                        onClick={() => handleToggleVolunteer(v.id)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#5a5a40]/10 border-[#5a5a40]'
                            : 'bg-white border-[#e5e5de] hover:bg-[#f5f5f0]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by div click
                          className="mt-0.5 accent-[#5a5a40]"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs font-bold text-[#1a1a1a] truncate">{v.name}</p>
                          <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-[#8e8e70] mt-0.5">
                            <span className="font-mono">{v.mobile}</span>
                            <span>•</span>
                            <span className={`px-1 rounded-sm ${isCommCenter ? 'bg-[#5a5a40]/25 text-[#5a5a40] font-bold' : ''}`}>
                              {v.center || 'No Center'}
                            </span>
                          </div>
                          {assignmentInfo && (
                            <p className="text-[9px] text-[#a36b5e] font-bold mt-1 bg-[#a36b5e]/10 px-1.5 py-0.5 rounded inline-block">
                              ⚠️ Assigned to {assignmentInfo.committeeName} ({assignmentInfo.role})
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Role / Responsibility Configuration */}
            <div className="space-y-3 p-4 bg-[#fbfbf9] rounded-2xl border border-[#e5e5de] flex flex-col justify-between">
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-[#5a5a40] uppercase tracking-wider border-b border-[#e5e5de]/50 pb-1.5">
                  Bulk Assignment Options
                </h4>
                <div>
                  <label className="block text-[10px] font-extrabold text-[#8e8e70] uppercase tracking-wider mb-1">Role *</label>
                  <select value={bulkRole} onChange={e => setBulkRole(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] outline-none text-xs font-medium appearance-none">
                    <option value="Sanyojak">Sanyojak</option>
                    <option value="Nirdeshak">Nirdeshak</option>
                    <option value="Nirikshak">Nirikshak</option>
                    <option value="Leader">Leader</option>
                    <option value="Svaymsevak">Svaymsevak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[#8e8e70] uppercase tracking-wider mb-1">Common Responsibility</label>
                  <input type="text" placeholder="e.g. Stage Decoration" value={bulkResponsibility} onChange={e => setBulkResponsibility(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] outline-none text-xs font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[#8e8e70] uppercase tracking-wider mb-1">Common Notes</label>
                  <textarea placeholder="Specific tasks, schedules or notes..." value={bulkNotes} onChange={e => setBulkNotes(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] outline-none text-xs font-medium" rows={3} />
                </div>
              </div>

              <div className="bg-[#5a5a40]/5 p-3 rounded-xl border border-[#5a5a40]/15 text-[11px] text-[#5a5a40] font-medium leading-relaxed mt-2">
                Selected <span className="font-bold">{selectedVolIds.length}</span> volunteers to assign to <span className="font-bold">{committee?.name}</span> as <span className="font-bold">{bulkRole}</span>.
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-[#e5e5de] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-white border border-[#e5e5de] text-[#5a5a40] rounded-2xl font-bold hover:bg-[#f0f0e8] transition-colors text-xs">{t('cancel')}</button>
            <button type="submit" disabled={selectedVolIds.length === 0} className="px-6 py-2 bg-[#5a5a40] text-white rounded-2xl font-bold shadow-md hover:bg-[#4a4a35] transition-colors disabled:opacity-50 text-xs">
              Assign {selectedVolIds.length} Volunteers
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function BulkAddModal({ onClose }: { onClose: () => void }) {
  const { bulkAddVolunteers, language } = useAppContext();
  const t = (key: any) => getTranslation(language, key);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = text.split('\n').filter(l => l.trim());
    const newVols: Volunteer[] = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        id: generateId(),
        name: parts[0] || 'Unknown',
        mobile: parts[1] || '',
        memberId: parts[2] || '',
        center: parts[3] || ''
      };
    });
    bulkAddVolunteers(newVols);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t('bulkAdd')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-[#5a5a40] mb-4 bg-[#f0f0e8] p-4 rounded-xl border border-[#e5e5de] font-medium">
            {t('bulkAddInstructions')} (Name, Mobile, MemberID, Center)
          </p>
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-mono text-sm whitespace-pre transition-all" 
            rows={8} 
            placeholder="John Doe, 9876543210, M-123, Central"
          />
        </div>
        <div className="pt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-[#e5e5de] text-[#5a5a40] rounded-2xl font-bold hover:bg-[#f0f0e8] transition-colors">{t('cancel')}</button>
          <button type="submit" disabled={!text.trim()} className="px-6 py-2.5 bg-[#5a5a40] text-white rounded-2xl font-bold shadow-md hover:bg-[#4a4a35] transition-colors disabled:opacity-50">{t('save')}</button>
        </div>
      </form>
    </Modal>
  );
}

export function BulkAddCommitteeModal({ onClose }: { onClose: () => void }) {
  const { bulkAddCommittees, language } = useAppContext();
  const t = (key: any) => getTranslation(language, key);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = text.split('\n').filter(l => l.trim());
    const newComms: Committee[] = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        id: generateId(),
        name: parts[0] || 'Unknown',
        description: parts[1] || '',
        coordinator: '',
        leader: '',
        capacity: parseInt(parts[2]) || 0,
        sanyojakSant: '',
        program: '',
        sanyojakVolunteers: [],
        nirikshakVolunteers: []
      };
    });
    bulkAddCommittees(newComms);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Bulk Add Committees">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-[#5a5a40] mb-4 bg-[#f0f0e8] p-4 rounded-xl border border-[#e5e5de] font-medium">
            Paste one committee per line, comma separated:
            <br />
            Format: Name, Description, Capacity
          </p>
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            className="w-full px-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-[#1a1a1a] font-mono text-sm whitespace-pre transition-all" 
            rows={8} 
            placeholder="Main Stage, Stage setup team, 20"
          />
        </div>
        <div className="pt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-[#e5e5de] text-[#5a5a40] rounded-2xl font-bold hover:bg-[#f0f0e8] transition-colors">{t('cancel')}</button>
          <button type="submit" disabled={!text.trim()} className="px-6 py-2.5 bg-[#5a5a40] text-white rounded-2xl font-bold shadow-md hover:bg-[#4a4a35] transition-colors disabled:opacity-50">{t('save')}</button>
        </div>
      </form>
    </Modal>
  );
}

export function EventInfoModal({ onClose }: { onClose: () => void }) {
  const { 
    events, 
    currentEventId, 
    setCurrentEventId, 
    addEvent, 
    deleteEvent, 
    updateEvent, 
    copyEventData,
    language 
  } = useAppContext();
  const t = (key: any) => getTranslation(language, key);

  const activeEvent = events.find(e => e.id === currentEventId) || events[0];

  const [editName, setEditName] = useState(activeEvent.name);
  const [editDate, setEditDate] = useState(activeEvent.date);

  // Sync edits when active event changes
  useEffect(() => {
    setEditName(activeEvent.name);
    setEditDate(activeEvent.date);
  }, [currentEventId, activeEvent]);

  // New Event Form State
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [copySourceId, setCopySourceId] = useState('');

  // Manual Copy State
  const [manualCopySourceId, setManualCopySourceId] = useState('');

  const handleUpdateActive = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvent(activeEvent.id, editName, editDate);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addEvent(newName, newDate, copySourceId || undefined);
    setNewName('');
    setCopySourceId('');
  };

  const handleManualCopy = () => {
    if (!manualCopySourceId) return;
    if (window.confirm("Are you sure you want to copy all data from the selected event? This will overwrite committees, volunteers, and assignments of the current event.")) {
      copyEventData(manualCopySourceId, activeEvent.id);
      setManualCopySourceId('');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Manage Events & Programs">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        
        {/* All Events Selection list */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider">Select Active Event</h3>
          <div className="space-y-2">
            {events.map(ev => {
              const isActive = ev.id === currentEventId;
              return (
                <div key={ev.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isActive ? 'bg-[#5a5a40] text-white border-[#5a5a40]' : 'bg-[#fbfbf9] text-[#1a1a1a] border-[#e5e5de] hover:bg-[#f0f0e8]'}`}>
                  <button type="button" onClick={() => setCurrentEventId(ev.id)} className="flex-1 text-left min-w-0">
                    <p className="font-bold text-sm truncate">{ev.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-85">
                      <span>{ev.date}</span>
                      <span>•</span>
                      <span>{(ev.committees || []).length} Committees</span>
                      <span>•</span>
                      <span>{(ev.volunteers || []).length} Volunteers</span>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {isActive && (
                      <span className="text-[9px] font-bold bg-white text-[#5a5a40] px-2 py-0.5 rounded-full uppercase">
                        Active
                      </span>
                    )}
                    {events.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete event "${ev.name}"?`)) {
                            deleteEvent(ev.id);
                          }
                        }} 
                        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-red-500'}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit details of currently active event */}
        <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5de] space-y-3">
          <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider">Edit Active Event Details</h3>
          <form onSubmit={handleUpdateActive} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-[#8e8e70] uppercase tracking-wider mb-1">Event Name</label>
              <input required type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#8e8e70] uppercase tracking-wider mb-1">Date</label>
                <input required type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full py-2.5 bg-[#5a5a40] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#4a4a35] transition-colors">
                  Save Details
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Copy data from another event */}
        {events.length > 1 && (
          <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5de] space-y-2">
            <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider">Copy / Clone Event Data</h3>
            <p className="text-[10px] text-[#8e8e70] leading-snug">Clone all committees, volunteers, and assignments from another event into the active event ({activeEvent.name}). This will replace current event data.</p>
            <div className="flex gap-2 pt-1">
              <select value={manualCopySourceId} onChange={e => setManualCopySourceId(e.target.value)} className="flex-1 px-3 py-2 bg-white border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] text-xs font-medium outline-none">
                <option value="">-- Select Source Event --</option>
                {events.filter(e => e.id !== activeEvent.id).map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <button type="button" onClick={handleManualCopy} disabled={!manualCopySourceId} className="px-4 py-2 bg-[#5a5a40] text-white text-xs font-bold rounded-xl hover:bg-[#4a4a35] transition-colors disabled:opacity-50">
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Create new event */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5e5de] space-y-3">
          <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider">Create New Event</h3>
          <form onSubmit={handleCreateEvent} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-[#8e8e70] uppercase tracking-wider mb-1">New Event Name</label>
              <input required type="text" placeholder="e.g. Navratri Festival" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#8e8e70] uppercase tracking-wider mb-1">Event Date</label>
                <input required type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8e8e70] uppercase tracking-wider mb-1">Copy Data From</label>
                <select value={copySourceId} onChange={e => setCopySourceId(e.target.value)} className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] text-xs font-medium outline-none">
                  <option value="">None (Fresh)</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={!newName.trim()} className="w-full py-2.5 bg-[#5a5a40] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#4a4a35] transition-colors disabled:opacity-50">
              Create & Switch Event
            </button>
          </form>
        </div>

      </div>
      <div className="pt-4 border-t border-[#e5e5de] flex justify-end">
        <button type="button" onClick={onClose} className="px-6 py-2 bg-[#5a5a40] text-white rounded-xl font-bold hover:bg-[#4a4a35] transition-colors text-xs uppercase tracking-wider">Done</button>
      </div>
    </Modal>
  );
}
