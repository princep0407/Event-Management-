import React, { useState } from 'react';
import { AppProvider, useAppContext } from './store';
import { getTranslation } from './translations';
import Dashboard from './tabs/Dashboard';
import Committees from './tabs/Committees';
import Volunteers from './tabs/Volunteers';
import Structure from './tabs/Structure';
import ExportHub from './tabs/ExportHub';
import Auth from './components/Auth';
import { CommitteeModal, VolunteerModal, AssignModal, BulkAddModal, BulkAddCommitteeModal, EventInfoModal } from './components/Modals';
import { LayoutDashboard, Users, LayoutGrid, Network, Calendar, Languages, Trash2, Menu, LogOut, FileSpreadsheet } from 'lucide-react';

function AppContent() {
  const { language, setLanguage, eventInfo, committees, assignments, resetData, currentUser, logout } = useAppContext();
  const t = (key: any) => getTranslation(language, key);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'committees' | 'volunteers' | 'structure' | 'exports'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [modalState, setModalState] = useState<{
    type: 'none' | 'event' | 'committee' | 'volunteer' | 'assign' | 'bulkAdd' | 'bulkAddCommittee';
    id?: string;
  }>({ type: 'none' });

  const closeModals = () => setModalState({ type: 'none' });

  if (!currentUser) {
    return <Auth />;
  }

  const totalRequired = committees.reduce((sum, c) => sum + Number(c.capacity), 0);
  const totalAssigned = assignments.length;
  const progressPercent = totalRequired > 0 ? Math.min(100, (totalAssigned / totalRequired) * 100) : 0;

  const handleReset = () => {
    if (window.confirm(t('confirmReset'))) {
      resetData();
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'committees', icon: LayoutGrid, label: t('committees') },
    { id: 'volunteers', icon: Users, label: t('volunteers') },
    { id: 'structure', icon: Network, label: t('structure') },
    { id: 'exports', icon: FileSpreadsheet, label: t('reports') },
  ] as const;

  return (
    <div className="flex h-screen w-full bg-[#f5f5f0] text-[#1a1a1a] font-sans overflow-hidden">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      <aside className={`fixed inset-y-0 left-0 w-64 h-full bg-[#fbfbf9] border-r border-[#e5e5de] flex flex-col z-40 transform transition-transform duration-300 lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-[#e5e5de] flex justify-between items-center">
          <div>
            <h1 className="text-[#5a5a40] font-serif text-2xl font-bold leading-tight">
              {t('appTitle').split(' ').slice(0, -1).join(' ') || t('appTitle')}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#8e8e70] font-semibold mt-1">
              {t('appTitle').split(' ').slice(-1).join(' ')}
            </p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors ${
                  isActive ? 'bg-[#5a5a40] text-white shadow-md' : 'text-[#5a5a40] hover:bg-[#f0f0e8]'
                }`}
              >
                <Icon size={20} className={isActive ? 'opacity-80' : 'opacity-60'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-[#e5e5de] shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-[#8e8e70] font-bold mb-2">{t('capacity')}</p>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span>{Math.round(progressPercent)}% {t('full')}</span>
              <span>{totalAssigned}/{totalRequired}</span>
            </div>
            <div className="w-full h-2 bg-[#f0f0e8] rounded-full overflow-hidden">
              <div className="h-full bg-[#5a5a40] transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            className="w-full py-2.5 border border-[#a36b5e] text-[#a36b5e] text-xs font-bold uppercase rounded-2xl hover:bg-[#a36b5e]/5 transition-colors"
          >
            {t('resetData')}
          </button>

          <button 
            onClick={logout}
            className="w-full py-2.5 border border-dashed border-[#8e8e70] text-[#5a5a40] text-xs font-bold uppercase rounded-2xl hover:bg-[#f0f0e8] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>{language === 'gu' ? 'લોગ-આઉટ (Sign Out)' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-16 bg-white border-b border-[#e5e5de] px-4 lg:px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-[#5a5a40] hover:bg-[#f0f0e8] rounded-xl transition-colors">
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setModalState({ type: 'event' })}
              className="px-4 py-1.5 rounded-full bg-[#f5f5f0] border border-[#e5e5de] flex items-center space-x-2 text-[#5a5a40] hover:bg-[#ecece5] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#a36b5e] hidden sm:block"></span>
              <span className="font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-xs">{eventInfo.name}</span>
              <Calendar size={14} className="opacity-40 hidden sm:block" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setLanguage(language === 'gu' ? 'en' : 'gu')}
              className="flex items-center gap-2 px-3 py-1.5 text-[#5a5a40] hover:bg-[#f0f0e8] rounded-2xl font-medium transition-colors text-sm"
            >
              <Languages size={18} />
              {language === 'gu' ? 'English' : 'ગુજરાતી'}
            </button>
            
            {/* Interactive User Avatar Dropdown */}
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-[#5a5a40] text-white flex items-center justify-center font-bold text-sm tracking-wider uppercase shadow-sm cursor-pointer select-none">
                {currentUser?.name ? currentUser.name.charAt(0) : 'V'}
              </button>
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#e5e5de] shadow-xl py-2 hidden group-hover:block hover:block z-50 animate-in fade-in duration-200">
                <div className="px-4 py-2.5 border-b border-[#e5e5de]">
                  <p className="text-xs font-bold text-[#1a1a1a] truncate">{currentUser?.name}</p>
                  <p className="text-[10px] text-[#8e8e70] truncate mt-0.5">{currentUser?.email}</p>
                </div>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#a36b5e] hover:bg-red-50/70 transition-colors flex items-center gap-2 cursor-pointer mt-1"
                >
                  <LogOut size={14} />
                  {language === 'gu' ? 'લોગ-આઉટ (Sign Out)' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'dashboard' && (
              <Dashboard 
                onAddCommittee={() => setModalState({ type: 'committee' })}
                onAddVolunteer={() => setModalState({ type: 'volunteer' })}
              />
            )}
            {activeTab === 'committees' && (
              <Committees 
                onEditCommittee={(id) => setModalState({ type: 'committee', id })}
                onAssignVolunteer={(id) => setModalState({ type: 'assign', id })}
                onBulkAdd={() => setModalState({ type: 'bulkAddCommittee' })}
              />
            )}
            {activeTab === 'volunteers' && (
              <Volunteers 
                onEditVolunteer={(id) => setModalState({ type: 'volunteer', id })}
                onBulkAdd={() => setModalState({ type: 'bulkAdd' })}
              />
            )}
            {activeTab === 'structure' && <Structure />}
            {activeTab === 'exports' && <ExportHub />}
          </div>
        </div>
      </main>

      {modalState.type === 'event' && <EventInfoModal onClose={closeModals} />}
      {modalState.type === 'committee' && <CommitteeModal id={modalState.id} onClose={closeModals} />}
      {modalState.type === 'volunteer' && <VolunteerModal id={modalState.id} onClose={closeModals} />}
      {modalState.type === 'assign' && modalState.id && <AssignModal committeeId={modalState.id} onClose={closeModals} />}
      {modalState.type === 'bulkAdd' && <BulkAddModal onClose={closeModals} />}
      {modalState.type === 'bulkAddCommittee' && <BulkAddCommitteeModal onClose={closeModals} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
