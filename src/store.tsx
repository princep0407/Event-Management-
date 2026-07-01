import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EventInfo, EventData, Committee, Volunteer, Assignment, AppLanguage, User } from './types';
import { sankalpCommittees } from './sankalpData';

interface AppState {
  language: AppLanguage;
  currentEventId: string;
  events: EventData[];
}

interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  // Auth state
  currentUser: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  // Current active event properties
  eventInfo: EventInfo;
  committees: Committee[];
  volunteers: Volunteer[];
  assignments: Assignment[];
  // Event list and state
  events: EventData[];
  currentEventId: string;
  setCurrentEventId: (id: string) => void;
  addEvent: (name: string, date: string, copyFromEventId?: string) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, name: string, date: string) => void;
  copyEventData: (fromEventId: string, toEventId: string) => void;
  // Active Event CRUD actions (seamless mapping)
  setEventInfo: (info: EventInfo) => void;
  addCommittee: (c: Committee) => void;
  updateCommittee: (c: Committee) => void;
  deleteCommittee: (id: string) => void;
  addVolunteer: (v: Volunteer) => void;
  updateVolunteer: (v: Volunteer) => void;
  deleteVolunteer: (id: string) => void;
  bulkAddVolunteers: (vs: Volunteer[]) => void;
  bulkAddCommittees: (cs: Committee[]) => void;
  addAssignment: (a: Assignment) => void;
  bulkAddAssignments: (as: Assignment[]) => void;
  deleteAssignment: (id: string) => void;
  resetData: () => void;
}

const defaultState: AppState = {
  language: 'gu',
  currentEventId: 'default-event',
  events: [
    {
      id: 'default-event',
      name: 'વાર્ષિક મહોત્સવ (Annual Event)',
      date: new Date().toISOString().split('T')[0],
      committees: [],
      volunteers: [],
      assignments: [],
    },
    {
      id: 'sankalp-event',
      name: 'શ્રી હરિ સંકલ્પ મહોત્સવ',
      date: new Date().toISOString().split('T')[0],
      committees: sankalpCommittees,
      volunteers: [],
      assignments: [],
    }
  ]
};

function parseState(saved: string): AppState {
  try {
    const parsed = JSON.parse(saved);
    let updated = false;
    
    // Migration from old single-event format
    if (parsed.eventInfo && !parsed.events) {
      const migratedEvent: EventData = {
        id: 'migrated-event',
        name: parsed.eventInfo.name || 'વાર્ષિક મહોત્સવ (Annual Event)',
        date: parsed.eventInfo.date || new Date().toISOString().split('T')[0],
        committees: parsed.committees || [],
        volunteers: parsed.volunteers || [],
        assignments: parsed.assignments || []
      };
      parsed.events = [migratedEvent];
      parsed.currentEventId = 'migrated-event';
      updated = true;
    }
    
    if (parsed.events && parsed.events.length > 0) {
      // Inject Sankalp event if it doesn't exist
      const hasSankalp = parsed.events.some((e: any) => e.name === 'શ્રી હરિ સંકલ્પ મહોત્સવ');
      if (!hasSankalp) {
        parsed.events.push({
          id: 'sankalp-event-' + Date.now(),
          name: 'શ્રી હરિ સંકલ્પ મહોત્સવ',
          date: new Date().toISOString().split('T')[0],
          committees: sankalpCommittees,
          volunteers: [],
          assignments: []
        });
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse state', e);
  }
  return defaultState;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('volunteer_app_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load current user', e);
      }
    }
    return null;
  });

  const [state, setState] = useState<AppState>(() => {
    const userSaved = localStorage.getItem('volunteer_app_current_user');
    let userId = '';
    if (userSaved) {
      try {
        userId = JSON.parse(userSaved).id;
      } catch (e) {}
    }
    const storageKey = userId ? `volunteer_app_state_${userId}` : 'volunteer_app_state';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return parseState(saved);
    }
    return defaultState;
  });

  useEffect(() => {
    const storageKey = currentUser ? `volunteer_app_state_${currentUser.id}` : 'volunteer_app_state';
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, currentUser]);

  const login = (email: string, password: string) => {
    const usersStr = localStorage.getItem('volunteer_app_users') || '[]';
    let usersList: any[] = [];
    try {
      usersList = JSON.parse(usersStr);
    } catch(e) {}
    
    const matched = usersList.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!matched) {
      return { success: false, error: 'Incorrect email or password.' };
    }
    
    const loggedInUser: User = { id: matched.id, name: matched.name, email: matched.email };
    localStorage.setItem('volunteer_app_current_user', JSON.stringify(loggedInUser));
    setCurrentUser(loggedInUser);
    
    const userStateKey = `volunteer_app_state_${matched.id}`;
    const userSavedState = localStorage.getItem(userStateKey);
    if (userSavedState) {
      setState(parseState(userSavedState));
    } else {
      localStorage.setItem(userStateKey, JSON.stringify(state));
    }
    return { success: true };
  };

  const register = (name: string, email: string, password: string) => {
    const usersStr = localStorage.getItem('volunteer_app_users') || '[]';
    let usersList: any[] = [];
    try {
      usersList = JSON.parse(usersStr);
    } catch(e) {}
    
    const exists = usersList.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    
    const newUser = {
      id: 'usr-' + Date.now(),
      name,
      email,
      password
    };
    
    usersList.push(newUser);
    localStorage.setItem('volunteer_app_users', JSON.stringify(usersList));
    
    const loggedInUser: User = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem('volunteer_app_current_user', JSON.stringify(loggedInUser));
    setCurrentUser(loggedInUser);
    
    const userStateKey = `volunteer_app_state_${newUser.id}`;
    localStorage.setItem(userStateKey, JSON.stringify(state));
    
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('volunteer_app_current_user');
    setCurrentUser(null);
    setState(defaultState);
  };

  // Active event helper
  const activeEvent = state.events.find(e => e.id === state.currentEventId) || state.events[0] || defaultState.events[0];

  const setLanguage = (language: AppLanguage) => setState(s => ({ ...s, language }));
  const setCurrentEventId = (id: string) => setState(s => ({ ...s, currentEventId: id }));

  const addEvent = (name: string, date: string, copyFromEventId?: string) => {
    setState(s => {
      const newId = 'event-' + Date.now();
      let committees: Committee[] = [];
      let volunteers: Volunteer[] = [];
      let assignments: Assignment[] = [];

      if (copyFromEventId) {
        const sourceEvent = s.events.find(e => e.id === copyFromEventId);
        if (sourceEvent) {
          committees = JSON.parse(JSON.stringify(sourceEvent.committees));
          volunteers = JSON.parse(JSON.stringify(sourceEvent.volunteers));
          assignments = JSON.parse(JSON.stringify(sourceEvent.assignments));
        }
      }

      const newEvent: EventData = {
        id: newId,
        name,
        date,
        committees,
        volunteers,
        assignments
      };

      return {
        ...s,
        currentEventId: newId,
        events: [...s.events, newEvent]
      };
    });
  };

  const deleteEvent = (id: string) => {
    setState(s => {
      if (s.events.length <= 1) return s; // Do not delete the last event
      const updatedEvents = s.events.filter(e => e.id !== id);
      const nextActiveId = s.currentEventId === id ? updatedEvents[0].id : s.currentEventId;
      return {
        ...s,
        currentEventId: nextActiveId,
        events: updatedEvents
      };
    });
  };

  const updateEvent = (id: string, name: string, date: string) => {
    setState(s => ({
      ...s,
      events: s.events.map(e => e.id === id ? { ...e, name, date } : e)
    }));
  };

  const copyEventData = (fromEventId: string, toEventId: string) => {
    setState(s => {
      const sourceEvent = s.events.find(e => e.id === fromEventId);
      if (!sourceEvent) return s;
      return {
        ...s,
        events: s.events.map(e => {
          if (e.id === toEventId) {
            return {
              ...e,
              committees: JSON.parse(JSON.stringify(sourceEvent.committees)),
              volunteers: JSON.parse(JSON.stringify(sourceEvent.volunteers)),
              assignments: JSON.parse(JSON.stringify(sourceEvent.assignments))
            };
          }
          return e;
        })
      };
    });
  };

  // Helper function to update the current active event's collections
  const updateActiveEvent = (updater: (ev: EventData) => EventData) => {
    setState(s => {
      const updatedEvents = s.events.map(ev => {
        if (ev.id === s.currentEventId) {
          return updater(ev);
        }
        return ev;
      });
      return { ...s, events: updatedEvents };
    });
  };

  const setEventInfo = (info: EventInfo) => {
    updateActiveEvent(ev => ({ ...ev, name: info.name, date: info.date }));
  };
  
  const addCommittee = (c: Committee) => {
    updateActiveEvent(ev => ({ ...ev, committees: [...ev.committees, c] }));
  };
  const updateCommittee = (c: Committee) => {
    updateActiveEvent(ev => ({ ...ev, committees: ev.committees.map(x => x.id === c.id ? c : x) }));
  };
  const deleteCommittee = (id: string) => {
    updateActiveEvent(ev => ({ 
      ...ev, 
      committees: ev.committees.filter(x => x.id !== id),
      assignments: ev.assignments.filter(x => x.committeeId !== id)
    }));
  };
  const bulkAddCommittees = (cs: Committee[]) => {
    updateActiveEvent(ev => ({ ...ev, committees: [...ev.committees, ...cs] }));
  };

  const addVolunteer = (v: Volunteer) => {
    updateActiveEvent(ev => ({ ...ev, volunteers: [...ev.volunteers, v] }));
  };
  const updateVolunteer = (v: Volunteer) => {
    updateActiveEvent(ev => ({ ...ev, volunteers: ev.volunteers.map(x => x.id === v.id ? v : x) }));
  };
  const deleteVolunteer = (id: string) => {
    updateActiveEvent(ev => ({
      ...ev,
      volunteers: ev.volunteers.filter(x => x.id !== id),
      assignments: ev.assignments.filter(x => x.volunteerId !== id)
    }));
  };
  const bulkAddVolunteers = (vs: Volunteer[]) => {
    updateActiveEvent(ev => ({ ...ev, volunteers: [...ev.volunteers, ...vs] }));
  };

  const addAssignment = (a: Assignment) => {
    updateActiveEvent(ev => ({ ...ev, assignments: [...ev.assignments, a] }));
  };
  const bulkAddAssignments = (as: Assignment[]) => {
    updateActiveEvent(ev => ({ ...ev, assignments: [...ev.assignments, ...as] }));
  };
  const deleteAssignment = (id: string) => {
    updateActiveEvent(ev => ({ ...ev, assignments: ev.assignments.filter(x => x.id !== id) }));
  };

  const resetData = () => {
    setState(s => ({
      ...s,
      events: s.events.map(ev => ev.id === s.currentEventId ? { ...ev, committees: [], volunteers: [], assignments: [] } : ev)
    }));
  };

  return (
    <AppContext.Provider value={{
      language: state.language,
      setLanguage,
      // Auth details
      currentUser,
      login,
      register,
      logout,
      // Map active event properties
      eventInfo: { name: activeEvent.name, date: activeEvent.date },
      committees: activeEvent.committees || [],
      volunteers: activeEvent.volunteers || [],
      assignments: activeEvent.assignments || [],
      // Multiple events list and management
      events: state.events,
      currentEventId: state.currentEventId,
      setCurrentEventId,
      addEvent,
      deleteEvent,
      updateEvent,
      copyEventData,
      // Active Event Mutators
      setEventInfo,
      addCommittee, updateCommittee, deleteCommittee, bulkAddCommittees,
      addVolunteer, updateVolunteer, deleteVolunteer, bulkAddVolunteers,
      addAssignment, bulkAddAssignments, deleteAssignment, resetData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
