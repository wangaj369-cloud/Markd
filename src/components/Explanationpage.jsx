import ReactMarkdown from "react-markdown";
import { Children } from "react";
 export default function ExplanationPage({
  subject,
  subtopic,
  explanation,
  setRevisionStage
}){

  if (!explanation) {
    return <p>Loading explanation...</p>;
  }

  return (
    <div className={`revision-card ${subject.toLowerCase()}`}>
    <button
  className={`back-button ${subject.toLowerCase()}`}
  onClick={() => setRevisionStage("setup")}
>
  <span className="back-icon">←</span>
  Back
</button>


      <div className="explanation-header">




  <p className={`subject-badge ${subject.toLowerCase()}`}>
    AQA {subject}
  </p>

  <h1 className="explanation-title">
    {subtopic}
  </h1>

</div>

    <div className="overview-section">

  <p className="section-label">
    TOPIC OVERVIEW
  </p>

  <div className="revision-summary">
 <ReactMarkdown
  components={{
  li: ({children}) => {
  const text = Children.toArray(children)
    .map(child =>
      typeof child === "string" ? child : ""
    )
    .join("");

  if (text.includes("⚠️")) {
    return (
      <div className="mistake-card">
        {children}
      </div>
    );
  }

  return (
    <div className="term-card">
      {children}
    </div>
  );
},
  }}
>
  {explanation.replace("# Topic Overview", "")}
</ReactMarkdown>
  </div>
  <button
    className="start-button tailored-videos-button"
    onClick={() => setRevisionStage("videos")}
  >
    Tailored videos →
  </button>

</div>


    </div>
  );
}