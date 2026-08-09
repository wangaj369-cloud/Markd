import { useEffect } from "react";
import { supabase } from "../supabase";

export default function SummaryPage({
    subject,
    topic,
    subtopic,
    results,
    questions,
    summary,
    setRevisionStage,
    setQuestions,
    setAnswers,
    setResults,
    setCurrentQuestion,
    setTopic,
    setSubtopic,
  setRevisionHistory,
  revisionQueue,
currentRevisionIndex,
setCurrentRevisionIndex,
generateQuestions,
examSubject,  
 user,
}) {
    

const totalMarks = questions.reduce(
  (sum, q) => sum + (Number(q.marks) || 0),
  0
);

const marksAwarded = Object.values(results).reduce(
  (sum, r) => sum + (Number(r.score) || 0),
  0
);

const percentage =
  totalMarks > 0
    ? Math.round((marksAwarded / totalMarks) * 100)
    : 0;
let grade = "E";

if (percentage >= 80) grade = "A";
else if (percentage >= 70) grade = "B";
else if (percentage >= 60) grade = "C";
else if (percentage >= 50) grade = "D";

const retryTopic = async () => {

  // Normal revision mode
  if (!revisionQueue || revisionQueue.length === 0) {

    setAnswers({});
    setResults({});
    setCurrentQuestion(0);
    setQuestions([]);

    setRevisionStage("explanation");

    return;
  }

  // Exam mode → retry the CURRENT weak topic
  const currentTopic = revisionQueue[currentRevisionIndex];

  console.log(
    "RETRYING CURRENT TOPIC:",
    currentTopic
  );

  setAnswers({});
  setResults({});
  setCurrentQuestion(0);
  setQuestions([]);

  await generateQuestions({

    subject: currentTopic.subject,

    topic: currentTopic.topic,

    subtopic: currentTopic.subtopic

  });

  setRevisionStage("explanation");

};
const reviseNextWeakTopic = async () => {

  const nextIndex = currentRevisionIndex + 1;

  // Finished all weak topics
  if (nextIndex >= revisionQueue.length) {

    setRevisionStage("weakTopicsComplete");
    return;

  }

  const nextTopic = revisionQueue[nextIndex];

  console.log(
    "NEXT WEAK TOPIC:",
    nextTopic
  );

  setCurrentRevisionIndex(nextIndex);

  setAnswers({});
  setResults({});
  setQuestions([]);
  setCurrentQuestion(0);

  await generateQuestions({

    subject: nextTopic.subject,

    topic: nextTopic.topic,

    subtopic: nextTopic.subtopic

  });

  setRevisionStage("explanation");

};

const chooseNewTopic = () => {

  setAnswers({});
  setResults({});
  setQuestions([]);
  setCurrentQuestion(0);

  setTopic("");
  setSubtopic("");

  setRevisionStage("setup");

};
useEffect(() => {

  async function saveRevision() {

    if (!user) {
      console.log("No logged-in user, revision not saved.");
      return;
    }

    const alreadySaved =
      sessionStorage.getItem("lastSavedRevision");

    const currentRevision =
      `${subject}-${subtopic}-${percentage}`;

    if (alreadySaved === currentRevision) {
      return;
    }

    sessionStorage.setItem(
      "lastSavedRevision",
      currentRevision
    );

    const status =
      percentage >= 70
        ? "completed"
        : "attempted";

    const record = {
      subject,
      topic,
      subtopic,
      score: marksAwarded,
      totalMarks,
      percentage,
      grade,
      status,
      date: new Date().toISOString()
    };

    // Keep existing localStorage behaviour for now
    const history =
      JSON.parse(
        localStorage.getItem("revisionHistory")
      ) || [];

    const existingIndex = history.findIndex(
      item =>
        item.subject === subject &&
        item.subtopic === subtopic
    );

    if (existingIndex !== -1) {
      history[existingIndex] = record;
    } else {
      history.push(record);
    }

    localStorage.setItem(
      "revisionHistory",
      JSON.stringify(history)
    );


    // Check whether this topic already exists
    // for this student in Supabase
    const { data: existingRecord, error: findError } =
      await supabase
        .from("revision_history")
        .select("id")
        .eq("user_id", user.id)
        .eq("subject", subject)
        .eq("subtopic", subtopic)
        .maybeSingle();

    if (findError) {
      console.error(
        "Failed to check revision history:",
        findError
      );
      return;
    }


    const supabaseRecord = {
      user_id: user.id,
      subject,
      topic,
      subtopic,
      score: marksAwarded,
      max_score: totalMarks
    };


    if (existingRecord) {

      const { error } = await supabase
        .from("revision_history")
        .update(supabaseRecord)
        .eq("id", existingRecord.id);

      if (error) {
        console.error(
          "Failed to update revision history:",
          error
        );
        return;
      }

      console.log(
        "Revision history updated in Supabase."
      );

    } else {

      const { error } = await supabase
        .from("revision_history")
        .insert(supabaseRecord);

      if (error) {
        console.error(
          "Failed to save revision history:",
          error
        );
        return;
      }

      console.log(
        "Revision history saved to Supabase."
      );
    }
  }

  saveRevision();

}, [
  user,
  subject,
  topic,
  subtopic,
  percentage,
  marksAwarded,
  totalMarks,
  grade
]);


return (
  <div className={`summary-page ${subject.toLowerCase()}`}>

    <div className="summary-container">

     <h1>Revision Complete 🎉</h1>

<p className="summary-subtitle">
  Excellent work — you've completed this revision session.
</p>

      <div className="summary-score-card">
      <div
        className={`summary-score ${
          percentage >= 70
            ? "good"
            : percentage >= 50
            ? "average"
            : "poor"
        }`}
      >
        {marksAwarded} / {totalMarks}
      </div>

      <div className={`summary-grade grade-${grade}`}>
  Grade {grade}
</div>

      <div className="summary-percentage">
        {percentage}%
        <p className="performance-message">
  {percentage >= 80
    ? "Outstanding performance — you are exam ready."
    : percentage >= 60
    ? "Great progress — keep refining your exam technique."
    : percentage >= 40
    ? "Good effort — focus on the improvement areas below."
    : "Keep practising — every attempt helps you improve."}
</p>
      </div>
      </div>

      <div className="summary-feedback-card">

        <h2>
          Overall Feedback
        </h2>

        <p>
          {summary?.overallFeedback || "Generating your feedback..."}
        </p>
      </div>

      <h2 className="summary-section-title">
        ✅ Your Strengths
      </h2>

      <div className="summary-grid">

        {summary?.strengths?.map((strength, i) => (
          <div
            className="summary-card strength-card"
            key={i}
          >
            {strength}
          </div>
        ))}
      </div>

      <h2 className="summary-section-title">
        📈 Areas to Improve
      </h2>

      <div className="summary-grid">

        {summary?.improvements?.map((item, i) => (
          <div
            className="summary-card improvement-card"
            key={i}
          >
            {item}
          </div>
        ))}
      </div>

      <div className={`examiner-tip ${subject.toLowerCase()}`}>

        <h2>
          💡 Examiner Tip
        </h2>

        <p>
          {summary?.examinerTip}
        </p>

      </div>

    </div>

   <div className="summary-buttons">


<button
className="retry-button"
onClick={retryTopic}
>
↻ Retry Topic
</button>



{
revisionQueue &&
revisionQueue.length > 0 &&
currentRevisionIndex < revisionQueue.length - 1 &&

<button
className="weak-topic-button"
onClick={reviseNextWeakTopic}
>

📚 Revise Next Weak Topic:

{" "}

{revisionQueue[currentRevisionIndex + 1].subtopic}

→

</button>

}



{
revisionQueue &&
revisionQueue.length > 0 &&
currentRevisionIndex >= revisionQueue.length - 1 &&

<button
className="weak-topic-button"
onClick={reviseNextWeakTopic}
>

🎉 Complete Weak Topics

</button>

}



<button
className="new-topic-button"
onClick={chooseNewTopic}
>
＋ Choose New Topic
</button>


</div>

  </div>
);
}
