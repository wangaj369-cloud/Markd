import { useState, useEffect } from "react";

 export default function ExamResults({

completedExam,
examResults,
setExamResults,
setRevisionStage

}){

const [marking,setMarking] = useState(false);
const [showFeedback, setShowFeedback] = useState(false);

function getGrade(percent){

if(percent >= 80) return "A";
if(percent >= 70) return "B";
if(percent >= 60) return "C";
if(percent >= 50) return "D";
if(percent >= 40) return "E";

return "U";

}
if(!completedExam){
return (
<div>
<h1>No exam data found</h1>
</div>
);

}
function getPerformanceMessage(percent){

if(percent >= 80){
    return "🌟 Excellent performance";
}

if(percent >= 70){
    return "✅ Strong understanding";
}

if(percent >= 60){
    return "📚 Good progress";
}

if(percent >= 50){
    return "⚠️ Developing understanding";
}

return "📖 More revision recommended";

}


const totalMarks = completedExam.questions.reduce(
(sum,q)=>sum + Number(q.marks),
0
);

const percentage =
examResults
? Math.round(
(
examResults.score /
(examResults.total || examResults.totalMarks)
)
*100
)
: 0;

async function markExam(){

setMarking(true);


const response = await fetch(
"https://markd-ltw1.onrender.com/mark-exam",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

questions: completedExam.questions,

answers: completedExam.answers

})

});


const data = await response.json();


console.log(
"MARK RESULT:",
JSON.stringify(data,null,2)
);

// Calculate score and total from feedback if not provided
if (!data.score && data.feedback) {
  data.score = data.feedback.reduce((sum, item) => sum + (item.mark || 0), 0);
  data.total = data.feedback.reduce((sum, item) => sum + (item.maxMark || 0), 0);
}

if(data.feedback){

data.feedback = data.feedback.map((item, index) => ({
  ...item,
  subtopic: completedExam.questions[index]?.subtopic || "General"
}));

}
const weakTopics = (data.feedback || [])
.filter(item => {
  const percent = (item.mark / item.maxMark) * 100;
  return percent < 60;
})
.map(item => {

  const question = completedExam.questions[item.question - 1];

  return {
    topic: question.topic,
    subtopic: question.subtopic,
    mark: item.mark,
    maxMark: item.maxMark,
    percentage: Math.round(
      (item.mark / item.maxMark) * 100
    )
  };

});
console.log(
  "QUESTION WITH TOPIC:",
  completedExam.questions[0]
);
data.weakTopics = weakTopics.map(item => ({

  subtopic: item.subtopic,

  mark: item.mark,

  maxMark: item.maxMark,

  percentage: Math.round(
    (item.mark / item.maxMark) * 100
  )

}));


console.log(
"WEAK TOPICS:",
data.weakTopics
);
setExamResults({
  ...data,
  subject: completedExam.subject,
  level: completedExam.level
});

setMarking(false);


}
useEffect(() => {

  if (!completedExam || examResults) return;

  markExam();

}, [completedExam, examResults]);

if(marking){

return(

<div className="exam-marking-page">


<div className="exam-marking-card">


<span className="exam-paper-badge">
EXAM MODE
</span>







<h1>
AI is marking your exam...
</h1>



<p>
Your answers are being analysed against the mark scheme.
</p>




<div className="marking-loader">

<div className="loader-circle">

</div>

</div>




<div className="marking-status">


<div className="complete">
✓ Checking answers
</div>


<div className="complete">
✓ Comparing mark scheme
</div>


<div>
○ Creating feedback
</div>


<div>
○ Finding improvement areas
</div>


</div>




</div>


</div>

);

}
return (

<div className="exam-results-page">


<div className="exam-results-card">


<span className="exam-paper-badge">
EXAM RESULTS
</span>



<h1>
{completedExam.subject} {completedExam.level}
</h1>


<p className="results-subtitle">
A-Level Mock Exam
</p>





{
examResults && (

<>


<div className="score-card">


<div className="score-number">

{
examResults.score
}

<span>
/
{
examResults.total || examResults.totalMarks
}
</span>


</div>



<div className="percentage">

{
Math.round(
(examResults.score /
(examResults.total || examResults.totalMarks))
*100
)
}%

</div>


</div>






<div className="grade-badge">

Grade {getGrade(percentage)}


</div>

<div className="grade-badge">

Grade {getGrade(percentage)}

</div>

<p className="performance-message">

{getPerformanceMessage(percentage)}

</p>



<div className="results-actions">


<button

className="results-button"

onClick={()=>setShowFeedback(!showFeedback)}

>

{

showFeedback
? "Hide Feedback"
: "View Feedback"

}

</button>



{
showFeedback && (

<button

className="results-button primary"

onClick={()=>setRevisionStage("examFeedback")}

>

Open AI Feedback →

</button>

)

}



</div>



</>

)

}



</div>


</div>


);

}