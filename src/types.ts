export interface EventInfo {
  name: string;
  date: string;
}

export interface SharedWith {
  email: string;
  role: 'viewer' | 'editor';
}

export interface EventData {
  id: string;
  name: string;
  date: string;
  committees: Committee[];
  volunteers: Volunteer[];
  assignments: Assignment[];
  ownerEmail: string;
  sharedWith: SharedWith[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface ContactPerson {
  name: string;
  mobile?: string;
}

export interface Committee {
  id: string;
  name: string;
  description: string;
  coordinator: string;
  leader: string;
  sanyojakSant?: string;
  program?: string;
  capacity: number;
  sanyojakVolunteers?: (string | ContactPerson)[];
  nirikshakVolunteers?: (string | ContactPerson)[];
  centers?: string[];
}

export interface Volunteer {
  id: string;
  name: string;
  mobile: string;
  memberId: string;
  center: string;
  role?: string;
}

export interface Assignment {
  id: string;
  committeeId: string;
  volunteerId: string;
  responsibility: string;
  role: string;
  notes?: string;
}

export type AppLanguage = 'gu' | 'en';
