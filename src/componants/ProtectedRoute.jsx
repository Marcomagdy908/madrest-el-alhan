import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  return currentUser ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
