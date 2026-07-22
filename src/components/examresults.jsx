import React from "react";

export default function ExamResults({
  completedExam,
  setRevisionStage
}) {


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


return (

<div className="exam-results">

<h1>
📝 Exam Results
</h1>


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


</div>

);

}