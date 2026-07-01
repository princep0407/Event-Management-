import { Volunteer, Assignment, Committee } from "./types";

export function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const escapeField = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val).trim();
    // Wrap in double quotes and escape existing quotes by doubling them
    return `"${str.replace(/"/g, '""')}"`;
  };

  const csvRows = [
    headers.map(escapeField).join(','),
    ...rows.map(row => row.map(escapeField).join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n'); // Add UTF-8 BOM for Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToCSV(
  volunteers: Volunteer[],
  committees: Committee[],
  assignments: Assignment[]
) {
  const headers = ["Name", "Mobile", "Member ID", "Center", "Assigned Committees", "Roles"];
  
  const rows = volunteers.map(v => {
    const vAssignments = assignments.filter(a => a.volunteerId === v.id);
    const assignedCommittees = vAssignments
      .map(a => committees.find(c => c.id === a.committeeId)?.name || 'Unknown')
      .join("; ");
    const roles = vAssignments.map(a => a.role || a.responsibility).join("; ");
    
    return [
      v.name,
      v.mobile,
      v.memberId,
      v.center,
      assignedCommittees,
      roles
    ];
  });

  downloadCSV("volunteers_list.csv", headers, rows);
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

