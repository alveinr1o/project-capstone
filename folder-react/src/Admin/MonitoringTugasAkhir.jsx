import React, { useState, useEffect, useRef } from "react";
import {
  FaUsers, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaChevronDown
} from "react-icons/fa";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import axios from "axios";

// Custom Dropdown
function CustomDropdown({ selected, onChange, yearOptions }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid #1c70f6",
          backgroundColor: "#fff",
          color: "#3b82f6",
          fontWeight: "550",
          cursor: "pointer",
          minWidth: "160px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
        }}
      >
        {selected === "semua" ? "Tampilkan Semua" : selected}
        <FaChevronDown style={{ marginLeft: 10 }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            backgroundColor: "#fff",
            boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
            borderRadius: "8px",
            padding: "8px 0",
            zIndex: 100,
            width: "160px",
          }}
        >
          <label style={dropdownItemStyle}>
            <input
              type="radio"
              value="semua"
              checked={selected === "semua"}
              onChange={() => { onChange("semua"); setOpen(false); }}
              style={{ marginRight: "8px" }}
            />
            Tampilkan Semua
          </label>
          {yearOptions.map((tahun) => (
            <label key={tahun} style={dropdownItemStyle}>
              <input
                type="radio"
                value={tahun}
                checked={selected === tahun}
                onChange={() => { onChange(tahun); setOpen(false); }}
                style={{ marginRight: "8px" }}
              />
              {tahun}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

const dropdownItemStyle = {
  display: "flex",
  alignItems: "center",
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: "14px",
  color: "#333",
};

function StatBox({ icon, color, label, count, textColor = "white" }) {
  return (
    <div style={{ ...styles.colorBox, backgroundColor: color, color: textColor }}>
      <div style={styles.boxIcon}>{icon}</div>
      <div style={styles.boxContent}>
        <div style={styles.boxNumber}>{count}</div>
        <div style={styles.boxLabel}>{label}</div>
      </div>
    </div>
  );
}

function MonitoringPage() {
  const [selectedYear, setSelectedYear] = useState("semua");
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get("http://localhost:8000/api/admin-dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      }
    };

    fetchDashboardData();
  }, []);

  if (!dashboardData) return <p style={{ marginLeft: "100px", marginTop: "100px" }}>Memuat data...</p>;

  const {
    total_mahasiswa,
    mahasiswa_ahead,
    mahasiswa_ideal,
    mahasiswa_behind,
    tahap_grafik,
    mahasiswa_milestones,
    tahun_list,
    milestone_choices
  } = dashboardData;

  // Filter chart data berdasarkan tahun
  const chartData = selectedYear === "semua"
    ? tahap_grafik
    : milestone_choices.map(jenis => {
        const count = mahasiswa_milestones.filter(item =>
          String(item.tahun_masuk) === selectedYear &&
          item.milestone &&
          item.milestone.jenis_milestone === jenis
        ).length;

        return {
          jenis_milestone: jenis,
          jumlah: count,
        };
      });


  return (
    <div style={styles.outerContainer}>
      <div style={styles.innerContainer}>
        <div style={styles.header}>
          <h1 style={styles.title}>Monitoring Tugas Akhir</h1>
        </div>

        <div style={styles.boxRow}>
          <StatBox icon={<FaUsers />} color="#263C92" label="Mahasiswa" count={total_mahasiswa} />
          <StatBox icon={<FaCheckCircle />} color="#28A745" label="Ahead" count={mahasiswa_ahead} />
          <StatBox icon={<FaExclamationTriangle />} color="#FFC107" label="Ideal" count={mahasiswa_ideal} textColor="#000" />
          <StatBox icon={<FaTimesCircle />} color="#DC3545" label="Behind" count={mahasiswa_behind} />
        </div>

        <div style={styles.middleBox}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Sebaran Mahasiswa</h3>
            <div style={styles.filterContainer}>
              <CustomDropdown selected={selectedYear} onChange={setSelectedYear} yearOptions={tahun_list || []} />
            </div>
          </div>

          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="jenis_milestone"
                  interval={0}
                  height={60}
                  tickLine={false}
                  tick={({ x, y, payload }) => {
                    const MAX_CHARS_PER_LINE = 14; // atur sesuai kebutuhan

                    // pisah manual per MAX_CHARS_PER_LINE tanpa memotong kata
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
                            y={index * 14}
                            textAnchor="middle"
                            fontSize={12}
                            fill="#666"
                          >
                            {line}
                          </text>
                        ))}
                      </g>
                    );
                  }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jumlah" fill="#4A90E2" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


const styles = {
  outerContainer: {
    paddingTop: "50px",
    marginLeft: "80px",
    minHeight: "100vh",
    backgroundColor: "#f3f4ff",
    boxSizing: "border-box",
  },
  innerContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    marginTop: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#343a40",
  },
  boxRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  colorBox: {
    display: "flex",
    alignItems: "center",
    padding: "20px",
    borderRadius: "8px",
    color: "white",
    height: "55px",
  },
  boxIcon: {
    fontSize: "45px",
    marginRight: "16px",
    color: "rgba(255,255,255,0.85)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  boxContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
  },
  boxNumber: {
    fontSize: "25px",
    fontWeight: "bold",
    textAlign: "center",
  },
  boxLabel: {
    fontSize: "15px",
    textAlign: "center",
    marginTop: "-5px",
  },
  blueBox: {
    backgroundColor: "#263C92",
  },
  greenBox: {
    backgroundColor: "#28A745",
  },
  yellowBox: {
    backgroundColor: "#FFC107",
    color: "#000",
  },
  redBox: {
    backgroundColor: "#DC3545",
  },

  // Chart section
  middleBox: {
    backgroundColor: "#ffffff",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  chartHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  chartTitle: {
    fontSize: "18px",
    fontWeight: "550",
    color: "#525f7f",
    marginBottom: "12px",
    textAlign: "center",
    width: "100%",
  },
  filterContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    position: 'relative',  // keep relative for normal flow
    zIndex: 1,
    marginBottom: "30px",
    paddingRight: "1opx",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "8px",
  },
  filterText: {
    fontSize: "12px",
    fontWeight: "400",
    color: "#888",
    marginBottom: "6px",
  },
  filterOptions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    position: "absolute",
    right: 10,
    top: 10,
    color: "#525f7f",
    fontSize: "14px",
    fontWeight: "400",
    zIndex: 1, // Ensure it appears above the chart
  },

  chartContainer: {
    width: "100%",
    height: "100%",
  },

  // Tooltip styles
  tooltipContainer: {
    backgroundColor: "#fff",
    padding: "6px 12px",
    border: "1px solid #ccc",
    borderRadius: "0px",
    color: "#333",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  tooltipHeader: {
    fontWeight: "600",
    marginBottom: "4px",
    color: "#525f7f",
  },
  tooltipContent: {
    display: "flex",
    justifyContent: "space-between",
    color: "#525f7f",
  },
  tooltipLabel: {
    fontWeight: "400",
    color: "#525f7f",
    marginRight: "8px",
  },
  tooltipValue: {
    fontWeight: "450",
    color: "#525f7f",
  },
};

export default MonitoringPage;
