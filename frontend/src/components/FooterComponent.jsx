import React from 'react'

function FooterComponent() {
  return (
    <footer className="footer">
    <div className="footer-content">
      <p>© {new Date().getFullYear()} [INSERT]. All rights reserved.</p>
      <p>[Project Name]</p>
      <p>[Department or Faculty Name]</p>
      <p>[INSERT Address]</p>
      <p>Email: <a href="mailto:[contact email]">[INSERT email]</a> | Phone: [INSERT number]</p>
      <p>Website: <a href="[project or university website URL]">[project or university website URL]</a></p>
      <p className="footer-acknowledgments">
        <strong>Acknowledgments:</strong> This project is supported by [Funding Organization/Grant Number, if applicable].
      </p>
      <p className="footer-disclaimer">
        <strong>Disclaimer:</strong> The views expressed in this project are those of the authors and do not necessarily reflect the official policy or position of [University Name] or any other affiliated organization.
      </p>
    </div>
  </footer>
  )
}

export default FooterComponent