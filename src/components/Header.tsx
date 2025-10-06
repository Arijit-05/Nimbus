import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'

function Header() {
    const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={styles.header}>

        {/* Logo Section */}
        <div style={styles.logoContainer}>
            <img style={styles.logo} src="/logo192.png" alt="logo" />
            <h1 style={styles.title}>Nimbus</h1>
        </div>

        {/* Hamburger for mobile */}
        <div style={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>
            { menuOpen ? <X size={28} /> : <Menu size={28} /> }
        </div>

        {/* Navigation Links */}
        <nav style={{...styles.nav, ...(menuOpen ? styles.navOpen : {})}} >
            <a style={styles.link} href="#home">Home</a>
            <a style={styles.link} href="#notes">Notes</a>
            <a style={styles.link} href="#secret">Secret</a>
            <a style={styles.link} href="#about">About</a>
        </nav>

    </header>
  )
}

const styles: { [key: string]: React.CSSProperties } = {

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 40px",
        backgroundColor: "#1E293B",
        color: "#f9fcf8ff",
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        boxSizing: "border-box",
        zIndex: 1000,
        borderRadius: "10px"
    },

    logoContainer: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    logo: {
        width: "35px",
        height: "35px",
        borderRadius: "8px",
    },

    title: {
        fontSize: "1.3rem",
        fontWeight: "bold"
    },

    menuIcon: {
        display: "none",
        cursor: "pointer"
    },

    nav: {
        display: "flex",
        gap: "20px"
    },

    link: {
        textDecoration: "none",
        color: "#F8FAFC",
        fontWeight: 500
    },

    navOpen: {
        top: "60px",
        left: 0,
        right: 0,
        backgroundColor: "#1E293B",
        alignItems: "center",
        padding: "10px 0",
        display: "flex"
    }
}

if (window.innerWidth <= 768) {
    styles.menuIcon.display = "block"
    styles.nav.display= "none"
}

export default Header