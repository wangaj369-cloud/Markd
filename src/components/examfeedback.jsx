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

if(!examResults.feedback || examResults.feedback.length === 0){

return(
<div>
<h1>No feedback array found</h1>
</div>
);

}

const feedback =
examResults.feedback[currentQuestion];

if(!feedback){

return(
<div>
<h1>No feedback for this question</h1>
</div>
);

}
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
<div>

<button
disabled={currentQuestion===0}
onClick={() => setCurrentQuestion(currentQuestion-1)}
>
Previous
</button>

{currentQuestion < examResults.feedback.length - 1 ? (

<button
onClick={() => setCurrentQuestion(currentQuestion+1)}
>
Next
</button>

) : (
<>
<button
onClick={() => setRevisionStage("practiceMistakes")}
>
Practice My Mistakes
</button>

<button
onClick={() => setRevisionStage("examSetup")}
>
New Exam
</button>

<button
onClick={() => setRevisionStage("setup")}
>
Home
</button>
</>

)}

</div>

</div>

);

}