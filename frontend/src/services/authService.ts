// src/services/authService.ts

/**
 * Simplified Authentication Service using Simulated QR Codes
 * No biometric authentication - uses random credential strings
 */

interface StoredUser {
    username: string;
    qrCredential: string; // Simulated QR code credential
    createdAt: number;
}

interface AuthSession {
    username: string;
    loginTime: number;
}

const USERS_KEY = "sharecar_users";
const SESSION_KEY = "sharecar_session";

// Generate a random QR credential (simulated)
function generateQRCredential(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let credential = 'SC-'; // ShareCar prefix
    for (let i = 0; i < 32; i++) {
        credential += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return credential;
}

// Get all registered users
function getUsers(): StoredUser[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
}

// Save users to localStorage
function saveUsers(users: StoredUser[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current session
function getSession(): AuthSession | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
}

// Save session
function saveSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Clear session
function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Register a new user (generates QR credential)
 */
export function registerUser(username: string): { success: boolean; qrCredential?: string; error?: string } {
    if (!username || username.trim().length === 0) {
        return { success: false, error: "El nombre de usuario es requerido" };
    }

    const trimmedUsername = username.trim();

    // Check if user already exists
    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
        return { success: false, error: "Este usuario ya está registrado" };
    }

    // Generate QR credential
    const qrCredential = generateQRCredential();

    // Save user
    const newUser: StoredUser = {
        username: trimmedUsername,
        qrCredential,
        createdAt: Date.now(),
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, qrCredential };
}

/**
 * Login user with username and QR credential
 */
export function loginUser(username: string, qrCredential: string): { success: boolean; error?: string } {
    if (!username || username.trim().length === 0) {
        return { success: false, error: "El nombre de usuario es requerido" };
    }

    if (!qrCredential || qrCredential.trim().length === 0) {
        return { success: false, error: "El código QR es requerido" };
    }

    const trimmedUsername = username.trim();
    const trimmedQR = qrCredential.trim();

    // Find user
    const users = getUsers();
    const user = users.find(u =>
        u.username.toLowerCase() === trimmedUsername.toLowerCase() &&
        u.qrCredential === trimmedQR
    );

    if (!user) {
        return { success: false, error: "Usuario o código QR incorrecto" };
    }

    // Create session
    saveSession({ username: user.username, loginTime: Date.now() });

    return { success: true };
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): string | null {
    const session = getSession();
    return session ? session.username : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getCurrentUser() !== null;
}

/**
 * Logout current user
 */
export function logout(): void {
    clearSession();
}

/**
 * Get all registered usernames (for debugging/admin)
 */
export function getRegisteredUsernames(): string[] {
    return getUsers().map(u => u.username);
}

/**
 * Check if username exists
 */
export function userExists(username: string): boolean {
    const users = getUsers();
    return users.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
}
