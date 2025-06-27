import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FaGraduationCap,
  FaHome,
  FaTrash,
  FaPlus,
  FaBook,
  FaEdit,
  FaClipboardList,
  FaStar,
  FaComment,
  FaUser,
  FaVideo,
  FaUpload,
  FaBriefcaseMedical,
  FaCar,
  FaQuestionCircle,
  FaCompass,
  FaComments,
  FaBell,
  FaBars,
  FaEye,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaChevronDown,
} from "react-icons/fa";

function App() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [showTimelinePopup, setShowTimelinePopup] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);

  const [showTambahBimbingan, setShowTambahBimbingan] = useState(false);

  const [showEditTimelinePopup, setShowEditTimelinePopup] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pengajuanData, setPengajuanData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [profilMahasiswa, setProfilMahasiswa] = useState(null);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = pengajuanData.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(pengajuanData.length / entriesPerPage);

  const handleViewDetail = async (id) => {
    const token = localStorage.getItem("access");
    try {
      const response = await fetch(
        `http://localhost:8000/api/detail-bimbingan/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setDetailData(data);
      setShowPopup(true);
    } catch (err) {
      alert("Gagal mengambil detail kegiatan");
    }
  };  

  const handleHapusPengajuan = async (id) => {
    const confirm = window.confirm("Yakin ingin menghapus pengajuan ini?");
    if (!confirm) return;

    const token = localStorage.getItem("access");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/pengajuan-bimbingan/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 204) {
        // Hapus dari tampilan
        setPengajuanData((prev) => prev.filter((item) => item.id !== id));
      } else {
        const data = await res.json();
        alert("Gagal menghapus: " + (data.error || res.statusText));
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus.");
      console.error(error);
    }
  };
  

  const [filterLabel, setFilterLabel] = useState("Pilih Tahun");
  const timelineSteps = [
    { id: 1, label: "Penetapan Komisi Pembimbing" },
    { id: 2, label: "Sidang Komisi 1" },
    { id: 3, label: "Kolokium" },
    { id: 4, label: "Proposal" },
    { id: 5, label: "Penelitian dan Bimbingan" },
    { id: 6, label: "Evaluasi dan Monitoring" },
    { id: 7, label: "Sidang Komisi 2" },
    { id: 8, label: "Seminar" },
    { id: 9, label: "Publikasi Ilmiah" },
    { id: 10, label: "Ujian Tesis" },
  ];

  const [filterValue, setFilterValue] = useState("all");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  
  const filterOptions = [
    { value: "all", label: "Semua" },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
  ];

  const handleSaveTimeline = async () => {
    const selected = timelineSteps.find(
      (step) => step.label === selectedMilestone
    );
    if (!selected || !newDeadline) {
      alert("Milestone dan deadline harus diisi.");
      return;
    }

    const formattedDeadline = newDeadline;

    try {
      const token = localStorage.getItem("access");
      const response = await fetch(`http://127.0.0.1:8000/api/edit-deadline/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milestone_id: selected.id,
          new_deadline: formattedDeadline,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || "Berhasil update timeline");
        setShowEditTimelinePopup(false);
        setSelectedMilestone("");
        setNewDeadline("");
      } else {
        alert(data.error || "Gagal update timeline");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghubungi server.");
    }
  };

  const handleUploadBukti = async () => {
    const selected = timelineSteps.find(
      (step) => step.label === selectedMilestone
    );

    if (!selected || !selectedFile) {
      alert("Milestone dan file bukti harus diisi.");
      return;
    }

    const formData = new FormData();
    formData.append("bukti_file", selectedFile);

    try {
      const token = localStorage.getItem("access");
      const response = await fetch(
        `http://127.0.0.1:8000/api/upload-bukti/${selected.id}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert(data.message || "✅ Bukti berhasil diunggah");
        setShowUploadPopup(false);
        setSelectedMilestone("");
        setSelectedFile(null);
      } else {
        alert(data.error || "❌ Gagal mengunggah bukti");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Terjadi kesalahan saat menghubungi server.");
    }
  };  

  useEffect(() => {
    const fetchProfilMahasiswa = async () => {
      const token = localStorage.getItem("access");
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/profil-mahasiswa/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setProfilMahasiswa(data);
      } catch (error) {
        console.error("Gagal mengambil data profil mahasiswa", error);
      }
    };

    fetchProfilMahasiswa();
  }, []);  
  
useEffect(() => {
  const fetchTimeline = async () => {
    const token = localStorage.getItem("access");
    const res = await fetch("http://127.0.0.1:8000/api/timeline/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTimelineData(data);
  };
  fetchTimeline();
}, []);

useEffect(() => {
  const fetchChartData = async () => {
    const token = localStorage.getItem("access");

    if (!token) {
      console.warn("Token tidak ditemukan, user belum login?");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/sebaran-mahasiswa/?filter=${filterValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error dari API:", errorData);
        return;
      }

      const data = await res.json();
      console.log("Memuat data dengan filter tahun:", filterValue);
      console.log("Data diterima:", data);
      setChartData(data);
    } catch (error) {
      console.error("Gagal memuat data sebaran mahasiswa:", error);
    }
  };

  fetchChartData();
}, [filterValue]);


useEffect(() => {
  const fetchPengajuan = async () => {
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/pengajuan-bimbingan/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPengajuanData(data.pengajuan || []);
      } else {
        console.error("Gagal ambil pengajuan:", data.error);
      }
    } catch (err) {
      console.error("Error pengajuan:", err);
    }
  };

  fetchPengajuan();
}, []);


const getCircleProps = (status) => {
  switch (status) {
    case "ahead of schedule":
      return { backgroundColor: "#3b82f6", color: "white", border: "none" };
    case "on ideal schedule":
      return { backgroundColor: "#eab308", color: "white", border: "none" };
    case "behind the schedule":
      return { backgroundColor: "#ef4444", color: "white", border: "none" };
    default:
      return {
        backgroundColor: "#D2D3D8",
        color: "#9ca3af",
        border: "2px solid #D2D3D8",
      };
  }
};

const getLineColor = (curStatus, nextStatus) => {
  if (curStatus === "disetujui") return "#3b82f6";
  if (curStatus === "pending") return "#eab308";
  if (curStatus === "ditolak") return "#ef4444";
  return "#D2D3D8";
};

const statusBadgeColors = {
  "ahead of schedule": "#28a745", // hijau
  "on ideal schedule": "#ffc107", // kuning
  "behind the schedule": "#dc3545", // merah
};

const lastApprovedMilestone = [...timelineData]
  .reverse()
  .find((m) => m.is_approved === "disetujui");

const rawStatus = lastApprovedMilestone?.status?.toLowerCase();
const statusLabel = rawStatus
  ? rawStatus
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  : "Belum ada";
const badgeColor = statusBadgeColors[rawStatus] || "#D2D3D8";

const getDurasiJam = (mulai, selesai) => {
  const start = new Date(mulai);
  const end = new Date(selesai);
  const durasiMs = end - start;
  const durasiJam = durasiMs / (1000 * 60 * 60);
  return durasiJam;
};


  return (
    <div className="App" style={styles.app}>
      {/* Top Header */}
      <div style={styles.topRectangle}>
        <div style={styles.topBarContent}>
          <FaBars style={styles.menuBars} />
          <div style={styles.rightContent}>
            <div style={styles.topIconBar}>
              <FaCompass style={styles.topIcon} />
              <FaComments style={styles.topIcon} />
              <FaBell style={styles.topIcon} />
            </div>
            <div style={styles.userProfile}>
              <img
                src={
                  profilMahasiswa?.foto_profil
                    ? `http://127.0.0.1:8000/${profilMahasiswa.foto_profil}`
                    : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                }
                alt="Foto Profil"
                style={styles.profilePic}
              />
              <div style={styles.userInfo}>
                <div style={styles.userName}>
                  {profilMahasiswa?.nama_Mhs || "Mahasiswa"}
                </div>
                <div style={styles.userId}>{profilMahasiswa?.nim || "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditTimelinePopup && (
        <div style={styles.editTimelinePopupContainer}>
          <div style={styles.editTimelinePopupContent}>
            <h3 style={styles.editTimelineTitle}>Edit Timeline</h3>
            <button
              onClick={() => setShowEditTimelinePopup(false)}
              style={styles.editTimelineCloseButton}
            >
              <FaTimes />
            </button>

            <div style={styles.editTimelineInputGroup}>
              <label style={styles.editTimelineLabel}>Pilih Milestone</label>
              <select
                style={styles.editTimelineSelect}
                value={selectedMilestone}
                onChange={(e) => setSelectedMilestone(e.target.value)}
              >
                <option value="">Pilih Milestone</option>
                {timelineSteps.map((step) => (
                  <option key={step.id} value={step.label}>
                    {step.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.editTimelineInputGroup}>
              <label style={styles.editTimelineLabel}>Deadline Baru</label>
              <div style={styles.editTimelineDateInputContainer}>
                <input
                  type="date"
                  style={styles.editTimelineInput}
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.editTimelineButtonGroup}>
              <button
                style={{
                  ...styles.editTimelineButton,
                  ...styles.editTimelineSaveButton,
                }}
                onClick={handleSaveTimeline}
              >
                Simpan
              </button>
              <button
                style={{
                  ...styles.editTimelineButton,
                  ...styles.editTimelineCancelButton,
                }}
                onClick={() => setShowEditTimelinePopup(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadPopup && (
        <div style={styles.uploadPopupContainer}>
          <div style={styles.uploadPopupContent}>
            {/* Header */}
            <div>
              <h3 style={styles.uploadPopupTitle}>Upload Bukti Milestone</h3>
              <button
                onClick={() => setShowUploadPopup(false)}
                style={styles.closeButton}
              >
                <FaTimes />
              </button>
            </div>

            {/* Pilih Milestone */}
            <div style={styles.uploadFormGroup}>
              <label style={styles.uploadLabel}>Pilih Milestone</label>
              <div>
                <select
                  style={styles.uploadSelect}
                  value={selectedMilestone}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
                >
                  <option value="">Pilih Milestone</option>
                  {timelineSteps.map((step) => (
                    <option key={step.id} value={step.label}>
                      {step.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload File */}
            <div style={styles.uploadFormGroup}>
              <label style={styles.uploadLabel}>Upload Bukti</label>
              <div style={styles.uploadFileContainer}>
                <input
                  type="file"
                  style={styles.uploadFileInput}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </div>
            </div>

            {/* Tombol Aksi */}
            <div style={styles.uploadButtonGroup}>
              <div>
                <button
                  style={{
                    ...styles.uploadButton,
                    ...styles.uploadSubmitButton,
                  }}
                  onClick={handleUploadBukti}
                >
                  Upload Bukti
                </button>
              </div>
              <div>
                <button
                  style={{
                    ...styles.uploadButton,
                    ...styles.uploadCancelButton,
                  }}
                  onClick={() => setShowUploadPopup(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Detail */}
      {showPopup && detailData && (
        <div style={styles.popupContainer}>
          <div style={styles.popupContent}>
            <h3 style={styles.popupTitle}>Detail Kegiatan</h3>
            <button
              onClick={() => setShowPopup(false)}
              style={styles.closeButton}
            >
              <FaTimes />
            </button>

            <div style={styles.popupImageContainer}>
              <div style={styles.popupImagePlaceholder}>
                {/* bisa ganti jadi preview file */}
                {detailData.file && (
                  <a
                    href={`http://localhost:8000/media/${detailData.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lihat Dokumen
                  </a>
                )}
              </div>
            </div>

            <div style={styles.popupFieldsContainer}>
              <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Jenis Kegiatan</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{detailData.tipe_penyelenggaraan}</span>
              </div>
              <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Nama Kegiatan</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{detailData.nama}</span>
              </div>
              <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Waktu Kegiatan</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>
                  {new Date(detailData.tanggal_mulai).toLocaleString()} -{" "}
                  {new Date(detailData.tanggal_selesai).toLocaleString()}
                </span>
              </div>
              <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Durasi</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>
                  {getDurasiJam(
                    detailData.tanggal_mulai,
                    detailData.tanggal_selesai
                  )}{" "}
                  jam
                </span>
              </div>
              <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Deskripsi</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{detailData.deskripsi_kegiatan}</span>
              </div>
              <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Pembimbing</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{detailData.pembimbing_nama || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => setShowConfirmation(false)}
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

      {/* Popup Timeline */}
      {showTimelinePopup && (
        <div style={styles.timelinePopupContainer}>
          <div style={styles.timelinePopupContent}>
            <h3 style={styles.timelinePopupTitle}>Log Perubahan Timeline</h3>
            <button
              onClick={() => setShowTimelinePopup(false)}
              style={styles.closeButton}
            >
              <FaTimes />
            </button>

            <div style={styles.timelineTableContainer}>
              <table style={styles.timelineTable}>
                <thead>
                  <tr style={styles.timelineTableHeader}>
                    <th
                      style={{
                        ...styles.timelineTableCell,
                        ...styles.timelineTableHeaderCell,
                      }}
                    >
                      Timestamp
                    </th>
                    <th
                      style={{
                        ...styles.timelineTableCell,
                        ...styles.timelineTableHeaderCell,
                      }}
                    >
                      Nama Tahap
                    </th>
                    <th
                      style={{
                        ...styles.timelineTableCell,
                        ...styles.timelineTableHeaderCell,
                      }}
                    >
                      Sebelum Diubah
                    </th>
                    <th
                      style={{
                        ...styles.timelineTableCell,
                        ...styles.timelineTableHeaderCell,
                      }}
                    >
                      Setelah Diubah
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {timelineData.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        ...styles.timelineTableRow,
                        backgroundColor:
                          index % 2 === 0 ? "#F2F2F2" : "#FFFFFF",
                      }}
                    >
                      <td style={styles.timelineTableCell}>{item.timestamp}</td>
                      <td style={styles.timelineTableCell}>{item.namaTahap}</td>
                      <td style={styles.timelineTableCell}>
                        {item.sebelumDiubah}
                      </td>
                      <td style={styles.timelineTableCell}>
                        {item.setelahDiubah}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={styles.timelineFooter}>
              <button
                style={styles.timelineCloseButton}
                onClick={() => setShowTimelinePopup(false)}
              >
                Tutup
              </button>
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
                />
              </div>
            </div>

            <div style={styles.rejectButtonsContainer}>
              <button
                style={{ ...styles.rejectButton, ...styles.rejectSubmitButton }}
                onClick={() => setShowRejectPopup(false)}
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

      {showTambahBimbingan && (
        <div style={styles.popupContainer}>
          <div style={styles.tambahBimbinganContent}>
            <h3 style={styles.popupTitle}>Tambah Bimbingan</h3>
            <button
              onClick={() => setShowTambahBimbingan(false)}
              style={styles.closeButton}
            >
              <FaTimes />
            </button>

            {/* Form Tambah Bimbingan */}
            <div style={styles.tambahBimbinganForm}>
              {/* Gambaran Kegiatan */}
              <div style={styles.tambahBimbinganSection}>
                <h4 style={styles.tambahBimbinganSectionTitle}>
                  Gambaran Kegiatan
                </h4>

                <div style={styles.tambahBimbinganFormGroup}>
                  <label style={styles.tambahBimbinganLabel}>
                    Tahun Semester
                  </label>
                  <select style={styles.tambahBimbinganSelect}>
                    <option>Pilih --</option>
                    <option>2024/2025 Semester Genap</option>
                    <option>2024/2025 Semester Ganjil</option>
                  </select>
                </div>

                <div style={styles.tambahBimbinganFormGroup}>
                  <label style={styles.tambahBimbinganLabel}>
                    Nama Kegiatan*
                  </label>
                  <input
                    type="text"
                    placeholder="Judul/nama kegiatan yang dilkuti"
                    style={styles.tambahBimbinganInput}
                  />
                </div>

                <div style={styles.tambahBimbinganFormGroup}>
                  <label style={styles.tambahBimbinganLabel}>
                    Deskripsi Kegiatan*
                  </label>
                  <textarea
                    placeholder="Mencakup gambaran kegiatan, capatan pembelajaran, tujuan/manfaat yang diperoleh, kompetensi yang dikuasai setelah mengikuti kegiatan"
                    style={{ ...styles.tambahBimbinganInput, height: "100px" }}
                    rows={4}
                  />
                </div>
              </div>

              {/* Pembatas */}
              <hr style={styles.tambahBimbinganDivider} />

              {/* Waktu dan Tempat */}
              <div style={styles.tambahBimbinganSection}>
                <h4 style={styles.tambahBimbinganSectionTitle}>
                  Waktu dan Tempat
                </h4>

                <div style={styles.tambahBimbinganFormGroup}>
                  <label style={styles.tambahBimbinganLabel}>
                    Waktu Kegiatan*
                  </label>
                  <input type="date" style={styles.tambahBimbinganInput} />
                </div>

                <div style={styles.tambahBimbinganFormGroup}>
                  <label style={styles.tambahBimbinganLabel}>
                    Durasi Jam Kegiatan*
                  </label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="number"
                      min="0"
                      defaultValue="0"
                      style={{
                        ...styles.tambahBimbinganInput,
                        width: "80px",
                        textAlign: "center",
                      }}
                    />
                    <span style={{ marginLeft: "10px" }}>Jam</span>
                  </div>
                </div>

                <div style={styles.tambahBimbinganFormGroup}>
                  <label style={styles.tambahBimbinganLabel}>
                    Tipe Penyelenggaraan*
                  </label>
                  <select style={styles.tambahBimbinganSelect}>
                    <option>Hybrid</option>
                    <option>Offline</option>
                    <option>Online</option>
                  </select>
                </div>
              </div>

              {/* Pembatas */}
              <hr style={styles.tambahBimbinganDivider} />

              {/* Pembimbing Kegiatan */}
              <div style={styles.tambahBimbinganSection}>
                <h4 style={styles.tambahBimbinganSectionTitle}>
                  Pembimbing Kegiatan
                </h4>

                <div style={styles.tambahBimbinganFormGroup}>
                  <label style={styles.tambahBimbinganLabel}>
                    Pembimbing IPB*
                  </label>
                  <select style={styles.tambahBimbinganSelect}>
                    <option>Pilih Dosen --</option>
                    <option>Dr. Eng. Annisa, S.Kom, M.Kom</option>
                    <option>Prof. Budi Rahardjo, S.Kom, M.Sc.</option>
                  </select>
                </div>
              </div>

              {/* Pembatas */}
              <hr style={styles.tambahBimbinganDivider} />

              {/* Dokumen Pendukung */}
              <div style={styles.tambahBimbinganSection}>
                <h4 style={styles.tambahBimbinganSectionTitle}>
                  Dokumen Pendukung
                </h4>

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "15px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          ...styles.tambahBimbinganTableHeader,
                          textAlign: "left",
                        }}
                      >
                        Name*
                      </th>
                      <th style={styles.tambahBimbinganTableHeader}>File*</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: "8px 0",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        Sertifikat Kegiatan, LOA, Laporan Kegiatan,
                        Photo/Dokumentasi Kegiatan, dll
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          borderBottom: "1px solid #eee",
                          textAlign: "center",
                        }}
                      >
                        <button style={styles.tambahBimbinganFileButton}>
                          Choose File
                        </button>
                        <span style={{ fontSize: "12px", marginLeft: "5px" }}>
                          No file chosen
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={styles.tambahBimbinganFormGroup}>
                  <label style={styles.tambahBimbinganLabel}>
                    Url yang merujuk kepada informasi kegiatan (website, media
                    social, drive, dll)
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan URL"
                    style={styles.tambahBimbinganInput}
                  />
                </div>

                <p
                  style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
                >
                  Maksimum upload: 10MB. Jika lebih, upload ke tempat lain dan
                  masukkan alamatiya pada bagian Link.
                </p>
              </div>

              {/* Tombol Submit */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  style={{
                    ...styles.tambahBimbinganButton,
                    backgroundColor: "#6c757d",
                  }}
                  onClick={() => setShowTambahBimbingan(false)}
                >
                  Batal
                </button>
                <button
                  style={{
                    ...styles.tambahBimbinganButton,
                    backgroundColor: "#3b82f6",
                  }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div style={styles.leftRectangle}>
        <div style={styles.sidebarIcons}>
          <div style={styles.sidebarIconContainer}>
            <FaHome style={styles.sidebarIcon} />
          </div>

          <div style={styles.iconGroup}>
            <div style={styles.sidebarIconContainer}>
              <FaBook style={styles.sidebarIcon} />
            </div>
            <div style={styles.sidebarIconContainer}>
              <FaClipboardList style={styles.sidebarIcon} />
            </div>
          </div>

          <div style={styles.sidebarIconContainer}>
            <FaStar style={styles.sidebarIcon} />
          </div>
          <div style={styles.sidebarIconContainer}>
            <FaComment style={styles.sidebarIcon} />
          </div>
          <div style={styles.sidebarIconContainer}>
            <FaUser style={styles.sidebarIcon} />
          </div>
          <div style={styles.sidebarIconContainer}>
            <FaVideo style={styles.sidebarIcon} />
          </div>
          <div
            style={{
              ...styles.sidebarIconContainer,
              ...styles.activeIconContainer,
            }}
          >
            <FaGraduationCap
              style={{ ...styles.sidebarIcon, ...styles.activeSidebarIcon }}
            />
          </div>
          <div style={styles.sidebarIconContainer}>
            <FaUpload style={styles.sidebarIcon} />
          </div>
          <div style={styles.sidebarIconContainer}>
            <FaBriefcaseMedical style={styles.sidebarIcon} />
          </div>
          <div style={styles.sidebarIconContainer}>
            <FaCar style={styles.sidebarIcon} />
          </div>
          <div style={styles.sidebarIconContainer}>
            <FaQuestionCircle style={styles.sidebarIcon} />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={styles.contentWrapper}>
        <div style={styles.headerContainer}>
          <h1 style={styles.judul}>Tugas Akhir</h1>
        </div>

        <div style={styles.timelineVerificationContainer}>
          <div style={styles.timelineVerificationHeader}>
            <h3 style={styles.timelineVerificationTitle}>
              Status Verifikasi
              <span
                style={{
                  ...styles.timelineVerificationBadge,
                  backgroundColor: badgeColor,
                  color: "white",
                }}
              >
                {statusLabel}
              </span>
            </h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{
                  ...styles.timelineVerificationEditButton,
                  backgroundColor: "#F8F9FA",
                }}
                onClick={() => setShowUploadPopup(true)}
              >
                <FaUpload style={{ marginRight: "4px" }} />
                Upload Bukti Milestone
              </button>
              <button
                style={styles.timelineVerificationEditButton}
                onClick={() => setShowEditTimelinePopup(true)}
              >
                <FaEdit style={{ marginRight: "4px" }} /> Edit Timeline
              </button>
            </div>
          </div>

          {/* ini */}
          <div style={styles.timelineContainer}>
            <div style={styles.timelineStepsWrapper}>
              {timelineData.map((step, index) => {
                const isLast = index === timelineData.length - 1;

                // Index milestone terakhir yang disetujui
                const lastApprovedIndex = timelineData
                  .map((s) => s.is_approved)
                  .lastIndexOf("disetujui");

                const isReached = index <= lastApprovedIndex;

                const circleProps = isReached
                  ? getCircleProps(step.status?.toLowerCase())
                  : {
                      backgroundColor: "#D2D3D8",
                      color: "#9ca3af",
                      border: "2px solid #D2D3D8",
                    };

                // Garis diwarnai jika step dan step berikutnya sama-sama sudah tercapai
                const nextStep = timelineData[index + 1];
                const nextReached = index + 1 <= lastApprovedIndex;

                const lineColor =
                  isReached && nextReached
                    ? getLineColor(step.is_approved, nextStep?.is_approved)
                    : isReached
                    ? "#3b82f6" // garis menuju ke milestone berikutnya yang belum dicapai
                    : "#D2D3D8"; // belum dicapai sama sekali

                return (
                  <React.Fragment key={step.id}>
                    <div style={styles.timelineStepItem}>
                      <div
                        style={{
                          ...styles.timelineStepCircle,
                          ...circleProps,
                          zIndex: 3,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={styles.timelineStepLabel}>
                        {step.label.split(" ").map((w, i) => (
                          <div key={i}>{w}</div>
                        ))}
                      </div>
                    </div>
                    {!isLast && (
                      <div
                        style={{
                          ...styles.timelineStepLine,
                          backgroundColor: lineColor,
                          zIndex: 1,
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Box (Chart) */}
        <div style={styles.middleBox}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Sebaran Mahasiswa</h3>
            <div style={styles.filterContainer}>
              <div
                style={styles.filterDropdownHeader}
                onClick={() => setShowFilterOptions((prev) => !prev)}
              >
                <span>{filterLabel}</span>
                <FaChevronDown style={styles.filterIcon} />
              </div>

              {showFilterOptions && (
                <div style={styles.filterDropdownList}>
                  {filterOptions.map((opt) => (
                    <label key={opt.value} style={styles.filterOptionItem}>
                      <input
                        type="radio"
                        name="filter"
                        value={opt.value}
                        checked={filterValue === opt.value}
                        onChange={() => {
                          setFilterValue(opt.value);
                          setFilterLabel(opt.label);
                          setShowFilterOptions(false);
                        }}
                        style={styles.filterRadioInput}
                      />
                      <span style={styles.filterOptionText}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 50, // Increased bottom margin for rotated text
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  height={80}
                  tickLine={false}
                  tick={({ x, y, payload }) => {
                    const MAX_CHARS_PER_LINE = 12;
                    const words = payload.value.split(" ");
                    const lines = [];
                    let currentLine = "";

                    words.forEach((word) => {
                      if ((currentLine + word).length <= MAX_CHARS_PER_LINE) {
                        currentLine += (currentLine ? " " : "") + word;
                      } else {
                        lines.push(currentLine);
                        currentLine = word;
                      }
                    });

                    if (currentLine) lines.push(currentLine);

                    return (
                      <g transform={`translate(${x},${y + 10})`}>
                        {lines.map((line, index) => (
                          <text
                            key={index}
                            x={0}
                            y={index * 12}
                            textAnchor="middle"
                            fontSize={10}
                            fill="#666"
                          >
                            {line}
                          </text>
                        ))}
                      </g>
                    );
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#666" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={styles.tooltipContainer}>
                          <div style={styles.tooltipHeader}>{label}</div>
                          <div style={styles.tooltipContent}>
                            <span style={styles.tooltipLabel}>Mahasiswa: </span>
                            <span style={styles.tooltipValue}>
                              {payload[0].value} orang
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#4A90E2"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kontrol Entri dan Tombol Tambah */}
        <div style={styles.tableTopControls}>
          <div style={styles.entriesControl}>
            <span style={styles.entriesLabel}>Tampilkan</span>
            <input
              type="number"
              min="1"
              max={pengajuanData.length}
              value={entriesPerPage}
              onChange={(e) => {
                const value = Math.max(
                  1,
                  Math.min(pengajuanData.length, Number(e.target.value))
                );
                setEntriesPerPage(value);
                setCurrentPage(1);
              }}
              style={styles.entriesInput}
            />
            <span style={styles.entriesLabel}>entri</span>
          </div>
          <div style={styles.addButtonContainer}>
            <button
              style={styles.addButton}
              onClick={() => navigate("/tambah_bimbingan")}
            >
              <FaPlus style={styles.addButtonIcon} />
              <span style={styles.addButtonText}>Tambah Bimbingan</span>
            </button>
          </div>
        </div>

        {/* Tabel Container */}
        <div style={styles.tabelContainer}>
          <h3 style={styles.tabelTitle}>Pengajuan Bimbingan</h3>
          <table style={styles.tabelMahasiswa}>
            <thead>
              <tr style={styles.tableHeader}>
                <th
                  style={{
                    ...styles.tableHeaderCell,
                    width: "5%",
                    textAlign: "center",
                  }}
                >
                  No
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "15%" }}>
                  Tahun Semester
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "20%" }}>
                  Nama Dosen Pembimbing
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "10%" }}>
                  Waktu Kegiatan
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "10%" }}>
                  Durasi Kegiatan
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "15%" }}>
                  Jenis Kegiatan
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "15%" }}>
                  Status Progress
                </th>
                <th
                  style={{
                    ...styles.tableHeaderCell,
                    width: "10%",
                    textAlign: "center",
                  }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((item, index) => (
                <tr key={item.id} style={styles.tableRow}>
                  <td style={{ ...styles.tableCell, textAlign: "center" }}>
                    {index + 1 + (currentPage - 1) * entriesPerPage}
                  </td>
                  <td style={styles.tableCell}>{item.tahunSemester}</td>
                  <td style={styles.tableCell}>{item.namaDosen}</td>
                  <td style={styles.tableCell}>{item.waktu}</td>
                  <td style={styles.tableCell}>{item.durasi}</td>
                  <td style={styles.tableCell}>{item.jenis}</td>
                  <td style={styles.tableCell}>
                    <div
                      style={{
                        ...styles.status,
                        ...(item.status === "Sedang Diperiksa"
                          ? styles.yellowStatus
                          : item.status === "Disetujui"
                          ? styles.greenStatus
                          : styles.redStatus),
                      }}
                    >
                      {item.status === "Sedang Diperiksa" && (
                        <FaExclamationTriangle style={styles.statusIcon} />
                      )}
                      {item.status === "Disetujui" && (
                        <FaCheck style={styles.statusIcon} />
                      )}
                      {item.status}
                    </div>
                  </td>
                  <td style={{ ...styles.tableCell, ...styles.aksi }}>
                    <div style={styles.actionButtonsContainer}>
                      <button
                        type="button"
                        style={{
                          ...styles.btn,
                          ...styles.orangeBtn,
                          ...styles.leftButton,
                        }}
                        onClick={() => navigate(`/edit-bimbingan/${item.id}`)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        style={{ ...styles.btn, ...styles.blueBtn }}
                        onClick={() => handleViewDetail(item.id)}
                      >
                        <FaEye />
                      </button>
                      <button
                        style={{
                          ...styles.btn,
                          ...styles.redBtn,
                          ...styles.rightButton,
                        }}
                        onClick={() => handleHapusPengajuan(item.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div style={styles.paginationContainer}>
          <div style={styles.paginationInfo}>
            Menampilkan {indexOfFirstEntry + 1} sampai{" "}
            {Math.min(indexOfLastEntry, pengajuanData.length)} dari{" "}
            {pengajuanData.length} entri
          </div>

          <div style={styles.paginationButtons}>
            <button
              style={styles.paginationButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                style={{
                  ...styles.paginationButton,
                  ...(page === currentPage
                    ? styles.activePaginationButton
                    : {}),
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              style={styles.paginationButton}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#F3F4FF",
    position: "relative",
    fontFamily: "'Poppins', sans-serif",
    margin: 0,
    padding: 0,
  },
  topRectangle: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "53px",
    backgroundColor: "white",
    zIndex: 1100,
    boxShadow: "0px 1px 5px rgba(0, 0, 0, 0.1)",
  },
  topBarContent: {
    height: "100%",
    marginLeft: "92.7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
  },
  menuBars: {
    marginRight: "auto",
    fontSize: "20px",
    color: "#7F7F7F",
    cursor: "pointer",
  },
  rightContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  topIconBar: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  topIcon: {
    fontSize: "23px",
    color: "#7F7F7F",
    cursor: "pointer",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  profilePic: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #ccc",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  userName: {
    fontWeight: "bold",
    color: "#7F7F7F",
    fontSize: "16px",
  },
  userId: {
    fontWeight: "lighter",
    color: "#7F7F7F",
    fontSize: "14px",
  },
  leftRectangle: {
    position: "fixed",
    top: "53px",
    left: 0,
    width: "64px",
    height: "calc(100vh - 53px)",
    backgroundColor: "white",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px 0",
    zIndex: 1000,
  },
  sidebarIcons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    width: "100%",
  },
  sidebarIconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    transition: "background-color 0.2s",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
  activeIconContainer: {
    background: "linear-gradient(to right, #3a00ff, #3183ff)",
  },
  sidebarIcon: {
    fontSize: "18px",
    color: "#334a40", // Warna ikon tidak aktif
  },
  iconGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    width: "100%",
  },
  contentWrapper: {
    marginLeft: "92.7px",
    padding: "92.7px 20px 20px 20px",
    maxWidth: "calc(100% - 92.7px)",
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    paddingLeft: "0px",
  },
  judul: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#343A40",
    margin: 0,
  },
  boxRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },
  colorBox: {
    flex: 1,
    height: "80px",
    borderRadius: "12px",
    padding: "15px 20px",
    color: "white",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  blueBox: {
    backgroundColor: "#263C92",
  },
  greenBox: {
    backgroundColor: "#28A745",
  },
  yellowBox: {
    backgroundColor: "#FFC107",
    color: "black",
  },
  redBox: {
    backgroundColor: "#DC3545",
  },
  boxIcon: {
    fontSize: "35px",
    marginRight: "12px",
    color: "rgba(255,255,255,0.8)",
  },
  boxContent: {
    display: "flex",
    flexDirection: "column",
  },
  boxNumber: {
    fontSize: "28px",
    fontWeight: "bold",
    lineHeight: 1,
  },
  boxLabel: {
    fontSize: "14px",
    fontWeight: "normal",
    marginTop: "5px",
    opacity: 0.9,
  },
  middleBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    padding: "20px",
    minHeight: "400px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  chartTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    margin: "0",
  },
  filterContainer: {
    position: "relative",
    display: "inline-block",
    width: "150px",
  },
  filterText: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "500",
  },
  filterOptions: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
  filterOption: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#666",
    cursor: "pointer",
  },
  chartContainer: {
    width: "100%",
    height: "300px",
  },
  tooltipContainer: {
    backgroundColor: "#333",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  tooltipHeader: {
    fontWeight: "bold",
    marginBottom: "4px",
  },
  tooltipContent: {
    display: "flex",
    alignItems: "center",
  },
  tooltipLabel: {
    marginRight: "4px",
  },
  tooltipValue: {
    fontWeight: "bold",
  },
  tabelContainer: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    overflowX: "auto",
    marginBottom: "10px",
    width: "100%",
    boxSizing: "border-box",
  },
  tableTopControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    width: "100%",
  },
  tabelMahasiswa: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    color: "#333",
    tableLayout: "fixed",
  },
  tableHeader: {
    backgroundColor: "#f3f4ff",
  },
  tableHeaderCell: {
    padding: "12px",
    verticalAlign: "middle",
    fontWeight: "bold",
    textAlign: "left",
  },
  tableBodyCell: {
    fontWeight: "normal", // Pastikan isi tabel regular
    // ... properti lainnya tetap
  },
  tableRow: {
    borderBottom: "1px solid #ddd",
  },
  tableCell: {
    padding: "12px",
    verticalAlign: "middle",
    border: "none",
    fontWeight: 400,
  },
  status: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    minHeight: "20px",
    boxSizing: "border-box",
  },
  statusIcon: {
    fontSize: "14px",
  },
  greenStatus: {
    backgroundColor: "#28a745",
    color: "white",
  },
  yellowStatus: {
    backgroundColor: "#ffc107",
    color: "black",
  },
  redStatus: {
    backgroundColor: "#dc3545",
    color: "white",
  },
  aksi: {
    textAlign: "center",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  actionButtonsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  btn: {
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "white",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    transition: "opacity 0.2s",
  },
  blueBtn: {
    backgroundColor: "#6366f1",
  },
  cyanBtn: {
    backgroundColor: "#06b6d4",
  },
  orangeBtn: {
    backgroundColor: "#FD7E14",
  },
  redBtn: {
    backgroundColor: "#ef4444",
  },

  // Popup styles
  popupContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  popupContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    position: "relative",
    minWidth: "450px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  popupTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  closeButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#666",
    fontSize: "16px",
    padding: "5px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  popupImageContainer: {
    marginBottom: "20px",
  },
  popupImagePlaceholder: {
    width: "100%",
    height: "200px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
    fontSize: "14px",
    border: "2px dashed #ddd",
  },
  popupFieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  popupField: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  popupFieldLabel: {
    minWidth: "130px",
    fontSize: "14px",
    color: "#555",
    fontWeight: "500",
  },
  popupFieldColon: {
    fontSize: "14px",
    color: "#555",
  },
  // Popup Konfirmasi Styles
  confirmationContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmationContent: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    position: "relative",
    minWidth: "350px",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    textAlign: "center",
  },
  confirmationTitle: {
    margin: "0 0 15px 0",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
  },
  confirmationText: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "25px",
  },
  confirmationButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },
  confirmButton: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
    minWidth: "100px",
  },
  approveButton: {
    backgroundColor: "#28a745",
    color: "white",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    color: "white",
  },
  // Timeline Popup Styles
  timelinePopupContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  timelinePopupContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    position: "relative",
    minWidth: "800px",
    maxWidth: "90%",
    maxHeight: "80%",
    width: "90%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  timelinePopupTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#6B7280",
    textAlign: "left",
  },
  timelineTableContainer: {
    flex: 1,
    overflowY: "auto",
    marginBottom: "20px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
  },
  timelineTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  timelineTableHeader: {
    backgroundColor: "#F9FAFB",
  },
  timelineTableHeaderCell: {
    fontWeight: "bold",
    color: "#6B7280",
    backgroundColor: "#F9FAFB",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  timelineTableRow: {
    borderBottom: "1px solid #E5E7EB",
  },
  timelineTableCell: {
    padding: "12px 16px",
    textAlign: "left",
    verticalAlign: "middle",
    color: "#6B7280",
    fontSize: "14px",
  },
  timelineFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "auto",
  },
  timelineCloseButton: {
    backgroundColor: "#6366F1",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },

  rejectPopupContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectPopupContent: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    position: "relative",
    minWidth: "450px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  rejectPopupTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
  },
  rejectFormContainer: {
    marginBottom: "25px",
  },
  rejectFormGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  rejectLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
  },
  rejectTextarea: {
    width: "100%",
    minHeight: "100px",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },
  rejectButtonsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  rejectButton: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
    minWidth: "80px",
  },
  rejectSubmitButton: {
    backgroundColor: "#dc3545",
    color: "white",
  },
  rejectCancelButton: {
    backgroundColor: "#6c757d",
    color: "white",
  },
  // Judul tabel
  tabelTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#343A40",
    margin: "0 0 20px 0",
  },

  // Link download
  downloadLinkButton: {
    color: "#007bff",
    background: "none",
    border: "none",
    padding: "6px 12px",
    font: "inherit",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "14px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "rgba(0, 123, 255, 0.1)",
    },
  },

  // Perbaiki style milestoneActionContainer
  milestoneActionContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  },

  // Perbaiki style btn agar konsisten
  milestonebtn: {
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "white",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    transition: "opacity 0.2s",
  },

  // Tombol Accept (hijau)
  acceptBtn: {
    backgroundColor: "#28a745",
    color: "white",
  },

  // Tombol Decline (merah)
  declineBtn: {
    backgroundColor: "#dc3545",
    color: "white",
  },

  centerCell: {
    padding: "12px",
    verticalAlign: "middle",
    border: "none",
    textAlign: "center",
    fontWeight: 400,
  },

  activeSidebarIcon: {
    color: "white",
  },

  timelineVerificationContainer: {
    backgroundColor: "#ffffff",
    padding: "24px 20px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  timelineVerificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  timelineVerificationTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  timelineVerificationBadge: {
    color: "white",
    padding: "4px 12px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: "600",
  },
  timelineVerificationEditButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "14px",
    color: "#3b82f6",
    textDecoration: "none",
    backgroundColor: "#F8F9FA",
    border: "1px solid #dddddd",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  timelineVerificationBody: {
    marginBottom: "24px",
  },
  timelineStepsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0",
    marginBottom: "16px",
    overflowX: "auto",
    paddingBottom: "10px",
    minHeight: "50px",
    width: "100%",
  },
  timelineLabelsContainer: {
    display: "flex",
    justifyContent: "space-between",
    overflowX: "auto",
    paddingBottom: "10px",
    width: "100%",
  },
  timelineControls: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  timelineControlLabel: {
    fontSize: "14px",
    color: "#6b7280",
    marginRight: "12px",
  },
  timelineControlButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  timelineControlButtonActive: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "1px solid #3b82f6",
  },
  filterDropdownHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 12px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #dddddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#333333",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  filterIcon: {
    fontSize: "12px",
    color: "#666666",
  },
  filterDropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    border: "1px solid #dddddd",
    borderRadius: "6px",
    marginTop: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 1000,
    padding: "4px 0",
  },
  filterOptionItem: {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#333333",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
  filterOptionItemHover: {
    backgroundColor: "#f0f0f0",
  },
  filterRadioInput: {
    marginRight: "8px",
  },
  filterOptionText: {
    flex: 1,
  },

  // Container relatif untuk garis + lingkaran
  timelineContainer: {
    position: "relative",
    width: "100%",
    padding: "0 20px",
    boxSizing: "border-box",
    marginBottom: "20px",
  },

  timelineStepsWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },

  timelineStepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  timelineStepCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
  },
  timelineStepLine: {
    flex: 1,
    height: "4px",
    marginTop: "18px",
    marginLeft: "-20px", // Perubahan penting
    marginRight: "-20px", // Perubahan penting
    position: "relative",
    zIndex: 1,
  },
  timelineStepLabel: {
    marginTop: "6px",
    fontSize: "11px",
    color: "#6b7280",
    textAlign: "center",
    maxWidth: "70px",
    lineHeight: "1.2",
  },

  // New styles for added components
  addButtonContainer: {
    marginBottom: "20px",
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    border: "1px solid #DDDDDD",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
  addButtonIcon: {
    color: "#007BFF",
    marginRight: "8px",
    fontSize: "14px",
  },
  addButtonText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#007BFF",
  },

  tableHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },

  entriesControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  entriesLabel: {
    fontSize: "14px",
    color: "#666",
  },
  entriesInput: {
    width: "60px",
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    textAlign: "center",
  },

  paginationContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginTop: "10px",
    padding: "15px 20px",
  },
  paginationInfo: {
    fontSize: "14px",
    color: "#666",
  },
  paginationButtons: {
    display: "flex",
    gap: "6px",
  },
  paginationButton: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    minWidth: "36px",
    textAlign: "center",
    transition: "background-color 0.2s",
    "&:hover:not(:disabled)": {
      backgroundColor: "#f0f0f0",
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  activePaginationButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
  },
  leftButton: {
    borderTopLeftRadius: "4px",
    borderBottomLeftRadius: "4px",
  },
  rightButton: {
    borderTopRightRadius: "4px",
    borderBottomRightRadius: "4px",
  },

  editTimelinePopupContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  editTimelinePopupContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    width: "450px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    position: "relative",
  },

  editTimelineCloseButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#666",
  },
  editTimelineTitle: {
    marginTop: "0",
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
  },
  editTimelineInputGroup: {
    marginBottom: "20px",
  },
  editTimelineLabel: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
  },
  editTimelineSelect: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
  },
  editTimelineDateInputContainer: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  editTimelineInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderTopRightRadius: "6px",
    borderBottomRightRadius: "6px",
    borderTopLeftRadius: "6px",
    borderBottomLeftRadius: "6px",
    fontSize: "14px",
  },
  editTimelineCalendarButton: {
    padding: "10px 12px",
    background: "#f0f0f0",
    border: "1px solid #ddd",
    borderLeft: "none",
    borderTopRightRadius: "6px",
    borderBottomRightRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
  editTimelineButtonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  editTimelineButton: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  editTimelineSaveButton: {
    backgroundColor: "#4CAF50",
    color: "white",
  },
  editTimelineCancelButton: {
    backgroundColor: "#f44336",
    color: "white",
  },
  calendarContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "10px",
    marginTop: "5px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  calendarNavButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  calendarMonth: {
    fontWeight: "bold",
  },
  calendarWeekdays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  calendarDays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "5px",
  },
  calendarDay: {
    padding: "5px",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
  calendarSelectedDay: {
    backgroundColor: "#3b82f6",
    color: "white",
  },

  tambahBimbinganContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    width: "700px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    position: "relative",
  },
  tambahBimbinganForm: {
    padding: "10px 0",
  },
  tambahBimbinganSection: {
    marginBottom: "20px",
  },
  tambahBimbinganSectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    margin: "0 0 15px 0",
  },
  tambahBimbinganFormGroup: {
    marginBottom: "15px",
  },
  tambahBimbinganLabel: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
  },
  tambahBimbinganInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  tambahBimbinganSelect: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  tambahBimbinganDivider: {
    border: "none",
    borderTop: "1px dashed #ddd",
    margin: "25px 0",
  },
  tambahBimbinganTableHeader: {
    padding: "8px 0",
    borderBottom: "1px solid #ddd",
    fontWeight: "600",
    fontSize: "14px",
    color: "#333",
  },
  tambahBimbinganFileButton: {
    padding: "8px 15px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  tambahBimbinganButton: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "white",
    marginLeft: "10px",
    transition: "background-color 0.2s",
  },

  uploadPopupContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  uploadPopupContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    width: "500px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    position: "relative",
  },
  uploadPopupTitle: {
    marginTop: "0",
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
  },
  uploadFormGroup: {
    marginBottom: "20px",
  },
  uploadLabel: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
  },
  uploadSelect: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
  },
  uploadFileContainer: {
    display: "flex",
    alignItems: "center",
  },
  uploadFileInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
  },
  uploadTextarea: {
    width: "100%",
    minHeight: "100px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
  },
  uploadButtonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  uploadButton: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  uploadSubmitButton: {
    backgroundColor: "#4CAF50",
    color: "white",
  },
  uploadCancelButton: {
    backgroundColor: "#f44336",
    color: "white",
  },
};

export default App;
