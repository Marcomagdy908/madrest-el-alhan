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

    const startScanner = async () => {
      // Don't start if not in scanning mode or if scanner is already active
      if (
        !isScanning ||
        (scannerRef.current && scannerRef.current.isScanning)
      ) {
        return;
      }

      // Initialize scanner on first start or after it has been cleared.
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      try {
        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            setIsScanning(false);
            // No need to stop here, the cleanup effect will handle it.
            await handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            console.log(errorMessage)
          } // qrCodeErrorCallback is optional.
        );
      } catch (err) {
        setError(
          `Unable to start scanner: ${err.message}. Please ensure you have given camera permissions.`
        );
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      // Only try to stop the scanner if it's in a scanning state.
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        scannerRef.current
          .stop()
          .then(() => {
            if (scannerRef.current) {
              scannerRef.current.clear();
            }
            scannerRef.current = null;
          })
          .catch((err) => {
            console.error("Failed to stop and clear scanner", err);
          });
      }
    };
  }, [lecture, isScanning, navigate]);

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
      const lectureAttendeesRef = ref(db, `lecs/${lecture.id}/attendees`);
      const attendeesSnapshot = await get(lectureAttendeesRef);
      const attendees = attendeesSnapshot.val() || {};

      if (attendees[userId] === true) {
        setScanResult({
          success: false,
          message: `${userData.name} is already marked as present.`,
        });
      } else {
        // Set attendance for this user to true for this lecture
        await update(lectureAttendeesRef, { [userId]: true });
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
    // The useEffect will now handle restarting the scanner
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
