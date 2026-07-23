import React, { useState } from "react";
console.log(
"FEEDBACK PAGE DATA:",
examResults
);
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

setExamResults(data);

setMarking(false);


}
return (

<div className="exam-results">

<h1>
📝 Exam Results
</h1>

<button
onClick={markExam}
disabled={marking}
>

{
marking
?
"Marking..."
:
"Mark Exam"
}

</button>

<h2>
{completedExam.subject} {completedExam.level}
</h2>


<h3>
Total Marks: {totalMarks}
</h3>


<h3>
Questions Completed: {completedExam.questions.length}
</h3>


<hr/>


<h2>
Question Breakdown
</h2>


{
completedExam.questions.map((q,index)=>(

<div key={index}>

<h3>
Question {index+1}
</h3>


<p>
<strong>Question:</strong>
</p>

<p>
{q.question}
</p>


<p>
<strong>Your Answer:</strong>
</p>

<p>
{
completedExam.answers[index] || "No answer"
}
</p>


<p>
<strong>Available Marks:</strong> {q.marks}
</p>


<hr/>

</div>

))
}
{
examResults && (

<div>

<h2>
Score:
{
examResults.score
}
/
{
examResults.total || examResults.totalMarks
}
(
{Math.round(
(examResults.score / examResults.total) * 100
)}%
)
</h2>

<h2>
Grade: {getGrade(percentage)}
</h2>

<button
onClick={() => setShowFeedback(!showFeedback)}
>

{
showFeedback
? "Hide Feedback"
: "View Feedback"
}

</button>
{
showFeedback && (

<div>

<button
onClick={() => setRevisionStage("examFeedback")}
>
View Feedback
</button>
</div>

)
}
</div>

)
}

</div>

);

}