import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  allowed: string[];
}

const RequireAuth = ({ children, allowed }: Props) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If user's role is not in allowed list, redirect to their proper section
  if (!allowed.includes(user.role)) {
    if (user.role === "cook") return <Navigate to="/kitchen" replace />;
    if (user.role === "reception") return <Navigate to="/reception" replace />;
    return <Navigate to="/menu" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
