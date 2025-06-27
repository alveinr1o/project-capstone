import React, { useEffect, useState } from "react";
import {
  FaBars,
  FaRegCompass,
  FaRegComments,
  FaRegBell,
} from "react-icons/fa";
import profilePic from "../assets/daun_sakit_5hLGiSD.png";

function HeaderIcon({ icon, active }) {
  const [hover, setHover] = useState(false);

  const combinedStyle = {
    ...styles.headerIcon,
    ...(hover ? styles.headerIconHover : {}),
    ...(active ? styles.headerIconActive : {}),
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

function Header() {
  const [user, setUser] = useState({
    name: "",
    nip: "",
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedNip = localStorage.getItem("nip");

    setUser({
      name: storedUsername ?? "",
      nip: storedNip ?? "",
    });
  }, []);


  return (
    <nav style={styles.topRectangle}>
      <div style={styles.topBarContent}>
        <FaBars style={styles.menuBars} />

        <div style={styles.rightContent}>
          <div style={styles.topIconBar}>
            <HeaderIcon icon={<FaRegCompass />} />
            <HeaderIcon icon={<FaRegComments />} />
            <HeaderIcon icon={<FaRegBell />} />
          </div>
          <div style={styles.userProfile}>
            <img src={profilePic} alt="User" style={styles.profilePic} />
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userId}>{user.nip}</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  topRectangle: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "53px",
    backgroundColor: "white",
    zIndex: 1100,
    boxShadow: "0px 1px 5px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
  },
  topBarContent: {
    height: "100%",
    marginLeft: "92.7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    width: "100%",
  },
  menuBars: {
    marginRight: "auto",
    fontSize: "20px",
    color: "#7F7F7F",
    cursor: "pointer",
  },
  rightContent: {
    display: "flex",
    gap: "45px",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    marginRight: "20px",
    fontSize: "20px",
    color: "#7F7F7F",
    fontWeight: "bold",
  },
  topIconBar: {
    display: "flex",
    gap: "25px",
    color: "#7F7F7F",
    cursor: "pointer",
    width: "97px",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "20px",
    fontWeight: "bold",
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
    fontSize: "15px",
  },
  userId: {
    fontWeight: "lighter",
    color: "#7F7F7F",
    fontSize: "13px",
  },
  headerIcon: {
    fontSize: "23px",
    color: "#7F7F7F",
    fontWeight: "bold",
    cursor: "pointer",
    width: "36px",
    height: "36px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    transition: "all 0.2s ease-in-out",
    gap: "5px",
  },
  headerIconHover: {
    color: "#343a40",
    cursor: "pointer",
  },
  headerIconActive: {
    color: "#343a40",
  },
  iconSvg: {
    width: "auto",
    height: "auto",
  },
};

export default Header;
