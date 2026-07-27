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
  const [answer, setAnswer] = useState("");
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
      key={currentQuestion}
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

{result.automaticMarkingFailed && (
  <>
    <h2>Automatic marking unavailable</h2>

    <h3>Model answer</h3>

    <pre>{result.modelAnswer}</pre>

    <h3>Official mark scheme</h3>

    <pre>{result.markScheme}</pre>

    <div>
      <button onClick={()=>selfMark(0)}>0</button>
      <button onClick={()=>selfMark(1)}>1</button>
      <button onClick={()=>selfMark(2)}>2</button>
      ...
      <button onClick={()=>selfMark(maxMarks)}>Full Marks</button>
    </div>
  </>
)}

</div>
<button
  className="next-question-button"
 onClick={async () => {

  if (currentQuestion === questions.length - 1) {

    await generateSummary();

    setRevisionStage("summary");

  } else {

  setAnswer("");

  setDiagram(null);

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