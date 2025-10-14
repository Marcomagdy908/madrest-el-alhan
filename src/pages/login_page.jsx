import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import { authService as auth, db } from "../componants/firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import logo from "../assets/logo.jpeg";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false); // Default to login page

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User logged in:", user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Invalid email or password. Please try again.");
    }
  };

  const HandleForget = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email address to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert(
        "Failed to send password reset email. Please check the email address and try again."
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User registered:", user);

      // Save extra user data to the Realtime Database
      await set(ref(db, "users/" + user.uid), {
        name: name,
        email: email,
        phone: phone,
      });
      console.log("User data saved to database.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error registering:", error);
      alert("Registration failed. Please try again.");
    }
  };
  return (
    <>
      <Row style={{ width: "100%" }}>
        {!isRegister ? (
          <Col
            md={6}
            lg={4}
            sm={8}
            xs={10}
            style={{
              margin: "auto",
              border: "1px solid lightgray",
              borderRadius: "8px",
              marginTop: "50px",
            }}
          >
            <Container
              className="container m-3"
              style={{ justifySelf: "center" }}
            >
              <Image
                src={logo}
                className="d-block mx-auto"
                fluid
                style={{ width: "20%", margin: "10px", borderRadius: "8px" }}
              />
              <h1 className="text-center mt-3 mb-3">Log in to your account</h1>
              <Form onSubmit={handleLogin}>
                <Form.Group className="m-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="m-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <div className="d-flex justify-content-between">
                  <Button
                    size="sm"
                    variant="link my-3 w-10"
                    onClick={HandleForget}
                  >
                    Forgot Password?
                  </Button>
                  <Button
                    variant="link my-3 w-10"
                    size="sm"
                    onClick={() => setIsRegister(true)}
                  >
                    Create an account
                  </Button>
                </div>
                <div
                  className="d-flex justify-content-center"
                  style={{ width: "90%", margin: "auto" }}
                >
                  <Button variant="primary my-3 w-100" type="submit">
                    Login
                  </Button>
                </div>
              </Form>
            </Container>
          </Col>
        ) : (
          <Col
            md={6}
            lg={4}
            sm={8}
            xs={10}
            style={{
              margin: "auto",
              border: "1px solid lightgray",
              borderRadius: "8px",
              marginTop: "50px",
            }}
          >
            <Container
              className="container m-3"
              style={{ justifySelf: "center" }}
            >
              <Image
                src={logo}
                className="d-block mx-auto"
                fluid
                style={{ width: "20%", margin: "10px", borderRadius: "8px" }}
              />
              <h1 className="text-center mt-3 mb-3">Create an account</h1>
              <Form onSubmit={handleRegister}>
                <Form.Group className="m-3" controlId="formName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="m-3" controlId="formPhone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="m-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="m-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="link my-3 w-10"
                    size="sm"
                    onClick={() => setIsRegister(false)}
                  >
                    Already have an account?
                  </Button>
                </div>
                <div
                  className="d-flex justify-content-center"
                  style={{ width: "90%", margin: "auto" }}
                >
                  <Button variant="primary my-3 w-100" type="submit">
                    Register
                  </Button>
                </div>
              </Form>
            </Container>
          </Col>
        )}
      </Row>
    </>
  );
}

export default Login;
