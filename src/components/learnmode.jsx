
import { useState } from "react";
export default function LearnMode({
  resources,
  subject,
  setRevisionStage
}) {
    const [completedVideos, setCompletedVideos] = useState([]);
const [currentVideo, setCurrentVideo] = useState(0);
const [videoError, setVideoError] = useState(false);
const video = resources[currentVideo];

if (!resources || resources.length === 0) {
  return <p>Loading videos...</p>;
}

return (
  <div className={`videos-page ${subject.toLowerCase()}`}>
      <button
        className="back-button"
        onClick={() => setRevisionStage("explanation")}
      >
        <span className="back-icon">←</span>
        Back
      </button>

      <div className="videos-header">
        <div className="section-label">
          TAILORED VIDEOS
        </div>
<p className="video-progress-text">
  Videos completed: {completedVideos.length}/{resources.length}
</p>
        <h1>
          Learn with expert videos
        </h1>

        <p className="videos-description">
          Markd AI has selected these videos to reinforce your understanding before you attempt exam questions.
        </p>
      </div>

      {Array.isArray(resources) && resources.length > 0 && (
        <div>
         <div className="video-card">

  <p className="video-number">
    Video {currentVideo + 1} of {resources.length}
  </p>

  <h3>{video.title}</h3>

  <div className="video-row">

    <div className="video-frame">
      {videoError ? (
        <div className="video-error">
          <p>⚠️ Video failed to load</p>
          <a
            href={`https://www.youtube.com/watch?v=${video.url}`}
            target="_blank"
            rel="noreferrer"
            className="video-link"
          >
            Watch on YouTube →
          </a>
        </div>
      ) : (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.url}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setVideoError(true)}
        />
      )}
    </div>

    <button
      className={
        completedVideos.includes(currentVideo)
          ? "video-complete completed"
          : "video-complete"
      }
      onClick={() => {
        setCompletedVideos(
          completedVideos.includes(currentVideo)
            ? completedVideos.filter(v => v !== currentVideo)
            : [...completedVideos, currentVideo]
        );
      }}
    >
      {completedVideos.includes(currentVideo)
        ? "✓ Completed"
        : "Mark Complete"}
    </button>

  </div>

</div>
        {currentVideo < resources.length - 1 ? (
  <>
    <button
      className="start-button"
      onClick={() => setCurrentVideo(currentVideo + 1)}
    >
      Next Video →
    </button>

    <button
      className="ghost-button"
      onClick={() => setRevisionStage("questions")}
    >
      Skip to Questions
    </button>
  </>
) : (
  <div className="videos-complete">
    <h2>Ready to test your knowledge?</h2>

    <p>
      You've reached the end of your tailored videos. Put your understanding to the test with exam-style questions.
    </p>

    <button
      className="start-button"
      onClick={() => setRevisionStage("questions")}
    >
      Start Practice Questions →
    </button>
  </div>
)}
        </div>
      )}
    </div>
  );
}