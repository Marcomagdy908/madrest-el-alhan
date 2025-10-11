import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { ref, get, update } from "firebase/database";
import { db } from "../componants/firebase";
import NavBar from "../componants/navbar";
import { Container, Alert, Button } from "react-bootstrap";

function AttendanceScanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lecture } = location.state || {};

  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!lecture) {
      setError(
        "No lecture selected. Please go back to the admin dashboard and select a lecture to take attendance for."
      );
      return;
    }

    const qrCodeScanner = new Html5Qrcode("reader");
    scannerRef.current = qrCodeScanner;

    const startScanner = async () => {
      try {
        await qrCodeScanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            // --- on success ---
            setIsScanning(false);
            await qrCodeScanner.stop();
            await handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            // --- on error ---
            // console.warn(`QR error: ${errorMessage}`);
          }
        );
      } catch (err) {
        setError(
          `Unable to start scanner: ${err.message}. Please ensure you have given camera permissions.`
        );
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .catch((err) => console.error("Failed to stop scanner", err));
      }
    };
  }, [lecture]);

  const handleScanSuccess = async (userId) => {
    if (!userId) {
      setError("Invalid QR code.");
      return;
    }

    try {
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        setScanResult({
          success: false,
          message: `User with ID ${userId} not found.`,
        });
        return;
      }

      const userData = userSnapshot.val();
      const attendance = userData.attendance || [];
      const attendanceRecord = `${lecture.date} - ${lecture.title}`;

      if (attendance.includes(attendanceRecord)) {
        setScanResult({
          success: false,
          message: `${userData.name} is already marked as present.`,
        });
      } else {
        const newAttendance = [...attendance, attendanceRecord];
        await update(userRef, { attendance: newAttendance });
        setScanResult({
          success: true,
          message: `Successfully marked ${userData.name} as present.`,
        });
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while updating attendance.");
    }
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(true);
  };

  if (!lecture) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <NavBar />
      <Container className="text-center mt-4">
        <h2>Scan Attendance for: {lecture.title}</h2>
        <div
          id="reader"
          style={{ width: "100%", maxWidth: "500px", margin: "auto" }}
        />
        {scanResult && (
          <Alert
            variant={scanResult.success ? "success" : "warning"}
            className="mt-3"
          >
            {scanResult.message}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}
        {!isScanning && (
          <Button onClick={handleScanAgain} className="mt-3">
            Scan Another
          </Button>
        )}
      </Container>
    </>
  );
}

export default AttendanceScanner;
