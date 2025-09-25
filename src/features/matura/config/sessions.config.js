/**
 * Centralna konfiguracja wszystkich sesji maturalnych
 * Ten plik zastępuje hardkodowane komponenty i umożliwia łatwe dodawanie nowych sesji
 */

export const MATURA_LEVELS = {
  PODSTAWA: 'podstawa',
  ROZSZERZENIE: 'rozszerzenie'
};

export const MATURA_SESSIONS = {
  // Poziom podstawowy - 2025
  'matura-marzec-2025-podstawa': {
    id: 'matura-marzec-2025-podstawa',
    title: 'Marzec 2025',
    level: MATURA_LEVELS.PODSTAWA,
    year: 2025,
    month: 3,
    monthName: 'marzec',
    dataPath: 'matura/podstawa/marzec2025podstawa/maturamarzec2025podstawa_multistep.json',
    problemCount: 32,
    status: 'available',
    color: {
      border: 'hover:border-blue-500',
      iconBg: 'group-hover:bg-blue-100',
      iconColor: 'group-hover:text-blue-700'
    }
  },

  'matura-kwiecien-2025-podstawa': {
    id: 'matura-kwiecien-2025-podstawa',
    title: 'Kwiecień 2025',
    level: MATURA_LEVELS.PODSTAWA,
    year: 2025,
    month: 4,
    monthName: 'kwiecien',
    dataPath: 'matura/podstawa/kwiecien2025podstawa/maturakwiecien2025podstawa_multistep.json',
    problemCount: 30,
    status: 'available',
    color: {
      border: 'hover:border-purple-500',
      iconBg: 'group-hover:bg-purple-100',
      iconColor: 'group-hover:text-purple-700'
    }
  },

  'matura-maj-2025-podstawa': {
    id: 'matura-maj-2025-podstawa',
    title: 'Maj 2025',
    level: MATURA_LEVELS.PODSTAWA,
    year: 2025,
    month: 5,
    monthName: 'maj',
    dataPath: 'matura/podstawa/maj2025podstawa/maturamaj2025podstawa_multistep.json',
    problemCount: 35,
    status: 'available',
    color: {
      border: 'hover:border-green-500',
      iconBg: 'group-hover:bg-green-100',
      iconColor: 'group-hover:text-green-700'
    }
  },

  'matura-czerwiec-2025-podstawa': {
    id: 'matura-czerwiec-2025-podstawa',
    title: 'Czerwiec 2025',
    level: MATURA_LEVELS.PODSTAWA,
    year: 2025,
    month: 6,
    monthName: 'czerwiec',
    dataPath: 'matura/podstawa/czerwiec2025podstawa/maturaczerwiec2025podstawa_multistep.json',
    problemCount: 34,
    status: 'available',
    color: {
      border: 'hover:border-orange-500',
      iconBg: 'group-hover:bg-orange-100',
      iconColor: 'group-hover:text-orange-700'
    }
  },

  'matura-sierpien-2025-podstawa': {
    id: 'matura-sierpien-2025-podstawa',
    title: 'Sierpień 2025',
    level: MATURA_LEVELS.PODSTAWA,
    year: 2025,
    month: 8,
    monthName: 'sierpien',
    dataPath: 'matura/podstawa/sierpien2025podstawa/maturasierpien2025podstawa_multistep.json',
    problemCount: 35,
    status: 'available',
    color: {
      border: 'hover:border-red-500',
      iconBg: 'group-hover:bg-red-100',
      iconColor: 'group-hover:text-red-700'
    }
  },

  // Poziom rozszerzony - 2025
  'matura-marzec-2025-rozszerzenie': {
    id: 'matura-marzec-2025-rozszerzenie',
    title: 'Marzec 2025',
    level: MATURA_LEVELS.ROZSZERZENIE,
    year: 2025,
    month: 3,
    monthName: 'marzec',
    dataPath: 'matura/rozszerzenie/marzec2025r/maturamarzec2025_multistep.json',
    problemCount: 16,
    status: 'available',
    color: {
      border: 'hover:border-indigo-500',
      iconBg: 'group-hover:bg-indigo-100',
      iconColor: 'group-hover:text-indigo-700'
    }
  },

  'matura-maj-2025-rozszerzenie': {
    id: 'matura-maj-2025-rozszerzenie',
    title: 'Maj 2025',
    level: MATURA_LEVELS.ROZSZERZENIE,
    year: 2025,
    month: 5,
    monthName: 'maj',
    dataPath: 'matura/rozszerzenie/maj2025/maturamaj2025_multistep.json',
    problemCount: 16,
    status: 'available',
    color: {
      border: 'hover:border-teal-500',
      iconBg: 'group-hover:bg-teal-100',
      iconColor: 'group-hover:text-teal-700'
    }
  }
};

// Helper functions
export const getSessionById = (id) => MATURA_SESSIONS[id];

export const getSessionsByLevel = (level) => {
  return Object.values(MATURA_SESSIONS).filter(session => session.level === level);
};

export const getAvailableSessions = () => {
  return Object.values(MATURA_SESSIONS).filter(session => session.status === 'available');
};

export const getSessionTitle = (sessionId) => {
  const session = getSessionById(sessionId);
  if (!session) return '';

  const levelName = session.level === MATURA_LEVELS.PODSTAWA ? 'Podstawa' : 'Rozszerzenie';
  return `Matura ${session.title} - ${levelName}`;
};

export const getSessionStorageKey = (sessionId, type = 'progress') => {
  const session = getSessionById(sessionId);
  if (!session) return null;

  switch (type) {
    case 'progress':
      return `matura_${session.level}_${session.year}_${session.month}_progress`;
    case 'suggested':
      return `matura_${session.level}_${session.year}_${session.month}_suggested`;
    case 'view':
      return `matura_${session.level}_${session.year}_${session.month}_view`;
    default:
      return null;
  }
};