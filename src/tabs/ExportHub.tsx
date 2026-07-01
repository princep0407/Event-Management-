import React, { useState } from 'react';
import { useAppContext } from '../store';
import { getTranslation } from '../translations';
import { downloadCSV } from '../utils';
import { 
  Printer, 
  Download, 
  Search, 
  Filter, 
  Users, 
  FileSpreadsheet, 
  Layers, 
  Award,
  BookOpen,
  Info,
  Network
} from 'lucide-react';

type ExportMode = 'committee-wise' | 'tree-structure' | 'only-committees' | 'roles-assignments' | 'center-wise';

export default function ExportHub() {
  const { language, eventInfo, committees, volunteers, assignments } = useAppContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [activeMode, setActiveMode] = useState<ExportMode>('committee-wise');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  const [selectedTreeCommittees, setSelectedTreeCommittees] = useState<string[]>([]);
  const [selectedTreeSanyojakSants, setSelectedTreeSanyojakSants] = useState<string[]>([]);
  const [selectedTreeLeaderSants, setSelectedTreeLeaderSants] = useState<string[]>([]);
  
  const [sanyojakSantSearch, setSanyojakSantSearch] = useState('');
  const [leaderSantSearch, setLeaderSantSearch] = useState('');
  const [committeeSearch, setCommitteeSearch] = useState('');

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [displayFields, setDisplayFields] = useState({
    sanyojakSant: true,
    leaderSant: true,
    sanyojak: true,
    nirikshak: true,
    leader: true,
    volunteer: true,
  });

  const [onlyCommCols, setOnlyCommCols] = useState({
    name: true,
    program: true,
    leaderSant: true,
    sanyojakSant: false,
    capacity: true,
    assigned: true,
    available: true,
    sanyojak: false,
    nirikshak: false,
    centers: false,
  });

  const handleOnlyCommColChange = (field: keyof typeof onlyCommCols) => {
    setOnlyCommCols(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleDisplayFieldChange = (field: keyof typeof displayFields) => {
    setDisplayFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const uniqueSanyojakSants = Array.from(new Set(committees.map(c => c.sanyojakSant).filter(Boolean))) as string[];
  const uniqueLeaderSants = Array.from(new Set(committees.map(c => c.leader).filter(Boolean))) as string[];

  const toggleTreeCommittee = (commId: string) => {
    setSelectedTreeCommittees(prev => 
      prev.includes(commId) ? prev.filter(id => id !== commId) : [...prev, commId]
    );
  };

  const toggleTreeSanyojakSant = (name: string) => {
    setSelectedTreeSanyojakSants(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const toggleTreeLeaderSant = (name: string) => {
    setSelectedTreeLeaderSants(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  // Helpers to get specific committee data
  const getCommitteeAssignments = (committeeId: string) => {
    return assignments.filter(a => a.committeeId === committeeId);
  };

  // Get volunteer info safely
  const getVolunteer = (volunteerId: string) => {
    return volunteers.find(v => v.id === volunteerId);
  };

  // 1. Export Excel: Committee-wise breakdown
  const handleExportCommitteeWiseExcel = () => {
    const headers = [
      language === 'gu' ? 'સમિતિનું નામ (Committee Name)' : 'Committee Name',
      language === 'gu' ? 'પ્રોગ્રામ (Program)' : 'Program',
      language === 'gu' ? 'સંત (Sant)' : 'Sanyojak Sant',
      language === 'gu' ? 'કુલ જરૂરિયાત (Capacity)' : 'Capacity',
      language === 'gu' ? 'સ્વયંસેવકનું નામ (Volunteer Name)' : 'Volunteer Name',
      language === 'gu' ? 'મોબાઇલ (Mobile)' : 'Mobile',
      language === 'gu' ? 'સભ્ય ID (Member ID)' : 'Member ID',
      language === 'gu' ? 'કેન્દ્ર (Center)' : 'Center',
      language === 'gu' ? 'હોદ્દો (Role)' : 'Role',
      language === 'gu' ? 'જવાબદારી (Responsibility)' : 'Responsibility',
      language === 'gu' ? 'નોંધ (Notes)' : 'Notes'
    ];

    const rows: string[][] = [];

    filteredCommittees.forEach(c => {
      const commAssigns = getCommitteeAssignments(c.id);
      if (commAssigns.length === 0) {
        // Even if empty, list the committee
        rows.push([
          c.name,
          c.program || '',
          c.sanyojakSant || '',
          String(c.capacity),
          language === 'gu' ? '(કોઈ ફાળવણી નથી)' : '(No volunteers assigned)',
          '', '', '', '', '', ''
        ]);
      } else {
        commAssigns.forEach(a => {
          const v = getVolunteer(a.volunteerId);
          rows.push([
            c.name,
            c.program || '',
            c.sanyojakSant || '',
            String(c.capacity),
            v ? v.name : 'Unknown',
            v ? v.mobile : '',
            v ? v.memberId : '',
            v ? v.center : '',
            a.role || '',
            a.responsibility || '',
            a.notes || ''
          ]);
        });
      }
    });

    const safeEventName = eventInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
    downloadCSV(`${safeEventName}_committee_wise_report.csv`, headers, rows);
  };

  // 2. Export Excel: Only Committee List
  const handleExportOnlyCommitteesExcel = () => {
    const headers: string[] = [];
    headers.push(language === 'gu' ? 'સમિતિનું નામ (Committee Name)' : 'Committee Name');
    
    if (onlyCommCols.program) {
      headers.push(language === 'gu' ? 'પ્રોગ્રામ (Program)' : 'Program');
    }
    if (onlyCommCols.leaderSant) {
      headers.push(language === 'gu' ? 'લીડર સંત (Leader Sant)' : 'Leader Sant');
    }
    if (onlyCommCols.sanyojakSant) {
      headers.push(language === 'gu' ? 'સંયોજક સંત (Sanyojak Sant)' : 'Sanyojak Sant');
    }
    if (onlyCommCols.capacity) {
      headers.push(language === 'gu' ? 'કુલ ક્ષમતા (Required)' : 'Required Capacity');
    }
    if (onlyCommCols.assigned) {
      headers.push(language === 'gu' ? 'સોંપાયેલ સંખ્યા (Assigned)' : 'Assigned Volunteers');
    }
    if (onlyCommCols.available) {
      headers.push(language === 'gu' ? 'બાકી જગ્યા (Remaining)' : 'Remaining Slots');
    }
    if (onlyCommCols.sanyojak) {
      headers.push(language === 'gu' ? 'સંયોજક (Sanyojak)' : 'Sanyojak Volunteers');
    }
    if (onlyCommCols.nirikshak) {
      headers.push(language === 'gu' ? 'નિરીક્ષક (Nirikshak)' : 'Nirikshak Volunteers');
    }
    if (onlyCommCols.centers) {
      headers.push(language === 'gu' ? 'કેન્દ્રો (Centers)' : 'Associated Centers');
    }

    const rows = filteredCommittees.map(c => {
      const commAssigns = getCommitteeAssignments(c.id);
      const remaining = Number(c.capacity) - commAssigns.length;
      
      const row: string[] = [];
      row.push(c.name);
      
      if (onlyCommCols.program) {
        row.push(c.program || '');
      }
      if (onlyCommCols.leaderSant) {
        row.push(c.leader || '');
      }
      if (onlyCommCols.sanyojakSant) {
        row.push(c.sanyojakSant || '');
      }
      if (onlyCommCols.capacity) {
        row.push(String(c.capacity));
      }
      if (onlyCommCols.assigned) {
        row.push(String(commAssigns.length));
      }
      if (onlyCommCols.available) {
        row.push(String(remaining >= 0 ? remaining : 0));
      }
      if (onlyCommCols.sanyojak) {
        const sNames = c.sanyojakVolunteers?.map(v => typeof v === 'string' ? v : v.name).join(', ') || '';
        row.push(sNames);
      }
      if (onlyCommCols.nirikshak) {
        const nNames = c.nirikshakVolunteers?.map(v => typeof v === 'string' ? v : v.name).join(', ') || '';
        row.push(nNames);
      }
      if (onlyCommCols.centers) {
        row.push((c.centers || []).join(', '));
      }
      
      return row;
    });

    const safeEventName = eventInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
    downloadCSV(`${safeEventName}_only_committees_list.csv`, headers, rows);
  };

  // 3. Export Excel: Roles & Assignments
  const handleExportRolesAssignmentsExcel = () => {
    const headers = [
      language === 'gu' ? 'સ્વયંસેવકનું નામ (Volunteer Name)' : 'Volunteer Name',
      language === 'gu' ? 'મોબાઇલ (Mobile)' : 'Mobile',
      language === 'gu' ? 'સભ્ય ID (Member ID)' : 'Member ID',
      language === 'gu' ? 'કેન્દ્ર (Center)' : 'Center',
      language === 'gu' ? 'સમિતિ (Committee)' : 'Committee Name',
      language === 'gu' ? 'હોદ્દો (Role)' : 'Assigned Role',
      language === 'gu' ? 'જવાબદારી (Responsibility)' : 'Responsibility',
      language === 'gu' ? 'નોંધ (Notes)' : 'Notes'
    ];

    const filteredAssigns = assignments.filter(a => {
      if (selectedRoleFilter !== 'all' && a.role !== selectedRoleFilter) return false;
      const c = committees.find(comm => comm.id === a.committeeId);
      
      // Advanced Filters
      if (selectedTreeCommittees.length > 0 && !selectedTreeCommittees.includes(a.committeeId)) return false;
      if (selectedTreeSanyojakSants.length > 0 && (!c || !c.sanyojakSant || !selectedTreeSanyojakSants.includes(c.sanyojakSant))) return false;
      if (selectedTreeLeaderSants.length > 0 && (!c || !c.leader || !selectedTreeLeaderSants.includes(c.leader))) return false;

      if (searchQuery) {
        const v = getVolunteer(a.volunteerId);
        const searchLower = searchQuery.toLowerCase();
        const matchesVol = v && (v.name.toLowerCase().includes(searchLower) || v.mobile.includes(searchLower) || v.memberId.toLowerCase().includes(searchLower));
        const matchesComm = c && c.name.toLowerCase().includes(searchLower);
        const matchesRole = a.role && a.role.toLowerCase().includes(searchLower);
        return matchesVol || matchesComm || matchesRole;
      }
      return true;
    });

    // Group filtered assignments by volunteerId
    const groupedMap: { [vid: string]: {
      volunteerName: string;
      mobile: string;
      memberId: string;
      center: string;
      committees: string[];
      roles: string[];
      responsibilities: string[];
      notes: string[];
    }} = {};

    filteredAssigns.forEach(a => {
      const v = getVolunteer(a.volunteerId);
      const c = committees.find(comm => comm.id === a.committeeId);
      if (!v) return;

      if (!groupedMap[a.volunteerId]) {
        groupedMap[a.volunteerId] = {
          volunteerName: v.name,
          mobile: v.mobile,
          memberId: v.memberId,
          center: v.center || '',
          committees: [],
          roles: [],
          responsibilities: [],
          notes: []
        };
      }

      if (c) groupedMap[a.volunteerId].committees.push(c.name);
      if (a.role) groupedMap[a.volunteerId].roles.push(a.role);
      if (a.responsibility) groupedMap[a.volunteerId].responsibilities.push(a.responsibility);
      if (a.notes) groupedMap[a.volunteerId].notes.push(a.notes);
    });

    const rows = Object.values(groupedMap).map(g => {
      return [
        g.volunteerName,
        g.mobile,
        g.memberId,
        g.center,
        g.committees.join('; '),
        g.roles.join('; '),
        g.responsibilities.join('; '),
        g.notes.join('; ')
      ];
    });

    const safeEventName = eventInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
    downloadCSV(`${safeEventName}_roles_assignments_report.csv`, headers, rows);
  };

  // 4. Export Excel: Center-wise Volunteers
  const handleExportCenterWiseExcel = () => {
    const headers = [
      language === 'gu' ? 'કેન્દ્ર (Center)' : 'Center',
      language === 'gu' ? 'સ્વયંસેવકનું નામ (Volunteer Name)' : 'Volunteer Name',
      language === 'gu' ? 'મોબાઇલ (Mobile)' : 'Mobile',
      language === 'gu' ? 'સભ્ય ID (Member ID)' : 'Member ID',
      language === 'gu' ? 'સમિતિઓ અને હોદ્દા (Committees & Roles)' : 'Committees & Roles'
    ];

    const filteredVols = volunteers.filter(v => {
      if (searchQuery) {
        const sLower = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(sLower);
        const matchesMobile = v.mobile.includes(sLower);
        const matchesMemberId = v.memberId && v.memberId.toLowerCase().includes(sLower);
        const matchesCenter = v.center && v.center.toLowerCase().includes(sLower);
        return matchesName || matchesMobile || matchesMemberId || matchesCenter;
      }
      return true;
    });

    const groupedByCenter: { [center: string]: typeof volunteers } = {};
    filteredVols.forEach(v => {
      const centerName = v.center || (language === 'gu' ? 'અન્ય' : 'Other');
      if (!groupedByCenter[centerName]) {
        groupedByCenter[centerName] = [];
      }
      groupedByCenter[centerName].push(v);
    });

    const rows: string[][] = [];
    const sortedCenters = Object.keys(groupedByCenter).sort((a, b) => a.localeCompare(b));

    sortedCenters.forEach(center => {
      groupedByCenter[center].forEach(v => {
        const volAssigns = assignments.filter(a => a.volunteerId === v.id);
        const committeeAndRoles = volAssigns.map(a => {
          const c = committees.find(comm => comm.id === a.committeeId);
          const cName = c ? c.name : 'Unknown';
          const rName = a.role ? ` (${a.role})` : '';
          return `${cName}${rName}`;
        }).join('; ');

        rows.push([
          center,
          v.name,
          v.mobile,
          v.memberId,
          committeeAndRoles || '-'
        ]);
      });
    });

    const safeEventName = eventInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
    downloadCSV(`${safeEventName}_centerwise_volunteers_report.csv`, headers, rows);
  };

  // Trigger browser print window (which uses print.css or Tailwind media print rules)
  const handlePrint = () => {
    window.print();
  };

  // Unique list of roles assigned across the system for the filter dropdown
  const uniqueRoles = Array.from(new Set(assignments.map(a => a.role).filter(Boolean))) as string[];

  // Filtered committees according to search query
  const filteredCommittees = committees.filter(c => {
    if (selectedTreeSanyojakSants.length > 0 && (!c.sanyojakSant || !selectedTreeSanyojakSants.includes(c.sanyojakSant))) return false;
    if (selectedTreeLeaderSants.length > 0 && (!c.leader || !selectedTreeLeaderSants.includes(c.leader))) return false;
    if (selectedTreeCommittees.length > 0 && !selectedTreeCommittees.includes(c.id)) return false;

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesComm = c.name.toLowerCase().includes(query) || (c.program && c.program.toLowerCase().includes(query));
    const matchesSanyojakSant = c.sanyojakSant && c.sanyojakSant.toLowerCase().includes(query);
    const matchesLeaderSant = c.leader && c.leader.toLowerCase().includes(query);
    
    // Check if any volunteer in this committee matches
    const commAssigns = getCommitteeAssignments(c.id);
    const matchesVol = commAssigns.some(a => {
      const v = getVolunteer(a.volunteerId);
      return v && (v.name.toLowerCase().includes(query) || v.mobile.includes(query));
    });

    return matchesComm || matchesSanyojakSant || matchesLeaderSant || matchesVol;
  });

  // Filtered assignments according to active filters and search query
  const filteredAssignments = assignments.filter(a => {
    if (selectedRoleFilter !== 'all' && a.role !== selectedRoleFilter) return false;
    
    const c = committees.find(comm => comm.id === a.committeeId);
    
    // Advanced Filters
    if (selectedTreeCommittees.length > 0 && !selectedTreeCommittees.includes(a.committeeId)) return false;
    if (selectedTreeSanyojakSants.length > 0 && (!c || !c.sanyojakSant || !selectedTreeSanyojakSants.includes(c.sanyojakSant))) return false;
    if (selectedTreeLeaderSants.length > 0 && (!c || !c.leader || !selectedTreeLeaderSants.includes(c.leader))) return false;

    if (searchQuery) {
      const v = getVolunteer(a.volunteerId);
      const sLower = searchQuery.toLowerCase();
      const matchesVol = v && (v.name.toLowerCase().includes(sLower) || v.mobile.includes(sLower));
      const matchesComm = c && c.name.toLowerCase().includes(sLower);
      const matchesRole = a.role && a.role.toLowerCase().includes(sLower);
      return matchesVol || matchesComm || matchesRole;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0 no-print">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif text-[#1a1a1a] font-medium leading-tight">
            {language === 'gu' ? 'નિકાસ અને રિપોર્ટ્સ' : 'Export & Reports'}
          </h2>
          <p className="text-[#8e8e70] font-medium mt-1 text-xs md:text-sm">
            {language === 'gu' 
              ? 'સમિતિ વાઇઝ પ્રિન્ટ અને એક્સેલ ડાઉનલોડ વિકલ્પો' 
              : 'Print & Excel Export Hub for Committees, Structure and Roles'}
          </p>
        </div>
      </div>

      {/* Control Tabs (Excel / Print options switching) - Hidden in Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#e5e5de] shadow-sm no-print">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setActiveMode('committee-wise'); setSearchQuery(''); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeMode === 'committee-wise'
                ? 'bg-[#5a5a40] text-white shadow-md'
                : 'text-[#5a5a40] hover:bg-[#f5f5f0]'
            }`}
          >
            <Layers size={16} />
            <span>{language === 'gu' ? 'સમિતિ વાઇઝ ડેટા' : 'Committee-Wise'}</span>
          </button>

          <button
            onClick={() => { setActiveMode('tree-structure'); setSearchQuery(''); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeMode === 'tree-structure'
                ? 'bg-[#5a5a40] text-white shadow-md'
                : 'text-[#5a5a40] hover:bg-[#f5f5f0]'
            }`}
          >
            <Network size={16} />
            <span>{language === 'gu' ? 'ટ્રી સ્ટ્રક્ચર' : 'Tree Structure'}</span>
          </button>

          <button
            onClick={() => { setActiveMode('only-committees'); setSearchQuery(''); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeMode === 'only-committees'
                ? 'bg-[#5a5a40] text-white shadow-md'
                : 'text-[#5a5a40] hover:bg-[#f5f5f0]'
            }`}
          >
            <BookOpen size={16} />
            <span>{language === 'gu' ? 'સમિતિઓની યાદી' : 'Only Committees List'}</span>
          </button>

          <button
            onClick={() => { setActiveMode('roles-assignments'); setSearchQuery(''); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeMode === 'roles-assignments'
                ? 'bg-[#5a5a40] text-white shadow-md'
                : 'text-[#5a5a40] hover:bg-[#f5f5f0]'
            }`}
          >
            <Award size={16} />
            <span>{language === 'gu' ? 'હોદ્દા વાઇઝ લિસ્ટ' : 'Committees with Roles'}</span>
          </button>

          <button
            onClick={() => { setActiveMode('center-wise'); setSearchQuery(''); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeMode === 'center-wise'
                ? 'bg-[#5a5a40] text-white shadow-md'
                : 'text-[#5a5a40] hover:bg-[#f5f5f0]'
            }`}
          >
            <Users size={16} />
            <span>{language === 'gu' ? 'કેન્દ્ર વાઇઝ લિસ્ટ' : 'Center-Wise List'}</span>
          </button>
        </div>

        {/* Global Print & Export PDF buttons */}
        <div className="flex gap-2">
          {activeMode === 'committee-wise' && (
            <button
              onClick={handleExportCommitteeWiseExcel}
              className="px-4 py-2.5 rounded-xl bg-[#5a5a40]/10 hover:bg-[#5a5a40]/20 text-[#5a5a40] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>Excel Export</span>
            </button>
          )}

          {activeMode === 'tree-structure' && (
            <button
              onClick={handleExportCommitteeWiseExcel}
              className="px-4 py-2.5 rounded-xl bg-[#5a5a40]/10 hover:bg-[#5a5a40]/20 text-[#5a5a40] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>Excel Export</span>
            </button>
          )}

          {activeMode === 'only-committees' && (
            <button
              onClick={handleExportOnlyCommitteesExcel}
              className="px-4 py-2.5 rounded-xl bg-[#5a5a40]/10 hover:bg-[#5a5a40]/20 text-[#5a5a40] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>Excel Export</span>
            </button>
          )}

          {activeMode === 'roles-assignments' && (
            <button
              onClick={handleExportRolesAssignmentsExcel}
              className="px-4 py-2.5 rounded-xl bg-[#5a5a40]/10 hover:bg-[#5a5a40]/20 text-[#5a5a40] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>Excel Export</span>
            </button>
          )}

          {activeMode === 'center-wise' && (
            <button
              onClick={handleExportCenterWiseExcel}
              className="px-4 py-2.5 rounded-xl bg-[#5a5a40]/10 hover:bg-[#5a5a40]/20 text-[#5a5a40] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>Excel Export</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#e5e5de] text-[#1a1a1a] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:bg-[#f0f0e8] transition-all cursor-pointer"
          >
            <Printer size={16} />
            <span>{language === 'gu' ? 'પ્રિન્ટ / PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search - Hidden in Print */}
      <div className="flex flex-col gap-4 no-print">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e70]" />
            <input
              type="text"
              placeholder={
                activeMode === 'committee-wise'
                  ? (language === 'gu' ? 'સમિતિ અથવા સ્વયંસેવક શોધો...' : 'Search committee or volunteer name...')
                  : activeMode === 'only-committees'
                    ? (language === 'gu' ? 'સમિતિ શોધો...' : 'Search committee...')
                    : (language === 'gu' ? 'નામ, સમિતિ અથવા હોદ્દો શોધો...' : 'Search name, committee or role...')
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#e5e5de] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a5a40]/20"
            />
          </div>

          {['tree-structure', 'committee-wise', 'only-committees', 'roles-assignments'].includes(activeMode) && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 font-bold text-sm transition-all ${
                showAdvancedFilters ? 'bg-[#5a5a40] text-white border-[#5a5a40]' : 'bg-white text-[#5a5a40] border-[#e5e5de] hover:bg-[#f5f5f0]'
              }`}
            >
              <Filter size={16} />
              <span>{language === 'gu' ? 'એડવાન્સ્ડ ફિલ્ટર્સ' : 'Advanced Filters'}</span>
            </button>
          )}

          {/* Roles dropdown filter (only visible on roles mode) */}
          {activeMode === 'roles-assignments' && (
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#e5e5de]">
              <Filter size={16} className="text-[#8e8e70]" />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-transparent text-sm font-bold text-[#5a5a40] focus:outline-none cursor-pointer"
              >
                <option value="all">{language === 'gu' ? 'બધા હોદ્દા (All Roles)' : 'All Roles'}</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {['tree-structure', 'committee-wise', 'only-committees', 'roles-assignments'].includes(activeMode) && showAdvancedFilters && (
          <div className="bg-white p-6 rounded-2xl border border-[#e5e5de] shadow-sm animate-in slide-in-from-top-2 duration-300">
            <h3 className="text-[#1a1a1a] font-bold mb-4">{language === 'gu' ? 'એડવાન્સ્ડ ફિલ્ટર્સ' : 'Advanced Filters'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Sanyojak Sants Panel */}
              <div className="flex flex-col h-[230px]">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider">
                    {language === 'gu' ? 'સંયોજક સંત' : 'Sanyojak Sant'}
                  </label>
                  {selectedTreeSanyojakSants.length > 0 && (
                    <button 
                      onClick={() => setSelectedTreeSanyojakSants([])}
                      className="text-[10px] font-bold text-[#5a5a40] hover:underline"
                    >
                      {language === 'gu' ? 'સાફ કરો' : 'Clear'}
                    </button>
                  )}
                </div>
                <div className="relative mb-2 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e70]" />
                  <input
                    type="text"
                    value={sanyojakSantSearch}
                    onChange={e => setSanyojakSantSearch(e.target.value)}
                    placeholder={language === 'gu' ? 'શોધો...' : 'Search...'}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5a5a40]/20"
                  />
                </div>
                <div className="bg-[#fbfbf9] border border-[#e5e5de] rounded-xl p-3 overflow-y-auto space-y-2 flex-1">
                  {uniqueSanyojakSants
                    .filter(name => name.toLowerCase().includes(sanyojakSantSearch.toLowerCase()))
                    .map(name => (
                      <label key={name} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedTreeSanyojakSants.includes(name)}
                          onChange={() => toggleTreeSanyojakSant(name)}
                          className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded focus:ring-[#5a5a40] focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm text-[#1a1a1a] group-hover:text-[#5a5a40] transition-colors font-medium">
                          {name}
                        </span>
                      </label>
                    ))}
                  {uniqueSanyojakSants.filter(name => name.toLowerCase().includes(sanyojakSantSearch.toLowerCase())).length === 0 && (
                    <div className="text-xs text-[#8e8e70] italic text-center pt-4">
                      {language === 'gu' ? 'કોઈ મળ્યું નથી' : 'No results found'}
                    </div>
                  )}
                </div>
              </div>

              {/* Leader Sants Panel */}
              <div className="flex flex-col h-[230px]">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider">
                    {language === 'gu' ? 'લીડર સંત' : 'Leader Sant'}
                  </label>
                  {selectedTreeLeaderSants.length > 0 && (
                    <button 
                      onClick={() => setSelectedTreeLeaderSants([])}
                      className="text-[10px] font-bold text-[#5a5a40] hover:underline"
                    >
                      {language === 'gu' ? 'સાફ કરો' : 'Clear'}
                    </button>
                  )}
                </div>
                <div className="relative mb-2 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e70]" />
                  <input
                    type="text"
                    value={leaderSantSearch}
                    onChange={e => setLeaderSantSearch(e.target.value)}
                    placeholder={language === 'gu' ? 'શોધો...' : 'Search...'}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5a5a40]/20"
                  />
                </div>
                <div className="bg-[#fbfbf9] border border-[#e5e5de] rounded-xl p-3 overflow-y-auto space-y-2 flex-1">
                  {uniqueLeaderSants
                    .filter(name => name.toLowerCase().includes(leaderSantSearch.toLowerCase()))
                    .map(name => (
                      <label key={name} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedTreeLeaderSants.includes(name)}
                          onChange={() => toggleTreeLeaderSant(name)}
                          className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded focus:ring-[#5a5a40] focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm text-[#1a1a1a] group-hover:text-[#5a5a40] transition-colors font-medium">
                          {name}
                        </span>
                      </label>
                    ))}
                  {uniqueLeaderSants.filter(name => name.toLowerCase().includes(leaderSantSearch.toLowerCase())).length === 0 && (
                    <div className="text-xs text-[#8e8e70] italic text-center pt-4">
                      {language === 'gu' ? 'કોઈ મળ્યું નથી' : 'No results found'}
                    </div>
                  )}
                </div>
              </div>

              {/* Committees Panel */}
              <div className="flex flex-col h-[230px]">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider">
                    {language === 'gu' ? 'સમિતિઓ પસંદ કરો' : 'Select Committees'}
                  </label>
                  {selectedTreeCommittees.length > 0 && (
                    <button 
                      onClick={() => setSelectedTreeCommittees([])}
                      className="text-[10px] font-bold text-[#5a5a40] hover:underline"
                    >
                      {language === 'gu' ? 'સાફ કરો' : 'Clear'}
                    </button>
                  )}
                </div>
                <div className="relative mb-2 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e70]" />
                  <input
                    type="text"
                    value={committeeSearch}
                    onChange={e => setCommitteeSearch(e.target.value)}
                    placeholder={language === 'gu' ? 'સમિતિ અથવા લીડર સંત શોધો...' : 'Search committee or leader sant...'}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5a5a40]/20"
                  />
                </div>
                <div className="bg-[#fbfbf9] border border-[#e5e5de] rounded-xl p-3 overflow-y-auto space-y-2 flex-1">
                  {committees
                    .filter(c => c.name.toLowerCase().includes(committeeSearch.toLowerCase()) || (c.leader && c.leader.toLowerCase().includes(committeeSearch.toLowerCase())))
                    .map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedTreeCommittees.includes(c.id)}
                          onChange={() => toggleTreeCommittee(c.id)}
                          className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded focus:ring-[#5a5a40] focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm text-[#1a1a1a] group-hover:text-[#5a5a40] transition-colors font-medium">
                          {c.name} {c.leader ? `(${c.leader})` : ''}
                        </span>
                      </label>
                    ))}
                  {committees.filter(c => c.name.toLowerCase().includes(committeeSearch.toLowerCase()) || (c.leader && c.leader.toLowerCase().includes(committeeSearch.toLowerCase()))).length === 0 && (
                    <div className="text-xs text-[#8e8e70] italic text-center pt-4">
                      {language === 'gu' ? 'કોઈ મળ્યું નથી' : 'No results found'}
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="mt-6 pt-6 border-t border-[#e5e5de]">
              <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider mb-3">
                {language === 'gu' ? 'દર્શાવવાની વિગતો પસંદ કરો' : 'Select Details to Display'}
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'sanyojakSant', labelEn: 'Sanyojak Sant', labelGu: 'સંયોજક સંત' },
                  { key: 'leaderSant', labelEn: 'Leader Sant', labelGu: 'લીડર સંત' },
                  { key: 'sanyojak', labelEn: 'Sanyojak', labelGu: 'સંયોજક' },
                  { key: 'nirikshak', labelEn: 'Nirikshak', labelGu: 'નિરીક્ષક' },
                  { key: 'leader', labelEn: 'Leader', labelGu: 'લીડર' },
                  { key: 'volunteer', labelEn: 'Volunteer', labelGu: 'સ્વયંસેવક' },
                ].map(field => (
                  <label key={field.key} className="flex items-center gap-2 cursor-pointer group bg-[#fbfbf9] px-3 py-2 rounded-lg border border-[#e5e5de] hover:bg-[#f0f0e8] transition-colors">
                    <input 
                      type="checkbox" 
                      checked={displayFields[field.key as keyof typeof displayFields]}
                      onChange={() => handleDisplayFieldChange(field.key as keyof typeof displayFields)}
                      className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded focus:ring-[#5a5a40] focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium text-[#1a1a1a]">
                      {language === 'gu' ? field.labelGu : field.labelEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ----------------- RENDER MODE 1: COMMITTEE-WISE REPORT ----------------- */}
      {activeMode === 'committee-wise' && (
        <div className="space-y-8">
          
          {/* Visual Guideline Info Banner (No Print) */}
          <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5de] flex items-start gap-3 text-[#5a5a40] text-xs leading-relaxed no-print">
            <Info size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {language === 'gu' ? 'સમિતિ વાઇઝ પ્રિન્ટિંગ માર્ગદર્શિકા' : 'Committee-Wise Printing Instructions'}
              </p>
              <p className="mt-0.5 text-[#8e8e70]">
                {language === 'gu' 
                  ? 'આ મોડ દરેક સમિતિને તેના તમામ ફાળવેલ સ્વયંસેવકો સાથે દર્શાવે છે. જ્યારે તમે "પ્રિન્ટ / PDF" બટન દબાવો છો, ત્યારે તે સ્વચ્છ અને વાંચવાલાયક ટેબલ ફોર્મેટમાં પ્રિન્ટ થશે.'
                  : 'This report lists each committee with its complete list of assigned volunteers. Printing this view formats each committee beautifully into structured tables.'}
              </p>
            </div>
          </div>

          {/* Printable Container */}
          <div className="print-section space-y-8 bg-white md:p-8 rounded-[32px] border border-[#e5e5de] shadow-sm">
            {/* Print Header (Only visible when printing) */}
            <div className="hidden print-only-header text-center pb-6 border-b-2 border-double border-[#5a5a40] mb-6">
              <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">{eventInfo.name}</h1>
              <p className="text-sm font-bold text-[#8e8e70] uppercase tracking-widest mt-1">
                {language === 'gu' ? 'સમિતિ વાઇઝ સ્વયંસેવક સ્ટ્રક્ચર અને જવાબદારીઓ' : 'Committee-Wise Volunteer Structure & Responsibilities'}
              </p>
              <p className="text-xs text-[#8e8e70] mt-1">{eventInfo.date}</p>
            </div>

            {filteredCommittees.length === 0 ? (
              <div className="text-center py-12 text-[#8e8e70]">
                {language === 'gu' ? 'કોઈ સમિતિ મળી નથી.' : 'No committees found matching your criteria.'}
              </div>
            ) : (
              filteredCommittees.map((c, index) => {
                const commAssigns = getCommitteeAssignments(c.id);
                
                return (
                  <div key={c.id} className="border border-[#e5e5de] rounded-2xl overflow-hidden shadow-sm page-break-after-avoid">
                    {/* Committee Header Banner */}
                    <div className="bg-[#fbfbf9] px-6 py-4 border-b border-[#e5e5de] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#5a5a40] text-white text-xs font-bold font-mono">
                            {index + 1}
                          </span>
                          <h3 className="text-lg font-serif font-bold text-[#1a1a1a]">{c.name}</h3>
                        </div>
                        
                        {/* Sub details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8e8e70] font-semibold mt-1">
                          {c.program && (
                            <span>
                              {language === 'gu' ? 'પ્રોગ્રામ' : 'Program'}: <span className="text-[#1a1a1a]">{c.program}</span>
                            </span>
                          )}
                          {c.leader && (
                            <span>
                              {language === 'gu' ? 'લીડર સંત' : 'Leader Sant'}: <span className="text-[#1a1a1a]">{c.leader}</span>
                            </span>
                          )}
                          {c.sanyojakSant && (
                            <span>
                              {language === 'gu' ? 'સંયોજક સંત' : 'Sanyojak Sant'}: <span className="text-[#1a1a1a]">{c.sanyojakSant}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Capacity counts */}
                      <div className="text-xs font-bold px-3 py-1 rounded-lg bg-[#e5e5de] text-[#5a5a40] shrink-0">
                        {language === 'gu' ? 'ફાળવેલ' : 'Assigned'}: {commAssigns.length} / {c.capacity}
                      </div>
                    </div>

                    {/* Table of Members */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-[#f0f0e8]/30 border-b border-[#e5e5de] text-[#8e8e70] font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                            <th className="px-6 py-3 w-12 text-center">No.</th>
                            <th className="px-6 py-3">{language === 'gu' ? 'નામ' : 'Volunteer Name'}</th>
                            <th className="px-6 py-3">{language === 'gu' ? 'કેન્દ્ર' : 'Center'}</th>
                            <th className="px-6 py-3">{language === 'gu' ? 'હોદ્દો' : 'Role'}</th>
                            <th className="px-6 py-3">{language === 'gu' ? 'જવાબદારી' : 'Responsibility'}</th>
                            <th className="px-6 py-3">{language === 'gu' ? 'સંપર્ક' : 'Mobile / ID'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e5de]">
                          {commAssigns.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-6 text-center text-[#8e8e70] italic">
                                {language === 'gu' ? 'હજુ કોઈ સ્વયંસેવક સોંપાયેલ નથી.' : 'No volunteers assigned to this committee yet.'}
                              </td>
                            </tr>
                          ) : (
                            commAssigns.map((a, idx) => {
                              const v = getVolunteer(a.volunteerId);
                              return (
                                <tr key={a.id} className="hover:bg-[#fbfbf9]/50 transition-colors">
                                  <td className="px-6 py-3 text-center text-[#8e8e70] font-mono font-medium">{idx + 1}</td>
                                  <td className="px-6 py-3 font-bold text-[#1a1a1a]">{v ? v.name : 'Unknown'}</td>
                                  <td className="px-6 py-3">
                                    <span className="px-2 py-0.5 rounded bg-[#f0f0e8] text-[#5a5a40] font-medium text-[10px]">
                                      {v ? v.center : '-'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3">
                                    {a.role ? (
                                      <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold uppercase text-[9px] tracking-wider">
                                        {a.role}
                                      </span>
                                    ) : (
                                      <span className="text-[#8e8e70]">-</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-3 text-[#5a5a40] font-medium">{a.responsibility || '-'}</td>
                                  <td className="px-6 py-3 text-[#8e8e70] font-mono text-[11px]">
                                    <div>{v ? v.mobile : '-'}</div>
                                    {v?.memberId && <div className="text-[9px] opacity-75">ID: {v.memberId}</div>}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}


      {/* ----------------- RENDER MODE: TREE STRUCTURE ----------------- */}
      {activeMode === 'tree-structure' && (
        <div className="space-y-8">
          
          <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5de] flex items-start gap-3 text-[#5a5a40] text-xs leading-relaxed no-print">
            <Info size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {language === 'gu' ? 'સમિતિ ટ્રી સ્ટ્રક્ચર પ્રિન્ટિંગ' : 'Committee Tree Structure'}
              </p>
              <p className="mt-0.5 text-[#8e8e70]">
                {language === 'gu' 
                  ? 'આ વ્યુ સમિતિના હોદ્દેદારો અને સ્વયંસેવકોને વંશવેલા (Tree) સ્વરૂપમાં દર્શાવે છે.'
                  : 'This view displays the committee members in a hierarchical tree structure format.'}
              </p>
            </div>
          </div>

          <div className="print-section space-y-8 bg-white md:p-8 rounded-[32px] border border-[#e5e5de] shadow-sm">
            <div className="hidden print-only-header text-center pb-6 border-b-2 border-double border-[#5a5a40] mb-6">
              <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">{eventInfo.name}</h1>
              <p className="text-sm font-bold text-[#8e8e70] uppercase tracking-widest mt-1">
                {language === 'gu' ? 'સમિતિ ટ્રી સ્ટ્રક્ચર' : 'Committee Tree Structure'}
              </p>
              <p className="text-xs text-[#8e8e70] mt-1">{eventInfo.date}</p>
            </div>

            {filteredCommittees.length === 0 ? (
              <div className="text-center py-12 text-[#8e8e70]">
                {language === 'gu' ? 'કોઈ સમિતિ મળી નથી.' : 'No committees found matching your criteria.'}
              </div>
            ) : (
              <div className="space-y-12">
                {(() => {
                  const shouldShowSanyojakSantGroup = displayFields.sanyojakSant && selectedTreeLeaderSants.length === 0 && !(selectedTreeCommittees.length > 0 && selectedTreeSanyojakSants.length === 0);
                  const shouldShowLeaderSantGroup = displayFields.leaderSant && !(selectedTreeCommittees.length > 0 && selectedTreeSanyojakSants.length === 0 && selectedTreeLeaderSants.length === 0);

                  const renderCommittee = (c: typeof committees[0]) => {
                    const commAssigns = getCommitteeAssignments(c.id);
                    const leaderAssigns = commAssigns.filter(a => a.role && a.role.toLowerCase().includes(language === 'gu' ? 'લીડર' : 'leader'));
                    const otherAssigns = commAssigns.filter(a => !(a.role && a.role.toLowerCase().includes(language === 'gu' ? 'લીડર' : 'leader')));

                    return (
                      <div key={c.id} className="border border-[#e5e5de] rounded-2xl p-5 shadow-sm page-break-inside-avoid bg-white">
                        <h3 className="text-lg font-serif font-bold text-[#1a1a1a] border-b border-[#e5e5de] pb-2 mb-3">{c.name}</h3>
                        
                        {((displayFields.sanyojakSant && !shouldShowSanyojakSantGroup) || (displayFields.leaderSant && !shouldShowLeaderSantGroup)) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#8e8e70] font-semibold mb-4 bg-[#fbfbf9] px-3 py-2 rounded-xl border border-[#e5e5de]">
                            {displayFields.sanyojakSant && !shouldShowSanyojakSantGroup && c.sanyojakSant && (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5a5a40]/60"></span>
                                <span>{language === 'gu' ? 'સંયોજક સંત:' : 'Sanyojak Sant:'} <span className="text-[#1a1a1a] font-bold">{c.sanyojakSant}</span></span>
                              </div>
                            )}
                            {displayFields.leaderSant && !shouldShowLeaderSantGroup && c.leader && (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5a5a40]/60"></span>
                                <span>{language === 'gu' ? 'લીડર સંત:' : 'Leader Sant:'} <span className="text-[#1a1a1a] font-bold">{c.leader}</span></span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          
                          {displayFields.sanyojak && c.sanyojakVolunteers && c.sanyojakVolunteers.length > 0 && (
                            <div className="relative">
                              <div className="absolute -left-3 top-3 w-2 border-t-2 border-[#e5e5de]"></div>
                              <div className="bg-[#fbfbf9] inline-block px-3 py-1.5 rounded-lg border border-[#e5e5de]">
                                <span className="text-xs text-[#8e8e70] font-bold uppercase tracking-wider block mb-0.5">{language === 'gu' ? 'સંયોજક' : 'Sanyojak'}</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {c.sanyojakVolunteers.map((v, i) => {
                                    const name = typeof v === 'string' ? v : v.name;
                                    const mobile = typeof v === 'string' ? '' : v.mobile;
                                    return (
                                      <span key={i} className="text-sm font-bold text-[#5a5a40] bg-white px-2 py-0.5 rounded shadow-sm border border-[#e5e5de]">
                                        {name} {mobile && <span className="text-xs text-[#8e8e70] font-mono font-normal">({mobile})</span>}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {displayFields.nirikshak && c.nirikshakVolunteers && c.nirikshakVolunteers.length > 0 && (
                            <div className="relative">
                              <div className="absolute -left-3 top-3 w-2 border-t-2 border-[#e5e5de]"></div>
                              <div className="bg-[#fbfbf9] inline-block px-3 py-1.5 rounded-lg border border-[#e5e5de]">
                                <span className="text-xs text-[#8e8e70] font-bold uppercase tracking-wider block mb-0.5">{language === 'gu' ? 'નિરીક્ષક' : 'Nirikshak'}</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {c.nirikshakVolunteers.map((v, i) => {
                                    const name = typeof v === 'string' ? v : v.name;
                                    const mobile = typeof v === 'string' ? '' : v.mobile;
                                    return (
                                      <span key={i} className="text-sm font-bold text-[#5a5a40] bg-white px-2 py-0.5 rounded shadow-sm border border-[#e5e5de]">
                                        {name} {mobile && <span className="text-xs text-[#8e8e70] font-mono font-normal">({mobile})</span>}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {displayFields.leader && leaderAssigns.length > 0 && (
                            <div className="relative">
                              <div className="absolute -left-3 top-3 w-2 border-t-2 border-[#e5e5de]"></div>
                              <div>
                                <span className="text-xs text-[#8e8e70] font-bold uppercase tracking-wider inline-block mb-1.5 bg-white px-1 relative -left-1">{language === 'gu' ? 'લીડર' : 'Leader'}</span>
                                <div className="pl-2 border-l border-[#e5e5de] space-y-2 ml-1">
                                  {leaderAssigns.map(a => {
                                    const v = getVolunteer(a.volunteerId);
                                    return (
                                      <div key={a.id} className="relative text-sm text-[#1a1a1a] flex items-center gap-2">
                                        <div className="absolute -left-2 top-1/2 w-1.5 border-t border-[#e5e5de]"></div>
                                        <span className="font-bold pl-1">{v ? v.name : 'Unknown'}</span>
                                        {v?.mobile && <span className="text-[10px] text-[#8e8e70] font-mono bg-[#f0f0e8] px-1.5 py-0.5 rounded">{v.mobile}</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {displayFields.volunteer && otherAssigns.length > 0 && (
                            <div className="relative">
                              <div className="absolute -left-3 top-3 w-2 border-t-2 border-[#e5e5de]"></div>
                              <div>
                                <span className="text-xs text-[#8e8e70] font-bold uppercase tracking-wider inline-block mb-1.5 bg-white px-1 relative -left-1">{language === 'gu' ? 'સ્વયંસેવકો' : 'Svaymsevaks'}</span>
                                <div className="pl-2 border-l border-[#e5e5de] space-y-2 ml-1">
                                  {otherAssigns.map(a => {
                                    const v = getVolunteer(a.volunteerId);
                                    return (
                                      <div key={a.id} className="relative text-sm text-[#1a1a1a] flex items-center flex-wrap gap-2">
                                        <div className="absolute -left-2 top-2.5 w-1.5 border-t border-[#e5e5de]"></div>
                                        <span className="font-medium pl-1">{v ? v.name : 'Unknown'}</span>
                                        {v?.mobile && <span className="text-[10px] text-[#8e8e70] font-mono bg-[#f0f0e8] px-1.5 py-0.5 rounded">{v.mobile}</span>}
                                        {a.responsibility && <span className="text-[10px] text-[#8e8e70] truncate max-w-[120px]">- {a.responsibility}</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  };

                  const renderCommitteesList = (comms: typeof committees) => (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {comms.map(c => renderCommittee(c))}
                    </div>
                  );

                  const renderLeaderSantLevel = (comms: typeof committees) => {
                    if (shouldShowLeaderSantGroup) {
                      return (
                        <div className="space-y-8">
                          {Array.from(new Set(comms.map(c => c.leader || 'UNASSIGNED'))).map(lSant => {
                            const lSantComms = comms.filter(c => (c.leader || 'UNASSIGNED') === lSant);
                            return (
                              <div key={lSant} className="page-break-inside-avoid-group">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-6 h-px bg-[#5a5a40]/30"></div>
                                  <div className="bg-[#f0f0e8] border border-[#e5e5de] text-[#5a5a40] px-4 py-1.5 rounded-lg font-bold text-base shadow-sm">
                                    {language === 'gu' ? 'લીડર સંત:' : 'Leader Sant:'} {lSant === 'UNASSIGNED' ? (language === 'gu' ? 'અન્ય (કોઈ નહીં)' : 'Unassigned') : lSant}
                                  </div>
                                </div>
                                <div className="pl-8 md:pl-12 border-l border-[#5a5a40]/10">
                                  {renderCommitteesList(lSantComms)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      return renderCommitteesList(comms);
                    }
                  };

                  const renderSanyojakSantLevel = (comms: typeof committees) => {
                    if (shouldShowSanyojakSantGroup) {
                      return (
                        <div className="space-y-12">
                          {Array.from(new Set(comms.map(c => c.sanyojakSant || 'UNASSIGNED'))).map(sSant => {
                            const sSantComms = comms.filter(c => (c.sanyojakSant || 'UNASSIGNED') === sSant);
                            return (
                              <div key={sSant} className="page-break-inside-avoid-group">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="bg-[#5a5a40] text-white px-4 py-2 rounded-xl font-bold text-lg shadow-sm">
                                    {language === 'gu' ? 'સંયોજક સંત:' : 'Sanyojak Sant:'} {sSant === 'UNASSIGNED' ? (language === 'gu' ? 'અન્ય (કોઈ નહીં)' : 'Unassigned') : sSant}
                                  </div>
                                </div>
                                <div className="pl-6 md:pl-10 border-l-2 border-[#5a5a40]/20">
                                  {renderLeaderSantLevel(sSantComms)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      return renderLeaderSantLevel(comms);
                    }
                  };

                  return renderSanyojakSantLevel(filteredCommittees);
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- RENDER MODE 2: ONLY COMMITTEE LIST ----------------- */}
      {activeMode === 'only-committees' && (
        <div className="space-y-6">
          
          <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5de] flex items-start gap-3 text-[#5a5a40] text-xs leading-relaxed no-print">
            <Info size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {language === 'gu' ? 'ફક્ત સમિતિઓની સૂચિ નિકાસ' : 'Only Committees List Export'}
              </p>
              <p className="mt-0.5 text-[#8e8e70]">
                {language === 'gu' 
                  ? 'આ મોડ ફક્ત સમિતિઓ, તેમના હોદ્દેદાર સંતો, પ્રોગ્રામ્સ, અને સ્વયંસેવક ક્ષમતાના આંકડાઓ દર્શાવે છે (સ્વયંસેવકોના નામ વગર).'
                  : 'This report lists only the committees themselves with their meta information, program, sanyojak sant, and registration counts.'}
              </p>
            </div>
          </div>

          {/* Columns Customizer */}
          <div className="bg-[#fbfbf9] p-5 rounded-2xl border border-[#e5e5de] no-print">
            <span className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider block mb-3">
              {language === 'gu' ? 'રિપોર્ટ કૉલમ પસંદ કરો' : 'Select Columns to Display & Export'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={true} disabled className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded opacity-60 cursor-not-allowed" />
                <span className="text-sm text-[#1a1a1a] font-medium opacity-70">
                  {language === 'gu' ? 'સમિતિનું નામ' : 'Committee Name'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyCommCols.program} onChange={() => handleOnlyCommColChange('program')} className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded cursor-pointer" />
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === 'gu' ? 'પ્રોગ્રામ' : 'Program'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyCommCols.leaderSant} onChange={() => handleOnlyCommColChange('leaderSant')} className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded cursor-pointer" />
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === 'gu' ? 'લીડર સંત' : 'Leader Sant'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyCommCols.sanyojakSant} onChange={() => handleOnlyCommColChange('sanyojakSant')} className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded cursor-pointer" />
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === 'gu' ? 'સંયોજક સંત' : 'Sanyojak Sant'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyCommCols.capacity} onChange={() => handleOnlyCommColChange('capacity')} className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded cursor-pointer" />
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === 'gu' ? 'જરૂરી ક્ષમતા' : 'Capacity'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyCommCols.assigned} onChange={() => handleOnlyCommColChange('assigned')} className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded cursor-pointer" />
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === 'gu' ? 'ફાળવેલ' : 'Assigned'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyCommCols.available} onChange={() => handleOnlyCommColChange('available')} className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded cursor-pointer" />
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === 'gu' ? 'બાકી જગ્યા' : 'Available'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyCommCols.sanyojak} onChange={() => handleOnlyCommColChange('sanyojak')} className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded cursor-pointer" />
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === 'gu' ? 'સંયોજકો' : 'Sanyojak'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyCommCols.nirikshak} onChange={() => handleOnlyCommColChange('nirikshak')} className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded cursor-pointer" />
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === 'gu' ? 'નિરીક્ષકો' : 'Nirikshak'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyCommCols.centers} onChange={() => handleOnlyCommColChange('centers')} className="w-4 h-4 text-[#5a5a40] border-[#e5e5de] rounded cursor-pointer" />
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === 'gu' ? 'કેન્દ્રો' : 'Centers'}
                </span>
              </label>
            </div>
          </div>

          <div className="print-section bg-white p-6 md:p-8 rounded-[32px] border border-[#e5e5de] shadow-sm overflow-hidden">
            {/* Print Only Header */}
            <div className="hidden print-only-header text-center pb-6 border-b-2 border-double border-[#5a5a40] mb-6">
              <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">{eventInfo.name}</h1>
              <p className="text-sm font-bold text-[#8e8e70] uppercase tracking-widest mt-1">
                {language === 'gu' ? 'કુલ સમિતિઓની સૂચિ અને વર્તમાન સ્થિતિ' : 'Event Committees Structure & Status Summary'}
              </p>
              <p className="text-xs text-[#8e8e70] mt-1">{eventInfo.date}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#f5f5f0] border-b border-[#e5e5de] text-[#8e8e70] font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                    <th className="px-6 py-4 w-12 text-center">No.</th>
                    <th className="px-6 py-4">{language === 'gu' ? 'સમિતિનું નામ' : 'Committee Name'}</th>
                    {onlyCommCols.program && <th className="px-6 py-4">{language === 'gu' ? 'પ્રોગ્રામ' : 'Program'}</th>}
                    {onlyCommCols.leaderSant && <th className="px-6 py-4">{language === 'gu' ? 'લીડર સંત' : 'Leader Sant'}</th>}
                    {onlyCommCols.sanyojakSant && <th className="px-6 py-4">{language === 'gu' ? 'સંયોજક સંત' : 'Sanyojak Sant'}</th>}
                    {onlyCommCols.capacity && <th className="px-6 py-4 text-center">{language === 'gu' ? 'જરૂરી ક્ષમતા' : 'Capacity'}</th>}
                    {onlyCommCols.assigned && <th className="px-6 py-4 text-center">{language === 'gu' ? 'ફાળવેલ' : 'Assigned'}</th>}
                    {onlyCommCols.available && <th className="px-6 py-4 text-center">{language === 'gu' ? 'બાકી જગ્યા' : 'Available'}</th>}
                    {onlyCommCols.sanyojak && <th className="px-6 py-4">{language === 'gu' ? 'સંયોજકો' : 'Sanyojak'}</th>}
                    {onlyCommCols.nirikshak && <th className="px-6 py-4">{language === 'gu' ? 'નિરીક્ષકો' : 'Nirikshak'}</th>}
                    {onlyCommCols.centers && <th className="px-6 py-4">{language === 'gu' ? 'કેન્દ્રો' : 'Centers'}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5de]">
                  {filteredCommittees.length === 0 ? (
                    <tr>
                      <td 
                        colSpan={
                          2 + 
                          (onlyCommCols.program ? 1 : 0) + 
                          (onlyCommCols.leaderSant ? 1 : 0) + 
                          (onlyCommCols.sanyojakSant ? 1 : 0) + 
                          (onlyCommCols.capacity ? 1 : 0) + 
                          (onlyCommCols.assigned ? 1 : 0) + 
                          (onlyCommCols.available ? 1 : 0) + 
                          (onlyCommCols.sanyojak ? 1 : 0) + 
                          (onlyCommCols.nirikshak ? 1 : 0) + 
                          (onlyCommCols.centers ? 1 : 0)
                        } 
                        className="px-6 py-8 text-center text-[#8e8e70]"
                      >
                        {language === 'gu' ? 'કોઈ સમિતિ મળી નથી.' : 'No committees found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCommittees.map((c, idx) => {
                      const commAssigns = getCommitteeAssignments(c.id);
                      const assigned = commAssigns.length;
                      const req = Number(c.capacity);
                      const rem = req - assigned;
                      
                      return (
                        <tr key={c.id} className="hover:bg-[#fbfbf9] transition-colors">
                          <td className="px-6 py-4 text-center text-[#8e8e70] font-mono">{idx + 1}</td>
                          <td className="px-6 py-4 font-bold text-[#1a1a1a]">{c.name}</td>
                          {onlyCommCols.program && <td className="px-6 py-4 text-[#5a5a40] font-medium">{c.program || '-'}</td>}
                          {onlyCommCols.leaderSant && <td className="px-6 py-4 text-[#5a5a40] font-medium">{c.leader || '-'}</td>}
                          {onlyCommCols.sanyojakSant && <td className="px-6 py-4 text-[#5a5a40] font-medium">{c.sanyojakSant || '-'}</td>}
                          {onlyCommCols.capacity && <td className="px-6 py-4 text-center font-bold font-mono text-[#1a1a1a]">{req}</td>}
                          {onlyCommCols.assigned && <td className="px-6 py-4 text-center font-bold font-mono text-[#5a5a40]">{assigned}</td>}
                          {onlyCommCols.available && (
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-1 rounded-lg font-bold font-mono text-[11px] ${
                                rem > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
                              }`}>
                                {rem >= 0 ? rem : 0}
                              </span>
                            </td>
                          )}
                          {onlyCommCols.sanyojak && (
                            <td className="px-6 py-4 text-[#5a5a40] text-xs">
                              {c.sanyojakVolunteers && c.sanyojakVolunteers.length > 0 
                                ? c.sanyojakVolunteers.map(v => typeof v === 'string' ? v : v.name).join(', ')
                                : '-'}
                            </td>
                          )}
                          {onlyCommCols.nirikshak && (
                            <td className="px-6 py-4 text-[#5a5a40] text-xs">
                              {c.nirikshakVolunteers && c.nirikshakVolunteers.length > 0 
                                ? c.nirikshakVolunteers.map(v => typeof v === 'string' ? v : v.name).join(', ')
                                : '-'}
                            </td>
                          )}
                          {onlyCommCols.centers && (
                            <td className="px-6 py-4 text-[#5a5a40] text-xs">
                              {(c.centers || []).join(', ') || '-'}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ----------------- RENDER MODE 3: ROLES & ASSIGNMENTS ----------------- */}
      {activeMode === 'roles-assignments' && (
        <div className="space-y-6">
          
          <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5de] flex items-start gap-3 text-[#5a5a40] text-xs leading-relaxed no-print">
            <Info size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {language === 'gu' ? 'હોદ્દો ધરાવતા સ્વયંસેવકોની સૂચિ' : 'Committee Members with Specific Roles'}
              </p>
              <p className="mt-0.5 text-[#8e8e70]">
                {language === 'gu' 
                  ? 'આ લિસ્ટ તમામ એવા સ્વયંસેવકોને દર્શાવે છે કે જેમને સમિતિઓમાં કોઈ ચોક્કસ હોદ્દો (જેમ કે લીડર, સંયોજક) અથવા કાર્ય સોંપાયેલું હોય.'
                  : 'This spreadsheet report highlights all active roles, responsibilities, and contact info. Excellent for coordinators and organizers to search by roles.'}
              </p>
            </div>
          </div>

          <div className="print-section bg-white p-6 md:p-8 rounded-[32px] border border-[#e5e5de] shadow-sm overflow-hidden">
            {/* Print Only Header */}
            <div className="hidden print-only-header text-center pb-6 border-b-2 border-double border-[#5a5a40] mb-6">
              <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">{eventInfo.name}</h1>
              <p className="text-sm font-bold text-[#8e8e70] uppercase tracking-widest mt-1">
                {language === 'gu' ? 'સ્વયંસેવક હોદ્દા અને ફાળવણી પત્રક' : 'Volunteer Roles & Active Assignments Structure'}
              </p>
              <p className="text-xs text-[#8e8e70] mt-1">{eventInfo.date}</p>
            </div>

            <div className="overflow-x-auto">
              {(() => {
                // Group assignments by volunteerId
                const groupedMap: { [vid: string]: {
                  volunteerId: string;
                  volunteerName: string;
                  mobile: string;
                  center: string;
                  comms: { committeeName: string; role: string; responsibility: string }[];
                }} = {};

                filteredAssignments.forEach(a => {
                  const v = getVolunteer(a.volunteerId);
                  const c = committees.find(comm => comm.id === a.committeeId);
                  if (!v) return;

                  if (!groupedMap[a.volunteerId]) {
                    groupedMap[a.volunteerId] = {
                      volunteerId: a.volunteerId,
                      volunteerName: v.name,
                      mobile: v.mobile,
                      center: v.center || '',
                      comms: []
                    };
                  }

                  groupedMap[a.volunteerId].comms.push({
                    committeeName: c ? c.name : 'Unknown',
                    role: a.role || '',
                    responsibility: a.responsibility || ''
                  });
                });

                const groupedList = Object.values(groupedMap);

                return (
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#f5f5f0] border-b border-[#e5e5de] text-[#8e8e70] font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                        <th className="px-6 py-4 w-12 text-center">No.</th>
                        <th className="px-6 py-4">{language === 'gu' ? 'સ્વયંસેવકનું નામ' : 'Volunteer Name'}</th>
                        <th className="px-6 py-4">{language === 'gu' ? 'સંપર્ક નંબર' : 'Mobile'}</th>
                        <th className="px-6 py-4">{language === 'gu' ? 'કેન્દ્ર' : 'Center'}</th>
                        <th className="px-6 py-4">{language === 'gu' ? 'નિયુક્ત સમિતિઓ' : 'Committee Name(s)'}</th>
                        <th className="px-6 py-4">{language === 'gu' ? 'સોંપાયેલ હોદ્દો' : 'Assigned Role(s)'}</th>
                        <th className="px-6 py-4">{language === 'gu' ? 'મુખ્ય જવાબદારી' : 'Responsibility'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e5de]">
                      {groupedList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-[#8e8e70]">
                            {language === 'gu' ? 'ચોક્કસ હોદ્દો ધરાવતો કોઈ સભ્ય મળ્યો નથી.' : 'No members found with matching roles or search criteria.'}
                          </td>
                        </tr>
                      ) : (
                        groupedList.map((g, idx) => (
                          <tr key={g.volunteerId} className="hover:bg-[#fbfbf9] transition-colors">
                            <td className="px-6 py-4 text-center text-[#8e8e70] font-mono">{idx + 1}</td>
                            <td className="px-6 py-4 font-bold text-[#1a1a1a]">{g.volunteerName}</td>
                            <td className="px-6 py-4 font-mono text-[#5a5a40]">{g.mobile || '-'}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded bg-[#f0f0e8] text-[#5a5a40] font-medium text-[10px]">
                                {g.center || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                {g.comms.map((co, cIdx) => (
                                  <div key={cIdx} className="font-bold text-[#1a1a1a] text-xs">
                                    {co.committeeName}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                {g.comms.map((co, cIdx) => (
                                  <div key={cIdx}>
                                    {co.role ? (
                                      <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold uppercase text-[9px] tracking-wider inline-block">
                                        {co.role}
                                      </span>
                                    ) : (
                                      <span className="text-[#8e8e70]">-</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[#8e8e70] font-medium">
                              <div className="flex flex-col gap-1">
                                {g.comms.map((co, cIdx) => (
                                  <div key={cIdx} className="text-xs">
                                    {co.responsibility || '-'}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {activeMode === 'center-wise' && (
        <div className="space-y-6">
          <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5de] flex items-start gap-3 text-[#5a5a40] text-xs leading-relaxed no-print">
            <Info size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {language === 'gu' ? 'કેન્દ્ર વાઇઝ સ્વયંસેવકોની સૂચિ' : 'Center-wise Volunteers List'}
              </p>
              <p className="mt-0.5 text-[#8e8e70]">
                {language === 'gu' 
                  ? 'આ રિપોર્ટ સ્વયંસેવકોને તેમના હોમ કેન્દ્ર પ્રમાણે વર્ગીકૃત કરીને દર્શાવે છે જેથી કેન્દ્ર વાઇઝ ફોલો-અપ સરળ બને.'
                  : 'This report groups all active volunteers by their center. This makes it extremely easy to coordinate and track volunteers by region.'}
              </p>
            </div>
          </div>

          <div className="print-section bg-white p-6 md:p-8 rounded-[32px] border border-[#e5e5de] shadow-sm overflow-hidden space-y-8">
            {/* Print Only Header */}
            <div className="hidden print-only-header text-center pb-6 border-b-2 border-double border-[#5a5a40] mb-6">
              <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">{eventInfo.name}</h1>
              <p className="text-sm font-bold text-[#8e8e70] uppercase tracking-widest mt-1">
                {language === 'gu' ? 'કેન્દ્ર વાઇઝ સ્વયંસેવકોનું પત્રક' : 'Center-Wise Volunteers Directory'}
              </p>
              <p className="text-xs text-[#8e8e70] mt-1">{eventInfo.date}</p>
            </div>

            {(() => {
              // Get all volunteers and filter them based on searchQuery
              const filteredVols = volunteers.filter(v => {
                if (searchQuery) {
                  const sLower = searchQuery.toLowerCase();
                  const matchesName = v.name.toLowerCase().includes(sLower);
                  const matchesMobile = v.mobile.includes(sLower);
                  const matchesMemberId = v.memberId && v.memberId.toLowerCase().includes(sLower);
                  const matchesCenter = v.center && v.center.toLowerCase().includes(sLower);
                  return matchesName || matchesMobile || matchesMemberId || matchesCenter;
                }
                return true;
              });

              // Group filtered volunteers by center
              const groupedByCenter: { [center: string]: typeof volunteers } = {};
              filteredVols.forEach(v => {
                const centerName = v.center || (language === 'gu' ? 'અન્ય' : 'Other');
                if (!groupedByCenter[centerName]) {
                  groupedByCenter[centerName] = [];
                }
                groupedByCenter[centerName].push(v);
              });

              const sortedCenters = Object.keys(groupedByCenter).sort((a, b) => a.localeCompare(b));

              if (sortedCenters.length === 0) {
                return (
                  <div className="text-center py-8 text-[#8e8e70]">
                    {language === 'gu' ? 'કોઈ સ્વયંસેવક મળ્યો નથી.' : 'No volunteers found.'}
                  </div>
                );
              }

              return sortedCenters.map((center) => {
                const vols = groupedByCenter[center];
                return (
                  <div key={center} className="space-y-4 border-b border-[#e5e5de]/50 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center bg-[#fbfbf9] px-6 py-3 rounded-2xl border border-[#e5e5de]">
                      <span className="font-serif font-bold text-[#1a1a1a] text-base md:text-lg">
                        {language === 'gu' ? 'કેન્દ્ર: ' : 'Center: '} {center}
                      </span>
                      <span className="text-[#5a5a40] font-mono font-bold text-xs bg-white px-3 py-1 rounded-full border border-[#e5e5de]">
                        {language === 'gu' ? `કુલ સ્વયંસેવક: ${vols.length}` : `Volunteers: ${vols.length}`}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-[#f5f5f0] border-b border-[#e5e5de] text-[#8e8e70] font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                            <th className="px-6 py-3 w-12 text-center">No.</th>
                            <th className="px-6 py-3">{language === 'gu' ? 'સ્વયંસેવકનું નામ' : 'Volunteer Name'}</th>
                            <th className="px-6 py-3">{language === 'gu' ? 'સભ્ય ID' : 'Member ID'}</th>
                            <th className="px-6 py-3">{language === 'gu' ? 'સંપર્ક નંબર' : 'Mobile'}</th>
                            <th className="px-6 py-3">{language === 'gu' ? 'નિયુક્ત સમિતિઓ અને હોદ્દા' : 'Committees & Roles'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e5de]">
                          {vols.map((v, idx) => {
                            const volAssigns = assignments.filter(a => a.volunteerId === v.id);
                            return (
                              <tr key={v.id} className="hover:bg-[#fbfbf9] transition-colors">
                                <td className="px-6 py-4 text-center text-[#8e8e70] font-mono">{idx + 1}</td>
                                <td className="px-6 py-4 font-bold text-[#1a1a1a]">{v.name}</td>
                                <td className="px-6 py-4 font-mono text-[#5a5a40] text-xs">{v.memberId || '-'}</td>
                                <td className="px-6 py-4 font-mono text-[#5a5a40]">{v.mobile || '-'}</td>
                                <td className="px-6 py-4">
                                  {volAssigns.length === 0 ? (
                                    <span className="text-[#8e8e70] italic text-xs">
                                      {language === 'gu' ? 'કોઈ સમિતિમાં નથી' : 'No committee assigned'}
                                    </span>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {volAssigns.map(a => {
                                        const c = committees.find(comm => comm.id === a.committeeId);
                                        return (
                                          <span key={a.id} className="inline-flex items-center gap-1 bg-[#f0f0e8] text-[#5a5a40] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#e5e5de]">
                                            {c ? c.name : 'Unknown'}
                                            {a.role && (
                                              <span className="text-amber-800 text-[9px] bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5 ml-1">
                                                {a.role}
                                              </span>
                                            )}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
