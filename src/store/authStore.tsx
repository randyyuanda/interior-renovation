import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User, Role, LoginCredentials } from "../models/auth";
import { loginApi } from "../api/authApi";

interface AuthState {
  token: string | null;
  user: User | null;
}

type AuthAction =
  | { type: "LOGIN"; payload: { token: string; user: User } }
  | { type: "LOGOUT" };

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? (JSON.parse(u) as User) : null;
    } catch {
      return null;
    }
  })(),
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return { token: action.payload.token, user: action.payload.user };
    case "LOGOUT":
      return { token: null, user: null };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem("token", state.token);
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [state.token, state.user]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { accessToken, user } = await loginApi(credentials);
    dispatch({ type: "LOGIN", payload: { token: accessToken, user } });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  const hasRole = useCallback(
    (roles: Role[]) => {
      if (!state.user) return false;
      return roles.includes(state.user.role);
    },
    [state.user],
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.token && !!state.user,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
