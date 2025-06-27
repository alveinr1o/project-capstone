import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  FaUsers,
  FaUserGraduate,
  FaUserCheck,
  FaUserTimes,
  FaGraduationCap,
  FaHome,
  FaBook,
  FaClipboardList,
  FaList,
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
  FaArrowRight,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

function DosenDashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedYear, setSelectedYear] = useState("semua");
  const [showTimelinePopup, setShowTimelinePopup] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [profilPembimbing, setProfilPembimbing] = useState(null);
  const [data, setData] = useState(null);
  const [bimbinganList, setBimbinganList] = useState([]);
  const [selectedBimbinganId, setSelectedBimbinganId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedBimbingan, setSelectedBimbingan] = useState(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [bimbinganTerbaruList, setBimbinganTerbaruList] = useState([]);
  const [showMilestoneConfirmation, setShowMilestoneConfirmation] =
    useState(false);
  const [showMilestoneRejectPopup, setShowMilestoneRejectPopup] =
    useState(false);

  const handleApprove = () => {
    const token = localStorage.getItem("access");
    fetch(
      `http://127.0.0.1:8000/api/bimbingan/${selectedBimbinganId}/approve/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        if (res.ok) {
          alert("Bimbingan disetujui.");
          setShowConfirmation(false);
          window.location.reload();
        } else {
          alert("Gagal menyetujui.");
        }
      })
      .catch(console.error);
  };

  const handleReject = () => {
    const token = localStorage.getItem("access");
    fetch(
      `http://127.0.0.1:8000/api/bimbingan/${selectedBimbinganId}/reject/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alasan: rejectReason }),
      }
    )
      .then((res) => {
        if (res.ok) {
          alert("Bimbingan ditolak.");
          setShowRejectPopup(false);
          window.location.reload(); // atau refetch
        } else {
          alert("Gagal menolak.");
        }
      })
      .catch(console.error);
  };

  const handleApproveMilestone = async () => {
    const token = localStorage.getItem("access");
    if (!selectedMilestoneId) return;
    const res = await fetch(
      `http://127.0.0.1:8000/api/milestone/${selectedMilestoneId}/approve/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      alert("Milestone disetujui.");
      setShowMilestoneConfirmation(false);
      window.location.reload();
    } else {
      alert("Gagal menyetujui milestone.");
    }
  };

  const handleRejectMilestone = async () => {
    if (!selectedMilestoneId) return;
    const token = localStorage.getItem("access");
    const res = await fetch(
      `http://127.0.0.1:8000/api/milestone/${selectedMilestoneId}/decline/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      alert("Milestone ditolak.");
      setShowMilestoneRejectPopup(false);
      window.location.reload();
    } else {
      alert("Gagal menolak milestone.");
    }
  };
  
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const fetchDashboard = async () => {
    const token = localStorage.getItem("access");

    const url =
      selectedYear === "semua"
        ? "http://127.0.0.1:8000/api/dosen_dashboard_api/"
        : `http://127.0.0.1:8000/api/dosen_dashboard_api/?tahun_masuk=${selectedYear}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch dashboard:", res.status);
      return;
    }

    const data = await res.json();
    console.log(data);

    setBimbinganList(data.bimbingan_list);
    setBimbinganTerbaruList(data.bimbingan_terbaru_list);
    setChartData(data.distribusi_milestone);
    setData(data);
  };


  useEffect(() => {
    fetchDashboard();
  }, [selectedYear]);

  useEffect(() => {
    const fetchProfil = async () => {
      const token = localStorage.getItem("access");
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/profil-pembimbing/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setProfilPembimbing(data);
      } catch (err) {
        console.error("Gagal memuat data pembimbing:", err);
      }
    };

    fetchDashboard(); 
    fetchProfil();
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);
  

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
              {profilPembimbing && (
                <>
                  <img
                    src={
                      profilPembimbing.foto_profil
                        ? `http://127.0.0.1:8000/${profilPembimbing.foto_profil}`
                        : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                    }
                    alt="Profil"
                    style={styles.profilePic}
                  />
                  <div style={styles.userInfo}>
                    <div style={styles.userName}>
                      {profilPembimbing.nama_Dosen}
                    </div>
                    <div style={styles.userId}>{profilPembimbing.nip}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
                <span style={styles.popupFieldLabel}>Nama Mahasiswa</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{selectedBimbingan.penelitian.nama_mahasiswa}</span>
              </div>
              <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Topik</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{selectedBimbingan.penelitian.judul}</span>
              </div>
              <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Komentar</span>
                <span style={styles.popupFieldColon}>:</span>
                <span>{selectedBimbingan.komentar || "-"}</span>
              </div>
              <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Dokumen</span>
                <span style={styles.popupFieldColon}>:</span>
                <a href={selectedBimbingan.file_url}>
                  {selectedBimbingan.nama_dokumen}
                </a>
              </div>
              <div style={styles.popupField}>
                <span style={styles.popupFieldLabel}>Link Eksternal</span>
                <span style={styles.popupFieldColon}>:</span>
                <a href={selectedBimbingan.link}>{selectedBimbingan.link}</a>
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

      {/* Popup Timeline */}
      {showTimelinePopup && selectedBimbingan && (
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
              {selectedBimbingan.deadline_logs.length > 0 ? (
                <table style={styles.timelineTable}>
                  <thead>
                    <tr style={styles.timelineTableHeader}>
                      <th style={styles.timelineTableCell}>Timestamp</th>
                      <th style={styles.timelineTableCell}>Jenis Milestone</th>
                      <th style={styles.timelineTableCell}>Deadline Lama</th>
                      <th style={styles.timelineTableCell}>Deadline Baru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBimbingan.deadline_logs.map((log, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
                        }}
                      >
                        <td style={styles.timelineTableCell}>
                          {log.timestamp}
                        </td>
                        <td style={styles.timelineTableCell}>
                          {log.milestone_jenis || "-"}
                        </td>
                        <td style={styles.timelineTableCell}>
                          {log.old_deadline}
                        </td>
                        <td style={styles.timelineTableCell}>
                          {log.new_deadline}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: "center" }}>
                  Tidak ada perubahan deadline yang tercatat.
                </p>
              )}
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

      {/* Popup Milestone Confirmation */}
      {showMilestoneConfirmation && (
        <div style={styles.confirmationContainer}>
          <div style={styles.confirmationContent}>
            <h3 style={styles.confirmationTitle}>Konfirmasi Persetujuan</h3>
            <p style={styles.confirmationText}>
              Apakah Anda yakin ingin menyetujui milestone ini?
            </p>
            <div style={styles.confirmationButtons}>
              <button
                style={{ ...styles.confirmButton, ...styles.approveButton }}
                onClick={handleApproveMilestone}
              >
                Setujui
              </button>
              <button
                style={{ ...styles.confirmButton, ...styles.cancelButton }}
                onClick={() => setShowMilestoneConfirmation(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Milestone Reject */}
      {showMilestoneRejectPopup && (
        <div style={styles.rejectPopupContainer}>
          <div style={styles.rejectPopupContent}>
            <h3 style={styles.rejectPopupTitle}>Tolak Milestone</h3>
            <button
              onClick={() => setShowMilestoneRejectPopup(false)}
              style={styles.closeButton}
            >
              <FaTimes />
            </button>

            <div style={styles.rejectFormContainer}>
              <div style={styles.rejectFormGroup}>
              </div>
            </div>

            <div style={styles.rejectButtonsContainer}>
              <button
                style={{ ...styles.rejectButton, ...styles.rejectSubmitButton }}
                onClick={handleRejectMilestone}
              >
                Tolak
              </button>
              <button
                style={{ ...styles.rejectButton, ...styles.rejectCancelButton }}
                onClick={() => setShowMilestoneRejectPopup(false)}
              >
                Batal
              </button>
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
          <h1 style={styles.judul}>Monitoring Tugas Akhir</h1>
        </div>

        <div style={styles.boxRow}>
          {data && (
            <>
              <div style={{ ...styles.colorBox, ...styles.blueBox }}>
                <div style={styles.boxIcon}>
                  <FaUsers />
                </div>
                <div style={styles.boxContent}>
                  <div style={styles.boxNumber}>{data.total_mahasiswa}</div>
                  <div style={styles.boxLabel}>Mahasiswa Aktif</div>
                </div>
              </div>

              <div style={{ ...styles.colorBox, ...styles.greenBox }}>
                <div style={styles.boxIcon}>
                  <FaUserGraduate />
                </div>
                <div style={styles.boxContent}>
                  <div style={styles.boxNumber}>{data.ahead_count}</div>
                  <div style={styles.boxLabel}>Mahasiswa</div>
                </div>
              </div>

              <div style={{ ...styles.colorBox, ...styles.yellowBox }}>
                <div style={{ ...styles.boxIcon, color: "rgba(0,0,0,0.7)" }}>
                  <FaUserCheck />
                </div>
                <div style={styles.boxContent}>
                  <div style={styles.boxNumber}>{data.ideal_count}</div>
                  <div style={styles.boxLabel}>Mahasiswa</div>
                </div>
              </div>

              <div style={{ ...styles.colorBox, ...styles.redBox }}>
                <div style={styles.boxIcon}>
                  <FaUserTimes />
                </div>
                <div style={styles.boxContent}>
                  <div style={styles.boxNumber}>{data.behind_count}</div>
                  <div style={styles.boxLabel}>Mahasiswa</div>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={styles.middleBox}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Sebaran Mahasiswa</h3>
            <div style={styles.filterContainer}>
              <span style={styles.filterText}>Pilih berdasarkan</span>
              <div style={styles.filterOptions}>
                {["semua", "2025", "2024", "2023", "2022"].map((year) => (
                  <label key={year} style={styles.filterOption}>
                    <input
                      type="radio"
                      name="filter"
                      value={year}
                      checked={selectedYear === year}
                      onChange={handleYearChange}
                    />
                    <span>{year === "semua" ? "Tampilkan Semua" : year}</span>
                  </label>
                ))}
              </div>
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
                  bottom: 130, // Increased bottom margin for rotated text
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
                            <span style={styles.tooltipLabel}>
                              Mahasiswa :{" "}
                            </span>
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

        <div style={styles.tabelContainer}>
          <h3 style={styles.tabelTitle}>Pengajuan Bimbingan</h3>
          <table style={styles.tabelMahasiswa}>
            <thead>
              <tr style={{ ...styles.tableHeader, backgroundColor: "#FFFFFF" }}>
                <th
                  style={{
                    ...styles.tableCell,
                    ...styles.tableHeaderCell,
                    width: "50px",
                  }}
                >
                  No
                </th>
                <th
                  style={{
                    ...styles.tableCell,
                    ...styles.tableHeaderCell,
                    width: "120px",
                  }}
                >
                  Tahun Semester
                </th>
                <th
                  style={{
                    ...styles.tableCell,
                    ...styles.tableHeaderCell,
                    width: "150px",
                  }}
                >
                  Nama Mahasiswa
                </th>
                <th
                  style={{
                    ...styles.tableCell,
                    ...styles.tableHeaderCell,
                    width: "100px",
                  }}
                >
                  NIM
                </th>
                <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>
                  Topik Tugas Akhir
                </th>
                <th
                  style={{
                    ...styles.tableCell,
                    ...styles.tableHeaderCell,
                    width: "230px",
                  }}
                >
                  Status Progress
                </th>
                <th
                  style={{
                    ...styles.tableCell,
                    ...styles.tableHeaderCell,
                    width: "150px",
                  }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {bimbinganTerbaruList.map((item, index) => {
                const bimbinganDetail = bimbinganList.find(
                  (b) => b.id === item.id
                );
                return (
                  <tr
                    key={item.id}
                    style={{
                      ...styles.tableRow,
                      backgroundColor: index % 2 === 0 ? "#F2F2F2" : "#FFFFFF",
                    }}
                  >
                    <td style={styles.tableCell}>{index + 1}</td>
                    <td style={styles.tableCell}>
                      2024/2025 <br /> Semester Genap
                    </td>
                    <td style={styles.tableCell}>
                      <Link
                        to={`/student-detail-page/${item.penelitian.nim}`}
                        style={{ color: "#007bff", textDecoration: "underline" }}
                      >
                        {item.penelitian.nama_mahasiswa}
                      </Link>
                    </td>
                    <td style={styles.tableCell}>{item.penelitian.nim}</td>
                    <td style={styles.tableCell}>{item.penelitian.judul}</td>
                    <td style={{ ...styles.tableCell, fontSize: "11px" }}>
                      <span
                        style={{
                          ...styles.status,
                          ...(bimbinganDetail?.status_milestone ===
                          "ahead of schedule"
                            ? styles.greenStatus
                            : bimbinganDetail?.status_milestone ===
                              "on ideal schedule"
                            ? styles.yellowStatus
                            : styles.redStatus),
                        }}
                      >
                        {/* Icon tergantung status */}
                        {item.status_milestone === "ahead of schedule" && (
                          <FaCheck style={styles.statusIcon} />
                        )}
                        {item.status_milestone === "on ideal schedule" && (
                          <FaExclamationTriangle style={styles.statusIcon} />
                        )}
                        {item.status_milestone === "behind the schedule" && (
                          <FaTimes style={styles.statusIcon} />
                        )}
                        {item.status_progress}
                      </span>
                    </td>
                    <td style={{ ...styles.tableCell, ...styles.aksi }}>
                      <div style={styles.actionButtonsContainer}>
                        {(() => {
                          const buttons = [
                            {
                              icon: <FaEye />,
                              onClick: () => {
                                setSelectedBimbingan(item);
                                setShowPopup(true);
                              },
                              style: {
                                ...styles.btn,
                                ...styles.blueBtn,
                                borderTopLeftRadius: "6px",
                                borderBottomLeftRadius: "6px",
                              },
                              label: "View",
                            },
                            {
                              icon: <FaList />,
                              onClick: () => {
                                setSelectedBimbingan(item);
                                setShowTimelinePopup(true);
                              },
                              style: {
                                ...styles.btn,
                                ...styles.cyanBtn,
                                borderRadius: 0,
                              },
                              label: "Timeline",
                            },
                          ];

                          if (item.status === "sedang diperiksa") {
                            buttons.push(
                              {
                                icon: <FaArrowRight />,
                                onClick: () => {
                                  setSelectedBimbinganId(item.id);
                                  setShowConfirmation(true);
                                },
                                style: {
                                  ...styles.btn,
                                  ...styles.greenBtn,
                                  borderRadius: 0,
                                },
                                label: "Accept",
                              },
                              {
                                icon: <FaTimes />,
                                onClick: () => {
                                  setSelectedBimbinganId(item.id);
                                  setShowRejectPopup(true);
                                },
                                style: {
                                  ...styles.btn,
                                  ...styles.redBtn,
                                  borderTopRightRadius: "6px",
                                  borderBottomRightRadius: "6px",
                                },
                                label: "Reject",
                              }
                            );
                          } else {
                            buttons[buttons.length - 1].style = {
                              ...buttons[buttons.length - 1].style,
                              borderTopRightRadius: "6px",
                              borderBottomRightRadius: "6px",
                            };
                          }

                          return buttons.map((btn, index) => (
                            <button
                              key={index}
                              style={btn.style}
                              aria-label={btn.label}
                              type="button"
                              onClick={btn.onClick}
                            >
                              {btn.icon}
                            </button>
                          ));
                        })()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tabel Persetujuan Bukti Milestone */}
        <div style={styles.tabelContainer}>
          <h3 style={{ ...styles.tabelTitle, marginBottom: "20px" }}>
            Persetujuan Bukti Milestone
          </h3>
          <table style={styles.tabelMahasiswa}>
            <thead>
              <tr style={{ ...styles.tableHeader, backgroundColor: "#FFFFFF" }}>
                <th
                  style={{
                    ...styles.centerCell,
                    ...styles.tableHeaderCell,
                    width: "50px",
                  }}
                >
                  No
                </th>
                <th
                  style={{
                    ...styles.centerCell,
                    ...styles.tableHeaderCell,
                    width: "150px",
                  }}
                >
                  Nama Mahasiswa
                </th>
                <th
                  style={{
                    ...styles.centerCell,
                    ...styles.tableHeaderCell,
                    width: "180px",
                  }}
                >
                  Tahap Milestone
                </th>
                <th
                  style={{
                    ...styles.centerCell,
                    ...styles.tableHeaderCell,
                    width: "120px",
                  }}
                >
                  Bukti
                </th>
                <th
                  style={{
                    ...styles.centerCell,
                    ...styles.tableHeaderCell,
                    width: "200px",
                  }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.pending_milestones.length > 0 ? (
                data.pending_milestones.map((milestone, index) => (
                  <tr
                    key={milestone.id}
                    style={{
                      ...styles.tableRow,
                      backgroundColor: index % 2 === 0 ? "#F2F2F2" : "#FFFFFF",
                    }}
                  >
                    <td style={styles.centerCell}>{index + 1}</td>
                    <td style={styles.centerCell}>
                      {milestone.nama_mahasiswa}
                    </td>
                    <td style={styles.centerCell}>
                      {milestone.jenis_milestone}
                    </td>
                    <td style={styles.centerCell}>
                      {milestone.bukti_file_url ? (
                        <a
                          href={milestone.bukti_file_url}
                          download
                          rel="noopener noreferrer"
                          target="_blank"
                          style={styles.downloadLinkButton}
                        >
                          Download Bukti
                        </a>
                      ) : (
                        "Tidak ada file"
                      )}
                    </td>
                    <td style={styles.centerCell}>
                      {milestone.is_approved === "pending" ? (
                        <div style={styles.actionButtonsContainer}>
                          <button
                            style={{
                              ...styles.btn,
                              ...styles.greenBtn,
                              borderTopLeftRadius: "6px",
                              borderBottomLeftRadius: "6px",
                            }}
                            onClick={() => {
                              setSelectedMilestoneId(milestone.id);
                              setShowMilestoneConfirmation(true);
                            }}
                            type="button"
                          >
                            <FaArrowRight style={{ color: "white" }} />
                          </button>
                          <button
                            style={{
                              ...styles.btn,
                              ...styles.redBtn,
                              borderTopRightRadius: "6px",
                              borderBottomRightRadius: "6px",
                            }}
                            onClick={() => {
                              setSelectedMilestoneId(milestone.id);
                              setShowMilestoneRejectPopup(true);
                            }}
                            type="button"
                          >
                            <FaTimes style={{ color: "white" }} />
                          </button>
                        </div>
                      ) : (
                        <span>{milestone.is_approved_display}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={styles.centerCell} colSpan="5">
                    Tidak ada bukti milestone yang menunggu persetujuan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
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
    marginTop: "30px",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    overflowX: "auto",
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
    borderRadius: "6px",
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
  greenBtn: {
    backgroundColor: "#22c55e",
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
    verticalAlign: "middle",
    color: "#6B7280",
    fontSize: "14px",
    textAlign: "center",
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
};

export default DosenDashboard;
