import "./sidepanel.css"

function SidePanel() {
  return (
    <div className="sidepanel-container">
      <header className="header">
        <h1>Intuition Extension</h1>
        <p>A minimal web page in your side panel</p>
      </header>
      
      <main className="main-content">
        <section className="content-section">
          <h2>Welcome</h2>
          <p>This is a simple side panel with minimal styling.</p>
        </section>
        
        <section className="content-section">
          <h3>Features</h3>
          <ul>
            <li>Clean, minimal design</li>
            <li>Side panel integration</li>
            <li>Browser extension powered by Plasmo</li>
          </ul>
        </section>
        
        <section className="content-section">
          <h3>Quick Links</h3>
          <div className="links">
            <a href="https://www.plasmo.com" target="_blank" rel="noopener noreferrer">
              Plasmo
            </a>
            <a href="https://developer.chrome.com/docs/extensions/" target="_blank" rel="noopener noreferrer">
              Chrome Extensions
            </a>
          </div>
        </section>
      </main>
      
      <footer className="footer">
        <p>&copy; 2024 Intuition Extension</p>
      </footer>
    </div>
  )
}

export default SidePanel