import { supabase } from "../supabase";
import { useEffect, useRef } from "react";

export default function ExamResultsFinal({

completedExam,
examResults,
setRevisionStage,
setExamResults,
 user

}){


function getGrade(percent){

if(percent >= 80) return "A";
if(percent >= 70) return "B";
if(percent >= 60) return "C";
if(percent >= 50) return "D";
if(percent >= 40) return "E";

return "U";

}



function getPerformanceMessage(percent){

if(percent >= 80){

return "Excellent performance. You have a strong understanding of this content.";

}

if(percent >= 70){

return "Good performance. Your understanding is strong, but there are still areas to improve.";

}

if(percent >= 60){

return "Solid performance. Review your weaker areas to push your grade higher.";

}

if(percent >= 50){

return "You understand some key ideas, but more revision is needed.";

}

return "You need to revisit the core concepts from this exam.";

}

const savedExam = useRef(false);

useEffect(() => {
  async function saveExamResult() {
    if (!user || !completedExam || !examResults) {
      return;
    }

    if (savedExam.current) {
      return;
    }

    savedExam.current = true;

    const calculatedScore =
      examResults.feedback?.reduce(
        (sum, item) => sum + (item.mark || 0),
        0
      ) || examResults.score || 0;

    const calculatedTotal =
      examResults.feedback?.reduce(
        (sum, item) => sum + (item.maxMark || 0),
        0
      ) || examResults.total || examResults.totalMarks || 0;

    const percentage =
      calculatedTotal > 0
        ? Math.round((calculatedScore / calculatedTotal) * 100)
        : 0;

    const grade = getGrade(percentage);

    const { error } = await supabase
      .from("exam_results")
      .insert({
        user_id: user.id,
        subject: completedExam.subject,
        level: completedExam.level,
        paper_type: completedExam.paperType,
        topic: completedExam.topic,
        difficulty: completedExam.difficulty,
        score: calculatedScore,
        total_marks: calculatedTotal,
        percentage,
        grade,
        exam_data: {
          completedExam,
          examResults
        }
      });

    if (error) {
      console.error("Failed to save exam result:", error);
      savedExam.current = false;
      return;
    }

    console.log("Exam result saved to Supabase");
  }

  saveExamResult();
}, [user, completedExam, examResults]);

if(!examResults){

return(

<div>

<h1>
No results available
</h1>

</div>

);

}



// Recalculate score from feedback to include self-assessed diagram marks
const calculatedScore = examResults.feedback?.reduce(
  (sum, item) => sum + (item.mark || 0),
  0
) || examResults.score;

const calculatedTotal = examResults.feedback?.reduce(
  (sum, item) => sum + (item.maxMark || 0),
  0
) || (examResults.total || examResults.totalMarks);

const percentage = Math.round(
  (calculatedScore / calculatedTotal) * 100
);

// Calculate weakTopics from feedback (includes both AI and self-assessed marks)
const weakTopics = (examResults.feedback || [])
.filter(item => {
  const percent = (item.mark / item.maxMark) * 100;
  return percent < 60;
})
.map(item => {
  const question = completedExam.questions[item.question - 1];
  return {
    topic: question?.topic || "General",
    subtopic: question?.subtopic || "General",
    mark: item.mark,
    maxMark: item.maxMark,
    percentage: Math.round(
      (item.mark / item.maxMark) * 100
    )
  };
});

// Update examResults with weakTopics if not already set
if (!examResults.weakTopics && setExamResults) {
  setExamResults({
    ...examResults,
    weakTopics
  });
}



return(


<div className="exam-results-page">


<div className="exam-results-card">


<h1>
📝 Final Exam Results
</h1>


<h2>

{completedExam.subject} {completedExam.level}

</h2>



<div className="results-stats">


<div className="result-stat">

<div className="stat-value">

{calculatedScore} / {calculatedTotal}

</div>

<div className="stat-label">

Score

</div>

</div>



<div className="result-stat">

<div className="stat-value">

{percentage}%

</div>

<div className="stat-label">

Percentage

</div>

</div>



<div className="result-stat">

<div className="stat-value">

{getGrade(percentage)}

</div>

<div className="stat-label">

Grade

</div>

</div>


</div>



<p className="performance-message">

{getPerformanceMessage(percentage)}

</p>



<div className="results-actions">


<button

className="results-button primary"

onClick={()=>setRevisionStage("practiceMistakes")}

>

Practice My Mistakes →

</button>



<button

className="results-button"

onClick={()=>setRevisionStage("examSetup")}

>

New Exam

</button>


<button

className="results-button"

onClick={()=>setRevisionStage("setup")}

>

Home

</button>


</div>



</div>


</div>


);


}