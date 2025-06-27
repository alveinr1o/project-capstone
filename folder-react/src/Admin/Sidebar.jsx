import React, { useState } from "react";
import {
  FaBook,
  FaClipboardList,
  FaGraduationCap,
  FaHome,
  FaQuestionCircle,
  FaStickyNote,
  FaStar,
  FaUserGraduate,
  FaMoneyBillWave,
  FaUpload,
  FaBriefcaseMedical,
  FaCar,
} from "react-icons/fa";

const styles = {
  leftRectangle: {
    position: "fixed",
    top: "53px",
    left: 0,
    width: "74.5px",
    height: "calc(100vh - 53px)",
    backgroundColor: "white",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px 0",
    zIndex: 1000,
  },

  sidebarIcons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px", // controls spacing between icons
    width: "100%",
  },

  sidebarIcon: {
    fontSize: "15px",
    color: "#333",
    cursor: "pointer",
    width: "15px",
    height: "30x",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "12px",
    margin: "5px 0",
    transition: "all 0.2s ease-in-out",
  },

  sidebarIconHover: {
    transform: "scale(1.17)",
  },

  sidebarIconActive: {
    background: "linear-gradient(to right, #3a00ff, #3183ff)",
    borderTopRightRadius: "3px",
    borderBottomRightRadius: "3px",
    borderTopLeftRadius: "14px",
    borderBottomLeftRadius: "14px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    color: "white",
    width: "63px",
    height: "48px",
    fontSize: "19px",
  },

  iconSvg: {
    width: "16px",
    height: "20px",
  },
};

function SidebarIcon({ icon, active }) {
  const [hover, setHover] = useState(false);

  const combinedStyle = {
    ...styles.sidebarIcon,
    ...(hover ? styles.sidebarIconHover : {}),
    ...(active ? styles.sidebarIconActive : {}),
  };

  return (
    <div
      style={combinedStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={styles.iconSvg}>{icon}</div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside style={styles.leftRectangle}>
      <div style={styles.sidebarIcons}>
        <SidebarIcon icon={<FaHome />} />
        <SidebarIcon icon={<FaBook />} />
        <SidebarIcon icon={<FaClipboardList />} />
        <SidebarIcon icon={<FaStar />} />
        <SidebarIcon icon={<FaStickyNote />} />
        <SidebarIcon icon={<FaUserGraduate />} />
        <SidebarIcon icon={<FaMoneyBillWave />} />
        <SidebarIcon icon={<FaGraduationCap />} active />
        <SidebarIcon icon={<FaUpload />} />
        <SidebarIcon icon={<FaBriefcaseMedical />} />
        <SidebarIcon icon={<FaCar />} />
        <SidebarIcon icon={<FaQuestionCircle />} />
      </div>
    </aside>
  );
}

export default Sidebar;
