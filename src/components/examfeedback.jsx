import { useState } from "react";

export default function ExamFeedback({

examResults,
setRevisionStage

}){

const [currentQuestion,setCurrentQuestion] = useState(0);

if(!examResults){

return(
<div>
<h1>No feedback available</h1>
</div>
);

}

const feedback =
examResults.feedback[currentQuestion];
return(

<div>

<h1>
Exam Feedback
</h1>

<h2>
Question {currentQuestion+1} / {examResults.feedback.length}
</h2>

<p>
<strong>Question</strong>
</p>

<p>
{feedback.questionText}
</p>

<p>
<strong>Your Answer</strong>
</p>

<p>
{feedback.studentAnswer}
</p>

<p>
<strong>Strengths</strong>
</p>

<p>
{
feedback.strengths || "No strengths identified."
}
</p>

<p>
<strong>Improvements</strong>
</p>

<p>
{
feedback.improvements || "No improvements needed."
}
</p>

<p>
<strong>Model Answer</strong>
</p>

<p>
{feedback.modelAnswer}
</p>

<button
disabled={currentQuestion===0}
onClick={()=>setCurrentQuestion(currentQuestion-1)}
>
Previous
</button>

<button

onClick={()=>{

if(currentQuestion===examResults.feedback.length-1){

setRevisionStage("examResults");

}

else{

setCurrentQuestion(currentQuestion+1);

}

}}

>

{
currentQuestion===examResults.feedback.length-1
?
"Finish"
:
"Next"
}

</button>

</div>

);

}