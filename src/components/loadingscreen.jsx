export default function LoadingScreen() {

  return (
    <div className="loading-card">
      <div className="loading-spinner"></div>

      <h2>
        Markd AI is building your revision session
      </h2>

      <p>
        Generating revision summary...
        <br />
        Finding the best learning videos...
        <br />
        Creating exam questions...
      </p>

      <div className="loading-bar">
        <div className="loading-progress"></div>
      </div>
    </div>
  );
}