import { AuthUser } from '../types';

interface StoredUserAccount extends AuthUser {
  passwordHash: string; // En frontend almacenamos hash simple para persistencia local
}

const STORAGE_USERS_KEY = 'maruca_users_db';
const STORAGE_CURRENT_USER_KEY = 'maruca_current_user';

// Simple hashing para almacenar contraseñas en cliente sin texto plano obvio
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(36)}_${password.length}`;
}

const DEFAULT_AVATAR_COLORS = [
  '#30d158', // Apple Green
  '#0071e3', // Apple Blue
  '#ff9f0a', // Apple Orange
  '#ff375f', // Apple Pink
  '#bf5af2', // Apple Purple
  '#64d2ff', // Apple Cyan
];

// Cuenta de administrador preconfigurada para el propietario
const ADMIN_USER: StoredUserAccount = {
  id: 'usr_admin_dawsson',
  username: 'dawsson',
  email: 'dawsson@maruca.app',
  name: 'Dawsson (Administrador)',
  avatarColor: '#bf5af2', // Apple Purple / Royale
  isAdmin: true,
  passwordHash: hashPassword('mxonda1234'),
  createdAt: '2026-10-10T08:00:00.000Z',
};

const DEMO_USER: StoredUserAccount = {
  id: 'usr_demo_1',
  username: 'usuario',
  email: 'usuario@maruca.app',
  name: 'Usuario Maruca',
  avatarColor: '#30d158',
  isAdmin: false,
  passwordHash: hashPassword('maruca123'),
  createdAt: new Date().toISOString(),
};

/**
 * Obtiene la lista de usuarios registrados en el dispositivo
 */
export function getRegisteredUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    let list: StoredUserAccount[] = [];
    if (!raw) {
      list = [ADMIN_USER, DEMO_USER];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
      return list;
    }

    list = JSON.parse(raw);

    // Asegurar que el administrador dawsson siempre esté presente y con las credenciales solicitadas
    const hasAdmin = list.some((u) => u.username.toLowerCase() === 'dawsson');
    if (!hasAdmin) {
      list.unshift(ADMIN_USER);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
    } else {
      // Actualizar hash por si acaso
      list = list.map((u) =>
        u.username.toLowerCase() === 'dawsson'
          ? { ...u, isAdmin: true, name: 'Dawsson (Administrador)', passwordHash: hashPassword('mxonda1234') }
          : u
      );
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
    }

    return list;
  } catch (e) {
    console.error('Error cargando usuarios registrados:', e);
    return [ADMIN_USER, DEMO_USER];
  }
}

/**
 * Obtiene el usuario activo actualmente
 */
export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    const user: AuthUser = JSON.parse(raw);
    if (user.username?.toLowerCase() === 'dawsson') {
      user.isAdmin = true;
    }
    return user;
  } catch (e) {
    return null;
  }
}

/**
 * Inicia sesión con usuario y contraseña
 */
export function loginUser(usernameInput: string, passwordInput: string): { success: boolean; user?: AuthUser; error?: string } {
  const username = usernameInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!username || !password) {
    return { success: false, error: 'Por favor, introduce tu usuario y contraseña.' };
  }

  // Comprobación directa para el administrador dawsson
  if (username === 'dawsson' && password === 'mxonda1234') {
    const adminSafeUser: AuthUser = {
      id: ADMIN_USER.id,
      username: 'dawsson',
      email: ADMIN_USER.email,
      name: 'Dawsson (Administrador)',
      avatarColor: ADMIN_USER.avatarColor,
      isAdmin: true,
      createdAt: ADMIN_USER.createdAt,
    };
    try {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(adminSafeUser));
    } catch (e) {}
    return { success: true, user: adminSafeUser };
  }

  const users = getRegisteredUsers();
  const targetUser = users.find((u) => u.username.toLowerCase() === username);

  if (!targetUser) {
    return { success: false, error: 'No existe ninguna cuenta con ese nombre de usuario.' };
  }

  const providedHash = hashPassword(password);
  if (targetUser.passwordHash !== providedHash) {
    return { success: false, error: 'Contraseña incorrecta. Inténtalo de nuevo.' };
  }

  const isDawsson = targetUser.username.toLowerCase() === 'dawsson';
  const safeUser: AuthUser = {
    id: targetUser.id,
    username: targetUser.username,
    email: targetUser.email,
    name: targetUser.name,
    avatarColor: targetUser.avatarColor,
    isAdmin: targetUser.isAdmin || isDawsson,
    createdAt: targetUser.createdAt,
  };

  try {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(safeUser));
  } catch (e) {}

  return { success: true, user: safeUser };
}

/**
 * Registra un nuevo usuario con usuario y contraseña
 */
export function registerUser(
  usernameInput: string,
  passwordInput: string,
  emailInput?: string
): { success: boolean; user?: AuthUser; error?: string } {
  const username = usernameInput.trim();
  const password = passwordInput.trim();
  const email = emailInput?.trim() || `${username.toLowerCase()}@maruca.app`;

  if (!username) {
    return { success: false, error: 'El nombre de usuario es obligatorio.' };
  }
  if (username.length < 3) {
    return { success: false, error: 'El usuario debe tener al menos 3 caracteres.' };
  }
  if (!password) {
    return { success: false, error: 'La contraseña es obligatoria.' };
  }
  if (password.length < 4) {
    return { success: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
  }

  const users = getRegisteredUsers();
  const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());

  if (exists) {
    return { success: false, error: 'Ese nombre de usuario ya está registrado. Elige otro.' };
  }

  const randomColor = DEFAULT_AVATAR_COLORS[Math.floor(Math.random() * DEFAULT_AVATAR_COLORS.length)];

  const newUser: StoredUserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    username,
    email,
    name: username.charAt(0).toUpperCase() + username.slice(1),
    avatarColor: randomColor,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
  } catch (e) {}

  const safeUser: AuthUser = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    name: newUser.name,
    avatarColor: newUser.avatarColor,
    createdAt: newUser.createdAt,
  };

  try {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(safeUser));
  } catch (e) {}

  return { success: true, user: safeUser };
}

/**
 * Cierra la sesión activa
 */
export function logoutUser(): void {
  try {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  } catch (e) {}
}
