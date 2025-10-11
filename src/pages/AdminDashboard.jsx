import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../componants/navbar";
import { Container, Col, Button, Modal, Form, Spinner } from "react-bootstrap";
import { db } from "../componants/firebase";
import { ref, get, set, remove, push, update } from "firebase/database";

function AdminDashboard() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentLec, setCurrentLec] = useState({
    id: null,
    name: "",
    title: "",
    date: "",
    link: "",
  });

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const lecturersRef = ref(db, "lecs/");
      const snapshot = await get(lecturersRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const lecturersList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setLectures(lecturersList);
      } else {
        setLectures([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch lectures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setCurrentLec({ id: null, name: "", title: "", date: "", link: "" });
  };

  const handleShow = (lec = null) => {
    if (lec) {
      setCurrentLec(lec);
    } else {
      setCurrentLec({ id: null, name: "", title: "", date: "", link: "" });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLec((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const { id, ...lecData } = currentLec;
    try {
      if (id) {
        // Update existing lecture
        await update(ref(db, `lecs/${id}`), lecData);
      } else {
        // Add new lecture
        const newLecRef = push(ref(db, "lecs/"));
        await set(newLecRef, lecData);
      }
      handleClose();
      fetchLectures(); // Refresh the list
    } catch (err) {
      console.error("Failed to save lecture:", err);
    }
  };

  const handleDelete = async (lecId) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        await remove(ref(db, `lecs/${lecId}`));
        fetchLectures(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete lecture:", err);
      }
    }
  };

  const handleTakeAttendance = (lec) => {
    navigate("/admin/scan", { state: { lecture: lec } });
  };

  return (
    <>
      <NavBar />
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2 className="p-2">Admin - Manage Lectures</h2>
          <Button variant="primary" onClick={() => handleShow()}>
            Add Lecture
          </Button>
        </div>
        <Col className="p-2">
          <Container
            fluid
            className="p-2 border rounded"
            style={{ backgroundColor: "rgba(229, 229, 229, 1)" }}
          >
            <div
              className="d-flex justify-content-between fw-bold my-1 p-2"
              style={{ borderBottom: "1px solid lightgray" }}
            >
              <div className="w-25">Name</div>
              <div className="w-25">Title</div>
              <div className="w-25">Date</div>
              <div className="w-25 text-end">Actions</div>
            </div>
            {loading && (
              <div className="text-center p-3">
                <Spinner animation="border" />
              </div>
            )}
            {error && <p className="text-center text-danger">{error}</p>}
            {!loading &&
              lectures.map((lec) => (
                <div
                  className="d-flex justify-content-between align-items-center bg-light my-1 p-2 rounded"
                  key={lec.id}
                >
                  <div className="w-25">{lec.name}</div>
                  <div className="w-25">{lec.title}</div>
                  <div className="w-25">{lec.date}</div>
                  <div className="w-25 text-end">
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleTakeAttendance(lec)}
                    >
                      Scan
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShow(lec)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(lec.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
          </Container>
        </Col>
      </Container>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{currentLec.id ? "Edit" : "Add"} Lecture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveChanges}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentLec.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={currentLec.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={currentLec.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Link</Form.Label>
              <Form.Control
                type="url"
                name="link"
                value={currentLec.link}
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

export default AdminDashboard;
