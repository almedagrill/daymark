function Privacy() {
  return (
    <div className="privacy-page">
      <h2>Privacy</h2>

      <div className="privacy-item">
        <h3>Your data stays on your device</h3>
        <p>
          Everything you write in Daymark is stored locally in your browser.
          Your entries never leave your computer or phone.
        </p>
      </div>

      <div className="privacy-item">
        <h3>No accounts</h3>
        <p>
          There's no sign-up, no login, no email collection.
          You just open the app and start writing.
        </p>
      </div>

      <div className="privacy-item">
        <h3>No servers</h3>
        <p>
          Daymark has no backend, no database, no cloud storage.
          We couldn't read your entries even if we wanted to.
        </p>
      </div>

      <div className="privacy-item">
        <h3>No tracking</h3>
        <p>
          No analytics, no cookies, no third-party scripts.
          We don't know who you are or how you use the app.
        </p>
      </div>

      <div className="privacy-item">
        <h3>You own your data</h3>
        <p>
          Use the Export button anytime to download all your entries as a JSON file.
          It's your journal—take it wherever you want.
        </p>
      </div>

      <p className="privacy-note">
        This is how software should be. Simple, private, yours.
      </p>
    </div>
  )
}

export default Privacy
