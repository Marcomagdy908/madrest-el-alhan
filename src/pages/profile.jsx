import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import QRCode from "react-qr-code";
import NavBar from "../componants/navbar";
import { db } from "../componants/firebase";
import { ref, get, update } from "firebase/database";

function Profile() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({ name: "", phone: "" });

  const handleClose = () => setShowModal(false);

  useEffect(() => {
    const getuser = async () => {
      try {
        setLoading(true);
        const userSnapshot = await get(ref(db, `users/${userId}`));
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          setData(userData);
          setEditData({ name: userData.name, phone: userData.phone });

          // Fetch lectures to build attendance overview
          const lecsSnapshot = await get(ref(db, "lecs/"));
          if (lecsSnapshot.exists()) {
            const lecsData = lecsSnapshot.val();
            const userAttendance = Object.keys(lecsData)
              .map((lecId) => {
                const lecture = lecsData[lecId];
                return {
                  id: lecId,
                  title: lecture.title,
                  date: lecture.date,
                  present: lecture.attendees?.[userId] === true,
                };
              })
              .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent
            setAttendanceData(userAttendance);
          }
        } else {
          setError("No data available for this user.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    getuser();
  }, [userId]);

  const handleShow = () => setShowModal(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const userRef = ref(db, `users/${userId}`);
    try {
      await update(userRef, {
        name: editData.name,
        phone: editData.phone,
      });
      // Update local state to immediately reflect changes
      setData((prev) => ({ ...prev, ...editData }));
      handleClose();
    } catch (err) {
      console.error("Failed to update profile:", err);
      // Optionally, show an error message to the user
    }
  };

  return (
    <>
      <NavBar />
      <Row style={{ width: "100%" }} className="justify-content-center">
        <Col lg={5} md={5} sm={11} className="m-3 p-3 border rounded">
          <Container fluid>
            <div className="justify-content-between d-flex">
              <h2>Profile Page</h2>
              <Button variant="outline-primary" onClick={handleShow}>
                Edit
              </Button>
            </div>
            {loading && <p className="text-center mt-3">Loading profile...</p>}
            {error && <p className="text-center text-danger mt-3">{error}</p>}
            {data && !loading && (
              <div className="mt-3">
                <h6 style={{ color: "rgba(33, 33, 33, 0.66)" }}>Name :</h6>
                <h6>{data.name}</h6>
                <h6 style={{ color: "rgba(33, 33, 33, 0.66)" }}>Email :</h6>
                <h6>{data.email}</h6>
                <h6 style={{ color: "rgba(33, 33, 33, 0.66)" }}>Phone :</h6>
                <h6>{data.phone}</h6>
              </div>
            )}
          </Container>
        </Col>
      </Row>
      {data && !loading && (
        <Row style={{ width: "100%" }} className="justify-content-center">
          <Col lg={2} md={2} sm={5} className="m-3 p-3 border rounded">
            <Container fluid className="text-center">
              <h2>QR Code</h2>
              <QRCode value={userId} size={128} />
            </Container>
          </Col>
          <Col lg={2} md={2} sm={5} className="m-3 p-3 border rounded">
            <Container fluid className="text-center">
              <h2> Overview</h2>
              {attendanceData.length > 0 ? (
                attendanceData.slice(0, 3).map((att) => (
                  <div key={att.id} className="mb-2">
                    <h6 className="mb-0">{att.title}</h6>
                    <small
                      className={att.present ? "text-success" : "text-danger"}
                    >
                      {att.present ? "Present" : "Absent"}
                    </small>
                  </div>
                ))
              ) : (
                <p>No attendance records.</p>
              )}
            </Container>
          </Col>
        </Row>
      )}

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveChanges}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editData.name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={editData.phone}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Profile;
