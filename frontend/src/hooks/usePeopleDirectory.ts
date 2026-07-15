import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listEmployeesRequest } from '../services/employeeService';
import { listManagersRequest } from '../services/managerService';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export interface DirectoryPerson {
  id: string;
  name: string;
  photoUrl?: string;
  role: UserRole;
}

// 100 is the backend's hard cap on `limit` (paginationQuerySchema) — a
// business with more employees/managers than that would need real
// pagination here, but for now this covers the common case in one request.
const DIRECTORY_PAGE_SIZE = 100;

// Resolves any business user id to a display name/photo, and exposes
// role-scoped lists (employees/managers) for pickers like AddProjectModal's
// Manager/Employees selects. Project responses already come pre-populated
// with owner/member names (see types/project.ts) — this hook is for
// pickers that need a list of candidates, and for resolving raw ids that
// show up elsewhere (comments, activity logs, createdBy fields).
//
// `enabled` defaults to true, but callers that only need this inside a
// modal (mounted unconditionally so its close transition can play, e.g.
// AddProjectModal) should pass `isOpen` — otherwise the fetch fires the
// moment the parent page mounts, whether or not the modal is ever opened.
export function usePeopleDirectory(enabled = true) {
  const { profile } = useAuth();
  const [basePeople, setBasePeople] = useState<Record<string, DirectoryPerson>>({});
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    let cancelled = false;

    setIsLoading(true);
    Promise.all([
      listEmployeesRequest({ page: 1, limit: DIRECTORY_PAGE_SIZE }),
      listManagersRequest({ page: 1, limit: DIRECTORY_PAGE_SIZE }),
    ])
      .then(([employeesRes, managersRes]) => {
        if (cancelled) return;
        const map: Record<string, DirectoryPerson> = {};
        employeesRes.data.forEach((person) => {
          map[person.id] = { id: person.id, name: person.name, photoUrl: person.photoUrl, role: UserRole.Employee };
        });
        managersRes.data.forEach((person) => {
          map[person.id] = { id: person.id, name: person.name, photoUrl: person.photoUrl, role: UserRole.Manager };
        });
        setBasePeople(map);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Merged in for general id→name resolution (comments, activity logs,
  // createdBy fields) — the employees/managers endpoints don't include the
  // business's Admin, and there's no "list admins" endpoint. Deliberately
  // NOT included in the `managers` list below — the Manager picker only
  // offers actual Managers (see AddProjectModal).
  const people = useMemo(() => {
    if (profile?.role === UserRole.Admin) {
      return {
        ...basePeople,
        [profile.id]: { id: profile.id, name: profile.name, photoUrl: profile.photoUrl, role: UserRole.Admin },
      };
    }
    return basePeople;
  }, [basePeople, profile]);

  const employees = useMemo(
    () => Object.values(basePeople).filter((person) => person.role === UserRole.Employee),
    [basePeople],
  );
  const managers = useMemo(
    () => Object.values(basePeople).filter((person) => person.role === UserRole.Manager),
    [basePeople],
  );

  const getName = useCallback((id: string) => people[id]?.name ?? 'Team member', [people]);

  return { people, employees, managers, isLoading, getName };
}
