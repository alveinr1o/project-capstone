import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const StudentTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [entriesPerPage] = useState(5); // Hilangkan setEntriesPerPage
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ name: "", nim: "", topic: "", tahunMasuk: ''});
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get("http://localhost:8000/api/admin-dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const raw = response.data.mahasiswa_milestones || [];

        const formatted = raw.map((item, index) => {
          const deadline = new Date(item.milestone.deadline);
          const today = new Date();
          const daysDiff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
          const type = daysDiff < 0 ? "red" : daysDiff <= 30 ? "yellow" : "green";

          return {
            no: index + 1,
            name: item.nama,
            nim: item.nim,
            topic: item.judul,
            tahunMasuk: item.tahun_masuk ? `${item.tahun_masuk}/Semester` : "-",
            pembimbing: [],
            status: {
              text: item.milestone.jenis_milestone,
              type: type,
            },
            tahun_masuk: item.tahun_masuk,
            deadline: deadline.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          };
        });
        setData(formatted);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case "green": return <FaCheckCircle style={{ fontSize: "14px" }} />;
      case "yellow": return <FaExclamationTriangle style={{ fontSize: "14px" }} />;
      case "red": return <FaTimesCircle style={{ fontSize: "14px" }} />;
      default: return null;
    }
  };

  const getStatusStyle = (type) => {
    switch (type) {
      case "green": return { backgroundColor: "#28a745", color: "white" };
      case "yellow": return { backgroundColor: "#ffc107", color: "black" };
      case "red": return { backgroundColor: "#dc3545", color: "white" };
      default: return { backgroundColor: "gray", color: "white" };
    }
  };

    const renderPagination = () => {
    const pageButtons = [];
    const maxVisible = 5;
    const totalPages = Math.ceil(filteredData.length / entriesPerPage);
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - maxVisible + 1));
    const end = Math.min(start + maxVisible - 1, totalPages);
    

    if (currentPage > 1) {
      pageButtons.push(
        <button key="prev" style={styles.paginationBtn} onClick={() => setCurrentPage(currentPage - 1)}>
          Sebelumnya
        </button>
      );
    }

    for (let i = start; i <= end; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          style={{
            ...styles.paginationBtn,
            ...(currentPage === i ? styles.paginationBtnActive : {}),
          }}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      pageButtons.push(
        <span key="ellipsis" style={styles.paginationEllipsis}>
          ...
        </span>
      );
      pageButtons.push(
        <button key={totalPages} style={styles.paginationBtn} onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pageButtons.push(
        <button key="next" style={styles.paginationBtn} onClick={() => setCurrentPage(currentPage + 1)}>
          Selanjutnya
        </button>
      );
    }

    return pageButtons;
  };

  const filteredData = data.filter((item) =>
    item.tahunMasuk.toLowerCase().includes(filters.tahunMasuk.toLowerCase()) &&
    item.name.toLowerCase().includes(filters.name.toLowerCase()) &&
    item.nim.toLowerCase().includes(filters.nim.toLowerCase()) &&
    item.topic.toLowerCase().includes(filters.topic.toLowerCase())
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.scrollWrapper}>
        <div style={styles.tabelContainer}>
          <table style={styles.tabelMahasiswa}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>No</th>
                <th style={styles.tableHeaderCell}>Tahun</th>
                <th style={styles.tableHeaderCell}>Nama</th>
                <th style={styles.tableHeaderCell}>NIM</th>
                <th style={styles.tableHeaderCell}>Topik</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Deadline</th>
              </tr>
              <tr style={styles.filterInputRow}>
                <td></td>
                <td style={styles.filterInputCell}>
                  <input
                    style={styles.input}
                    value={filters.tahunMasuk}
                    onChange={(e) =>
                      handleFilterChange("tahunMasuk", e.target.value)
                    }
                    placeholder="Cari Nama"
                  />
                </td>
                <td style={styles.filterInputCell}>
                  <input
                    style={styles.input}
                    value={filters.name}
                    onChange={(e) => handleFilterChange("name", e.target.value)}
                    placeholder="Cari Nama"
                  />
                </td>
                <td style={styles.filterInputCell}>
                  <input
                    style={styles.input}
                    value={filters.nim}
                    onChange={(e) => handleFilterChange("nim", e.target.value)}
                    placeholder="Cari NIM"
                  />
                </td>
                <td style={styles.filterInputCell}>
                  <input
                    style={styles.input}
                    value={filters.topic}
                    onChange={(e) =>
                      handleFilterChange("topic", e.target.value)
                    }
                    placeholder="Cari Topik"
                  />
                </td>
                <td></td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                  }}
                >
                  <td style={styles.tableCell}>{item.no}</td>
                  <td style={styles.tableCell}>{item.tahun_masuk}</td>
                  <td style={styles.tableCell}>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4d44b5",
                        fontWeight: "bold",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                      onClick={() =>
                        navigate( 
                          `/student-detail/${item.nim}`,
                          { state: { student: item } }
                        )
                      }
                    >
                      {item.name}
                    </button>
                  </td>
                  <td style={styles.tableCell}>{item.nim}</td>
                  <td style={styles.tableCell}>{item.topic}</td>
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: "500",
                        fontSize: "12px",
                        gap: "4px",
                        ...getStatusStyle(item.status.type),
                      }}
                    >
                      {getStatusIcon(item.status.type)}
                      {item.status.text}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{item.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ ...styles.bottomBar, color: "#525f7f" }}>
            <span>
              Menampilkan {startIndex + 1} sampai{" "}
              {endIndex > filteredData.length ? filteredData.length : endIndex}{" "}
              dari {filteredData.length} entri
            </span>

            <div style={{ ...styles.pagination, color: "#525f7f" }}>
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



const styles = {
  pageContainer: {
    paddingTop: "10px",
    marginLeft: "76px",
    minHeight: "100vh",
    backgroundColor: "#f3f4ff",
    boxSizing: "border-box",
    fontSize: '12px',
    
  },
  scrollWrapper: {
    width: '100%',
    overflowX: 'auto',
    paddingBottom: '12px',
    fontFamily: "'Poppins', sans-serif",
    color: '#525f7f',
  },
  tabelContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    fontFamily: "'Poppins', sans-serif",
    color: '#525f7f',
    minWidth: 'max-content',
    width: '97%'
  },
  tabelMahasiswa: {
    borderCollapse: 'collapse',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '14px',
    color: '#525f7f',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '100%',
    tableLayout: 'auto',
    minHeight:'350px'
  },
  tableHeader: {
    backgroundColor: '#FFFFFF',
    textAlign: 'left',
    borderBottom: '2px solid #e0e0e0',
    fontSize: '14px',
    color: '#525f7f',
    maxWidth: '100%',
    overflow: 'hidden',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    paddingLeft: '30px'
  },
  table: {
    width: '100%',
    tableLayout: 'auto',
    borderCollapse: 'collapse',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    padding: '12px',
    fontSize: '13px',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    lineHeight: '1.4em',
    paddingLeft: '30px'
  },
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #e0e0e0',
    verticalAlign: 'top',
    fontSize: '14px',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    paddingLeft: '30px',
  },
  actionButtonsContainer: {
    display: 'flex',
    gap: '0px',
    borderRadius: '8px',
  },
  btn: {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    transition: 'opacity 0.2s ease-in-out, background-color 0.3s, border 0.3s',
  },
  viewBtn: {
    backgroundColor: '#4d44b5',
    borderRadius: '8px',
  },
  bellBtn: {
    backgroundColor: '#20c997',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    border: 'none',
    color: 'white',
  },
  bellBtnClicked: {
    backgroundColor: '#f2f2f2',
    border: '1px solid #666666',
    color: '#333',
  },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '12px',
    color: 'white',
    gap: '6px',
  },
    statusIcon: {
    fontSize: '16px',  // ukuran icon konsisten
    marginRight: '6px',
  },
  greenStatus: { backgroundColor: '#28a745' },
  yellowStatus: { backgroundColor: '#ffc107', color: '#212529' },
  redStatus: { backgroundColor: '#dc3545' },
  filterInputRow: {
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  filterInputCell: {
    padding: '8px 12px',
    borderBottom: '1px solid #e0e0e0',
    borderRadius: '12px',
    paddingLeft: '30px'
  },
  input: {
    width: '100%',
    padding: '6px 8px',
    fontSize: '13px',
    color: '#555555',
    border: '1px solid #ccc',
    borderRadius: '12px',
    fontFamily: "'Poppins', sans-serif",
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    fontColor: '#525f7f',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
  },
  entriesControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  select: {
    padding: '6px 28px 6px 8px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '250px',
    paddingRight: '4px',
  },
  iconBox: {
    backgroundColor: '#f2f2f2',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  searchIcon: {
    color: '#555',
    fontSize: '16px',
  },
  searchBox: {
    border: 'none',
    outline: 'none',
    padding: '8px',
    fontSize: '14px',
    flex: 1,
  },
  bottomBar: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    fontColor: '#525f7f'
  },
  pagination: {
    display: 'flex',
    gap: '0px',
    alignItems: 'center',
    fontColor: '#525f7f',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    color: '#525f7f',
    marginLeft: 'auto',
  },
  paginationEllipsis: {
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    backgroundColor: '#fff',
    fontSize: '14px',
    cursor: 'default',
  },
  paginationBtn: {
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  paginationBtnActive: {
    backgroundColor: '#4d44b5',
    color: 'white',
    border: '1px solid #4d44b5',
  },
  selectWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  dropdownIcon: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    fontSize: '12px',
  },
};

export default StudentTable;
