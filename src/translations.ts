import { AppLanguage } from './types';

export const translations = {
  en: {
    appTitle: 'Event Management',
    dashboard: 'Dashboard',
    committees: 'Committees',
    volunteers: 'Volunteers',
    structure: 'Structure',
    reports: 'Reports & Export',
    resetData: 'Reset Data',
    eventInfo: 'Event Info',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    add: 'Add',
    
    // Dashboard
    totalCommittees: 'Total Committees',
    totalVolunteers: 'Total Volunteers',
    assignedRequired: 'Assigned / Required',
    remainingSlots: 'Remaining Open Slots',
    mostShortStaffed: 'Most Short-Staffed Committees',
    emptyCommitteesPrompt: 'No committees yet. Create your first one!',
    addCommittee: 'Add Committee',
    addVolunteer: 'Add Volunteer',
    
    // Committees
    coordinator: 'Coordinator',
    leader: 'Leader Sant',
    capacity: 'Seva Members Required',
    sanyojakSant: 'Sanyojak Sant Name',
    sanyojakVolunteer: 'Sanyojak Name',
    nirikshakVolunteer: 'Nirikshak Name',
    assign: 'Assign',
    remaining: 'Remaining',
    full: 'Full',
    roster: 'Structure View',
    remove: 'Remove',
    assignVolunteer: 'Assign Volunteer',
    selectVolunteer: 'Select Volunteer',
    responsibility: 'Responsibility',
    role: 'Role',
    searchCommittees: 'Search committees, leaders...',
    
    // Volunteers
    exportCsv: 'Export CSV',
    bulkAdd: 'Bulk Add',
    searchPlaceholder: 'Search name, mobile, ID...',
    centerFilter: 'All Centers',
    name: 'Name',
    mobile: 'Mobile',
    memberId: 'Member ID',
    center: 'Center',
    assignedSlots: 'Assigned Slots',
    actions: 'Actions',
    bulkAddInstructions: 'Paste one volunteer per line (Format: Name, Mobile, MemberID, Center)',
    
    // Modals & Forms
    eventName: 'Event Name',
    eventDate: 'Event Date',
    description: 'Description',
    confirmDelete: 'Are you sure you want to delete this?',
    confirmReset: 'Are you sure you want to reset ALL data? This cannot be undone.',
    
    // Structure
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
  },
  gu: {
    appTitle: 'ઇવેન્ટ મેનેજમેન્ટ (Event Management)',
    dashboard: 'ડેશબોર્ડ',
    committees: 'સમિતિઓ',
    volunteers: 'સ્વયંસેવકો',
    structure: 'માળખું',
    reports: 'નિકાસ અને રિપોર્ટ્સ',
    resetData: 'માહિતી ભૂંસો (Reset)',
    eventInfo: 'ઇવેન્ટ માહિતી',
    edit: 'ફેરફાર કરો',
    delete: 'રદ કરો',
    cancel: 'રદ કરો (Cancel)',
    save: 'સાચવો',
    add: 'ઉમેરો',
    
    // Dashboard
    totalCommittees: 'કુલ સમિતિઓ',
    totalVolunteers: 'કુલ સ્વયંસેવકો',
    assignedRequired: 'સોંપાયેલ / જરૂરી',
    remainingSlots: 'બાકી ખાલી જગ્યાઓ',
    mostShortStaffed: 'સૌથી વધુ જરૂરિયાતવાળી સમિતિઓ',
    emptyCommitteesPrompt: 'કોઈ સમિતિ નથી. તમારી પ્રથમ સમિતિ બનાવો!',
    addCommittee: 'સમિતિ ઉમેરો',
    addVolunteer: 'સ્વયંસેવક ઉમેરો',
    
    // Committees
    coordinator: 'સંયોજક',
    leader: 'લીડર સંત',
    capacity: 'જરૂરી સેવા મેમ્બર્સ',
    sanyojakSant: 'સંયોજક સંત',
    sanyojakVolunteer: 'સંયોજક નામ',
    nirikshakVolunteer: 'નિરીક્ષક સ્વયંસેવક',
    assign: 'સોંપો',
    remaining: 'બાકી',
    full: 'પૂર્ણ',
    roster: 'સ્ટ્રક્ચર વ્યૂ (Structure View)',
    remove: 'દૂર કરો',
    assignVolunteer: 'સ્વયંસેવક સોંપો',
    selectVolunteer: 'સ્વયંસેવક પસંદ કરો',
    responsibility: 'જવાબદારી',
    role: 'હોદ્દો (Role)',
    searchCommittees: 'સમિતિ, લીડર સંત... શોધો',
    
    // Volunteers
    exportCsv: 'CSV ડાઉનલોડ કરો',
    bulkAdd: 'એકસાથે ઉમેરો (Bulk Add)',
    searchPlaceholder: 'નામ, મોબાઇલ, ID થી શોધો...',
    centerFilter: 'બધા કેન્દ્રો',
    name: 'નામ',
    mobile: 'મોબાઇલ',
    memberId: 'સભ્ય ID',
    center: 'કેન્દ્ર',
    assignedSlots: 'સોંપાયેલ કાર્યો',
    actions: 'ક્રિયાઓ',
    bulkAddInstructions: 'દરેક લાઇનમાં એક સ્વયંસેવક ઉમેરો (ફોર્મેટ: નામ, મોબાઇલ, સભ્યID, કેન્દ્ર)',
    
    // Modals & Forms
    eventName: 'ઇવેન્ટનું નામ',
    eventDate: 'ઇવેન્ટની તારીખ',
    description: 'વિગતો',
    confirmDelete: 'શું તમે ખરેખર આ રદ કરવા માંગો છો?',
    confirmReset: 'શું તમે ખરેખર બધી માહિતી ભૂંસવા માંગો છો?',
    
    // Structure
    expandAll: 'બધું વિસ્તૃત કરો',
    collapseAll: 'બધું બંધ કરો',
  }
};

export function getTranslation(lang: AppLanguage, key: keyof typeof translations.en): string {
  return translations[lang][key] || translations.en[key] || key;
}
