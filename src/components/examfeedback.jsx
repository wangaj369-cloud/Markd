import { useState } from "react";

export default function ExamFeedback({

examResults,
setRevisionStage

}){


const [currentQuestion,setCurrentQuestion] = useState(0);



function getScoreClass(mark,maxMark){


if(mark === maxMark){

    return "perfect";

}


const percentage = (mark / maxMark) * 100;


if(percentage >= 75){

    return "good";

}


if(mark > 0){

    return "partial";

}


return "poor";


}



if(!examResults){

return(

<div className="exam-feedback-page">

<h1>
No feedback available
</h1>

</div>

);

}



if(!examResults.feedback || examResults.feedback.length === 0){

return(

<div className="exam-feedback-page">

<h1>
No feedback found
</h1>

</div>

);

}



const feedback =
examResults.feedback[currentQuestion];



if(!feedback){

return(

<div className="exam-feedback-page">

<h1>
No feedback for this question
</h1>

</div>

);

}



return(

<div className="exam-feedback-page">


<div className="exam-feedback-shell">


<div className="feedback-header">


<span className="exam-paper-badge">

AI EXAM FEEDBACK

</span>


<h1>

{examResults.subject} {examResults.level}

</h1>


{feedback.subtopic && (

<p className="feedback-topic">

{feedback.subtopic}

</p>

)}


<div className="feedback-question-number">

Question {currentQuestion + 1} / {examResults.feedback.length}

</div>


<div

className={
`feedback-score ${getScoreClass(
feedback.mark,
feedback.maxMark
)}`
}

>

{feedback.mark} / {feedback.maxMark} Marks

</div>


</div>

<div className="feedback-card">


<h3>
Question
</h3>


<p>
{feedback.questionText}
</p>


</div>





<div className="feedback-card">


<h3>
Your Answer
</h3>


<p>

{feedback.studentAnswer || "No answer provided."}

</p>


</div>





<div className="feedback-card strengths-card">


<h3>
✅ Strengths
</h3>


<p>

{
feedback.strengths || 
"No strengths identified."
}

</p>


</div>





<div className="feedback-card improvements-card">


<h3>
📈 Improvements
</h3>


<p>

{
feedback.improvements ||
"No improvements needed."
}

</p>


</div>





<div className="feedback-card model-answer-card">


<h3>
⭐ Model Answer
</h3>


<p>

{
feedback.modelAnswer ||
"No model answer available."
}

</p>


</div>






<div className="feedback-navigation">


<button

className="feedback-button"

disabled={currentQuestion === 0}

onClick={()=>{

setCurrentQuestion(
currentQuestion - 1
)

}}

>

← Previous

</button>





{

currentQuestion < examResults.feedback.length - 1 ?


(

<button

className="feedback-button primary"

onClick={()=>{

setCurrentQuestion(
currentQuestion + 1
)

}}

>

Next →

</button>


)


:

(

<div className="feedback-actions">


<button

className="feedback-button primary"

onClick={()=>setRevisionStage("practiceMistakes")}

>

Practice My Mistakes

</button>



<button

className="feedback-button"

onClick={()=>setRevisionStage("examSetup")}

>

New Exam

</button>



<button

className="feedback-button"

onClick={()=>setRevisionStage("setup")}

>

Home

</button>


</div>

)

}



</div>



</div>


</div>


);


}