import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";
import { ref, get } from "firebase/database";
import { Spinner } from "react-bootstrap";

function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const checkAdminStatus = async () => {
      const userRef = ref(db, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists() && snapshot.val().isAdmin === true) {
        setIsAdmin(true);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default AdminRoute;
