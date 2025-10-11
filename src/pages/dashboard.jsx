import { useEffect, useState } from "react";
import NavBar from "../componants/navbar";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import { db } from "../componants/firebase";
import { ref, get } from "firebase/database";

function Dashboard() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const lecturersRef = ref(db, "lecs/");
        const snapshot = await get(lecturersRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convert the object of lecturers into an array
          const lecturersList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setLecturers(lecturersList);
        } else {
          console.log("No data available");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch lecturers.");
      } finally {
        setLoading(false);
      }
    };

    fetchLecturers();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <>
      <NavBar />
      <Container fluid>
        <h2 className="text-center my-3 p-2">Lectures</h2>
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
            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-center text-danger">{error}</p>}
            {lecturers.map((lec) => (
              <div
                className="d-flex justify-content-between align-items-center bg-light my-1 p-2 rounded"
                key={lec.id}
              >
                <div className="w-25">{lec.name}</div>
                <div className="w-25">{lec.title}</div>
                <div className="w-25">{lec.date}</div>
                <div className="w-25 text-end">
                  <a
                    href={lec.link}
                    className="btn btn-sm btn-outline-primary mx-1"
                  >
                    pdf
                  </a>
                  <a
                    href={lec.link}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    record
                  </a>
                </div>
              </div>
            ))}
          </Container>
        </Col>
      </Container>
    </>
  );
}

export default Dashboard;
