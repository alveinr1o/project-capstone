import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaUserGraduate, FaIdCard, FaBook, FaEye, FaList, FaArrowRight, FaTimes } from "react-icons/fa";

const StudentDetailPage = () => {
  const { id } = useParams(); // id = NIM
  const [bimbinganList, setBimbinganList] = useState([]);
  const [mahasiswa, setMahasiswa] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [selectedBimbinganId, setSelectedBimbinganId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBimbingan, setSelectedBimbingan] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access");
      const res = await fetch(`http://127.0.0.1:8000/api/mahasiswa-detail-page/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMahasiswa(data.mahasiswa);
      setBimbinganList(data.bimbingan);
    };
    fetchData();
  }, [id]);

  const handleView = (bimbingan) => {
    setSelectedBimbingan(bimbingan);
    setShowPopup(true);
    };


  const handleApprove = async () => {
    const token = localStorage.getItem("access");
    const res = await fetch(`http://127.0.0.1:8000/api/bimbingan/${selectedBimbinganId}/approve/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    setShowConfirmation(false);
    if (res.ok) {
      alert("Bimbingan disetujui.");
      window.location.reload();
    } else {
      alert("Gagal menyetujui.");
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return;

    const token = localStorage.getItem("access");
    const res = await fetch(`http://127.0.0.1:8000/api/bimbingan/${selectedBimbinganId}/reject/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ alasan: rejectReason }),
    });
    setShowRejectPopup(false);
    if (res.ok) {
      alert("Bimbingan ditolak.");
      window.location.reload();
    } else {
      alert("Gagal menolak.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}><FaUserGraduate /> Detail Mahasiswa</h2>
      {mahasiswa && (
        <div style={styles.studentInfo}>
          <p><FaUserGraduate color="#4d44b5" /> <strong>Nama:</strong> {mahasiswa.nama_Mhs}</p>
          <p><FaIdCard color="#4d44b5" /> <strong>NIM:</strong> {mahasiswa.nim}</p>
          <p><FaBook color="#4d44b5" /> <strong>Tahun Masuk:</strong> {mahasiswa.tahun_masuk}</p>
        </div>
      )}

      <h3 style={{ marginTop: "30px", color: '#4d44b5' }}><FaBook /> Riwayat Bimbingan</h3>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th>No</th>
            <th>Topik</th>
            <th>Mulai</th>
            <th>Selesai</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {bimbinganList.map((b, idx) => (
            <tr key={b.id} style={{ ...styles.row, ...(idx % 2 === 0 ? styles.evenRow : styles.oddRow) }}>
              <td>{idx + 1}</td>
              <td>{b.deskripsi_kegiatan}</td>
              <td>{new Date(b.tanggal_mulai).toLocaleDateString()}</td>
              <td>{new Date(b.tanggal_selesai).toLocaleDateString()}</td>
              <td>{b.status}</td>
              <td>
                <div style={styles.actionGroupCentered}>
                  <button style={{ ...styles.btn, ...styles.blueBtn }} onClick={() => handleView(b)}>
                    <FaEye />
                  </button>
                  <button style={{ ...styles.btn, ...styles.cyanBtn }}>
                    <FaList />
                  </button>
                  {b.status === "sedang diperiksa" && (
                    <>
                      <button style={{ ...styles.btn, ...styles.greenBtn }} onClick={() => {setSelectedBimbinganId(b.id); setShowConfirmation(true);}}>
                        <FaArrowRight />
                      </button>
                      <button style={{ ...styles.btn, ...styles.redBtn }} onClick={() => {setSelectedBimbinganId(b.id); setShowRejectPopup(true);}}>
                        <FaTimes />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup Konfirmasi */}
      {showConfirmation && (
        <div style={styles.confirmationContainer}>
          <div style={styles.confirmationContent}>
            <h3 style={styles.confirmationTitle}>Konfirmasi Persetujuan</h3>
            <p style={styles.confirmationText}>
              Apakah Anda yakin ingin menyetujui kegiatan ini?
            </p>

            <div style={styles.confirmationButtons}>
              <button
                style={{ ...styles.confirmButton, ...styles.approveButton }}
                onClick={handleApprove}
              >
                Setujui
              </button>
              <button
                style={{ ...styles.confirmButton, ...styles.cancelButton }}
                onClick={() => setShowConfirmation(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    {/* Popup Detail */}
      {showPopup && selectedBimbingan && (
        <div style={styles.popupContainer}>
            <div style={styles.popupContent}>
            <h3 style={styles.popupTitle}>Detail Bimbingan</h3>
            <button
                onClick={() => setShowPopup(false)}
                style={styles.closeButton}
            >
                <FaTimes />
            </button>

            <div style={styles.popupFieldsContainer}>
                <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Topik</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{selectedBimbingan.deskripsi_kegiatan}</span>
                </div>
                <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Tanggal Mulai</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{new Date(selectedBimbingan.tanggal_mulai).toLocaleDateString()}</span>
                </div>
                <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Tanggal Selesai</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{new Date(selectedBimbingan.tanggal_selesai).toLocaleDateString()}</span>
                </div>
                <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Status</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{selectedBimbingan.status}</span>
                </div>
            </div>
            </div>
        </div>
    )}

      {/* Popup Reject  */}
      {showRejectPopup && (
        <div style={styles.rejectPopupContainer}>
          <div style={styles.rejectPopupContent}>
            <h3 style={styles.rejectPopupTitle}>Tolak Bimbingan</h3>
            <button
              onClick={() => setShowRejectPopup(false)}
              style={styles.closeButton}
            >
              <FaTimes />
            </button>

            <div style={styles.rejectFormContainer}>
              <div style={styles.rejectFormGroup}>
                <label style={styles.rejectLabel}>Alasan Penolakan:</label>
                <textarea
                  style={styles.rejectTextarea}
                  placeholder="Masukkan alasan penolakan..."
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.rejectButtonsContainer}>
              <button
                style={{ ...styles.rejectButton, ...styles.rejectSubmitButton }}
                onClick={handleReject}
              >
                Tolak
              </button>
              <button
                style={{ ...styles.rejectButton, ...styles.rejectCancelButton }}
                onClick={() => setShowRejectPopup(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Poppins, sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    color: "#333",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#4d44b5",
    marginBottom: "10px",
  },
  studentInfo: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    marginBottom: "30px",
    lineHeight: "1.8",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    borderRadius: "10px",
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: "#4d44b5",
    color: "#fff",
    fontWeight: "bold",
  },
  evenRow: {
    backgroundColor: "#f2f2f2",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  row: {
    height: "60px",
  },
  actionGroupCentered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  btn: {
    border: "none",
    padding: "8px 12px",
    color: "#fff",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },
  blueBtn: {
    backgroundColor: "#6c63ff",
    borderTopLeftRadius: "8px",
    borderBottomLeftRadius: "8px",
  },
  cyanBtn: {
    backgroundColor: "#00cfe8",
  },
  greenBtn: {
    backgroundColor: "#28a745",
  },
  redBtn: {
    backgroundColor: "#dc3545",
    borderTopRightRadius: "8px",
    borderBottomRightRadius: "8px",
  },
  confirmationContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  confirmationContent: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "400px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  confirmationTitle: {
    marginBottom: "15px",
    fontWeight: "bold",
    fontSize: "18px",
  },
  confirmationText: {
    marginBottom: "20px",
    fontSize: "14px",
  },
  confirmationButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  confirmButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  approveButton: {
    backgroundColor: "#28a745",
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    color: "#fff",
  },

  rejectPopupContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  rejectPopupContent: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "450px",
    position: "relative",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
  rejectPopupTitle: {
    marginBottom: "15px",
    fontWeight: "bold",
    fontSize: "18px",
  },
  rejectFormContainer: {
    marginBottom: "20px",
  },
  rejectFormGroup: {
    display: "flex",
    flexDirection: "column",
  },
  rejectLabel: {
    marginBottom: "5px",
    fontWeight: "bold",
  },
  rejectTextarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    resize: "vertical",
  },
  rejectButtonsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  rejectButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  rejectSubmitButton: {
    backgroundColor: "#dc3545",
    color: "#fff",
  },
  rejectCancelButton: {
    backgroundColor: "#6c757d",
    color: "#fff",
  },
  popupOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
},
popupContent: {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "10px",
  width: "650px",
  position: "relative",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
},
popupTitle: {
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "20px",
  color: "#4d44b5",
  textAlign: "center",
},

popupFieldsContainer: {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
},
popupField: {
  display: "flex",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid #eee",
  gap: "20px"
},
popupLabel: {
  fontWeight: "bold",
  color: "#555",
  marginBottom: "4px",
},
popupValue: {
  color: "#333",
  wordWrap: "break-word",
},
popupContainer: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
},
popupFieldLabel: {
  fontWeight: "bold",
  color: "#333",
},
popupFieldColon: {
  margin: "0 10px",
},


};

export default StudentDetailPage;