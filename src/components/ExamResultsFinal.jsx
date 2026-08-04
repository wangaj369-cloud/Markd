export default function ExamResultsFinal({

completedExam,
examResults,
setRevisionStage

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