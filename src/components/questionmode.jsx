import { useState } from "react";
import DiagramCanvas from "./diagramcanvas";

export default function QuestionMode({
  questions,
  answers,
  setAnswers,
  results,
  markAnswer,
  currentQuestion,
  setCurrentQuestion,
  setRevisionStage,
  generateSummary,
  subject
}) {
const [diagram, setDiagram] = useState(null);
const question = questions[currentQuestion];
if (!question || questions.length === 0) {
  return <p>Loading questions...</p>;
}
return (
  <div className={`question-page ${subject.toLowerCase()}`}>

    <button
      className="back-button"
      onClick={() => setRevisionStage("videos")}
    >
      <span className="back-icon">←</span>
      Back
    </button>

<div className="question-header">

  <div className="section-label">
    EXAM QUESTIONS
  </div>

  <h1>
    Test your understanding
  </h1>

  <p className="questions-description">
    Answer AQA-style questions and receive AI feedback to improve your exam technique.
  </p>

  <div className="question-counter">
    Question {currentQuestion + 1} / {questions.length}
  </div>

</div>

    <div className="question-card">

     

     <div className="marks-badge">
  {question.marks} marks
</div>

      <p>
        {question.question}
      </p>

      <textarea
  className="answer-box"
  rows={question.marks >= 6 ? 10 : question.marks >= 4 ? 8 : 5}
  value={answers[currentQuestion] || ""}
  onChange={(e) =>
    setAnswers({
      ...answers,
      [currentQuestion]: e.target.value,
    })
  }
  placeholder="Type your answer..."
/>
{(question.requiresDrawing || question.requiresDiagram) && (
  <div className="diagram-box">

    This question requires a labelled diagram

    <DiagramCanvas
      onSave={setDiagram}
    />

  </div>
)}

      <button
  className="mark-button"
 onClick={() =>
  markAnswer(
    question,
    currentQuestion,
    diagram
  )
}
>
  Mark Answer →
</button>

      {results[currentQuestion] && (
        <>
         <div className="feedback-container">

 <div className="feedback-card mark-card">

<div className="score-card">

  <h3>⭐ Mark Awarded</h3>

  <div
    className={
      results[currentQuestion].score >= question.marks / 2
        ? "score good"
        : "score bad"
    }
  >
    {results[currentQuestion].score}/{question.marks}
  </div>

</div>

  <p>
    {results[currentQuestion].score}/{question.marks}
  </p>

</div>


<div className="feedback-card">

  <h4>
    ✅ Strengths
  </h4>

  <p>
    {results[currentQuestion].strengths}
  </p>

</div>


<div className="feedback-card">

  <h4>
    📈 Improvements
  </h4>

  <p>
    {results[currentQuestion].improvements}
  </p>

</div>


<div className="feedback-card">

  <h4>
    📝 Model Answer
  </h4>

  <p>
    {results[currentQuestion].modelAnswer}
  </p>

</div>

</div>
<button
  className="next-question-button"
 onClick={async () => {

  if (currentQuestion === questions.length - 1) {

    await generateSummary();

    setRevisionStage("summary");

  } else {

    setCurrentQuestion(currentQuestion + 1);

  }

}} 
>
            {currentQuestion === questions.length - 1
              ? "Finish Revision"
              : "Next Question →"}
          </button>

        </>
      )}

    </div>

  </div>
  );
}