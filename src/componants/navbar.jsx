import { useEffect, useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import logo from "../assets/Untitled-1.png";
import Image from "react-bootstrap/Image";
import { useAuth } from "../componants/AuthContext";
import { get, ref } from "firebase/database";
import { db } from "./firebase";

function NavBar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const userRef = ref(db, `users/${currentUser.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists() && snapshot.val().isAdmin) {
          setIsAdmin(true);
        }
      });
    } else {
      setIsAdmin(false);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand>
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <Image src={logo} fluid style={{ width: "30px" }} />
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => navigate("/dashboard")}>Home</Nav.Link>
              {currentUser && (
                <Nav.Link
                  onClick={() => navigate(`/profile/${currentUser.uid}`)}
                >
                  Profile
                </Nav.Link>
              )}
              {isAdmin && (
                <Nav.Link onClick={() => navigate("/admin")}>Admin</Nav.Link>
              )}
            </Nav>
            {currentUser ? (
              <Button variant="outline-primary" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Button
                variant="outline-primary"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavBar;
