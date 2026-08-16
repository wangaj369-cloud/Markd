import ProgressCard from "./progresscard";
import { subjectTopics } from "./subject";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

export default function SetupPage({
  subject,
  setSubject,
  topic,
  setTopic,
  subtopic,
  setSubtopic,
  subjectTopics,
  generateQuestions,
  setRevisionStage,
  revisionHistory,
   onLogout,
}) {
  const [user, setUser] = useState(null);

useEffect(() => {
  async function getUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }

  getUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);

   const countSubtopics = (subject) => {

  return Object.values(subjectTopics[subject])
    .reduce(
      (total, subtopics) => total + subtopics.length,
      0
    );

};
  return (
    <div className="setup-page">
    <div className="home-layout">

 
  <main className="home-content">

    {user?.is_anonymous ? (
  <button
    className="create-account-button"
    onClick={() => {
      setIsSignUp(true);
      setPage("login");
    }}
  >
    Create Account
  </button>
) : (
  <button
    className="logout-button"
    onClick={async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout failed:", error);
      }
    }}
  >
    <span className="logout-icon">↪</span>
    Log out
  </button>
)}

      <h1 className="app-title">MARKD</h1>
      <p className="app-subtitle">
        AI-powered A-Level Revision
      </p>


      <div className="subject-selector">
        <button
          className={`subject-card ${subject === "Biology" ? "active" : ""}`}
          onClick={() => {
            setSubject("Biology");
            setTopic("");
            setSubtopic("");
          }}
        >
          <div className="subject-icon">🧬</div>
          <div className="subject-title">Biology</div>
          <div className="subject-subtitle">AQA A-Level</div>
        </button>
        <button
          className={`subject-card ${subject === "Chemistry" ? "active" : ""}`}
          onClick={() => {
            setSubject("Chemistry");
            setTopic("");
            setSubtopic("");
          }}
        >
          <div className="subject-icon">⚗️</div>
          <div className="subject-title">Chemistry</div>
          <div className="subject-subtitle">AQA A-Level</div>
        </button>
        <button
          className={`subject-card ${subject === "Psychology" ? "active" : ""}`}
          onClick={() => {
            setSubject("Psychology");
            setTopic("");
            setSubtopic("");
          }}
        >
          <div className="subject-icon">🧠</div>
          <div className="subject-title">Psychology</div>
          <div className="subject-subtitle">AQA A-Level</div>
        </button>
      </div>
      <div className="dropdown-container">
        <select
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setSubtopic("");
          }}
        >
          <option value="">Select Topic</option>
          {Object.keys(subjectTopics[subject]).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {topic && (
          <select
            value={subtopic}
            onChange={(e) => setSubtopic(e.target.value)}
          >
            <option value="">Select Subtopic</option>
            {(subjectTopics[subject]?.[topic] || []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <br />
        <br />
     {topic && subtopic && (
  <>
    <button
      className="start-button"
      onClick={async () => {
        await generateQuestions();
        setRevisionStage("explanation");
      }}
    >
      Start Revision →
    </button>
  </>
)}


<button
  className="exam-button"
  onClick={() => setRevisionStage("examSetup")}
>
  📝 Exam Mode
</button>


<div className="mobile-divider"></div>


<div className="progress-section">

  <button
    className="progress-button"
    onClick={() => setRevisionStage("dashboard")}
  >
    📊 My Progress
  </button>

</div>
<div className="mini-progress-dashboard">

    <ProgressCard
      subject="Biology"
      totalTopics={countSubtopics("Biology")}
      revisionHistory={revisionHistory}
    />

    <ProgressCard
      subject="Chemistry"
      totalTopics={countSubtopics("Chemistry")}
      revisionHistory={revisionHistory}
    />

    <ProgressCard
      subject="Psychology"
      totalTopics={countSubtopics("Psychology")}
      revisionHistory={revisionHistory}
    />
    </div>

</div>   {/* closes dropdown-container */}


</main>

</div>

</div>

);
}
