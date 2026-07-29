import { useEffect, useState } from "react";

 export default function Exampage({
  examQuestions,
  setExamQuestions,
  answers,
  setAnswers,
  setRevisionStage,
  examSettings,
  setCompletedExam

}){

    const [loadingExam,setLoadingExam] = useState(true);

const [currentQuestion,setCurrentQuestion] = useState(0);

const [timeLeft,setTimeLeft] = useState(0);





useEffect(()=>{


async function generateExam(){

try{

const response = await fetch(
"https://markd-ltw1.onrender.com/generate-exam",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

subject: examSettings.subject,
level: examSettings.level,
paperType: examSettings.paperType,
topic: examSettings.topic,
subtopics: examSettings.subtopics,
questions: examSettings.questions,
difficulty: examSettings.difficulty

})
});


const data = await response.json();
console.log("API RESPONSE:", data);
console.log(
"QUESTION DATA:",
data.questions
);
console.log("GENERATED EXAM DATA:", data);
console.log(
"NUMBER OF QUESTIONS RECEIVED:",
data.questions?.length
);
console.log(
"EXAM SETTINGS SENT:",
examSettings
);
const questionsWithTopic = data.questions.map(q => ({
  ...q,
  topic: examSettings.topic
}));

setExamQuestions(questionsWithTopic);
setExamQuestions(questionsWithTopic);
console.log(
"QUESTIONS WITH TOPIC:",
questionsWithTopic
);
const questions = data.questions || [];
const totalMarks = questions.reduce(
  (total, q) => total + Number(q.marks),
  0
);

console.log("TOTAL EXAM MARKS:", totalMarks);

setTimeLeft(totalMarks * 77);

console.log("SETTING QUESTIONS:", data.questions);

setLoadingExam(false);

setCurrentQuestion(0);

setAnswers({});



}

catch(error){

console.log(
"Exam generation error",
error
);

}


}


generateExam();


},[]);





// TIMER

useEffect(()=>{

if(loadingExam) return;


if(timeLeft <= 0){

return;

}


const timer=setInterval(()=>{

setTimeLeft(prev=>prev-1);

},1000);


return ()=>clearInterval(timer);


},[timeLeft, loadingExam]);






function formatTime(){


const minutes=Math.floor(timeLeft/60);

const seconds=timeLeft%60;


return `${minutes}:${seconds
.toString()
.padStart(2,"0")}`;


}





function saveAnswer(value){


setAnswers({

...answers,

[currentQuestion]:value

});


}





function submitExam(){


console.log(
"SUBMITTING EXAM",
answers
);


setCompletedExam({

questions: examQuestions,

answers: answers,

subject: examSettings.subject,

level: examSettings.level,

topic: examSettings.topic,

subtopics: examSettings.subtopics

});


setRevisionStage("examResults");


}





if(loadingExam){

return (

<div className="exam-loading">

    <div className="exam-loading-card">

        <span className="exam-loading-badge">
            EXAM MODE
        </span>

        <div className="paper-icon">
            📄
        </div>

        <h1>
            Preparing your exam paper...
        </h1>

        <p className="loading-description">
            Creating an AQA-style paper based on your selected options.
        </p>

        <div className="loading-progress">

            <div
                className="loading-progress-fill"
                style={{
                    width: `${progress}%`
                }}
            />

        </div>

        <div className="loading-percent">
            {progress}%
        </div>

        <div className="loading-checklist">

            <div className={progress >= 20 ? "complete" : ""}>
                {progress >= 20 ? "✓" : "○"} Loading specification
            </div>

            <div className={progress >= 45 ? "complete" : ""}>
                {progress >= 45 ? "✓" : "○"} Selecting questions
            </div>

            <div className={progress >= 75 ? "complete" : ""}>
                {progress >= 75 ? "✓" : "○"} Preparing mark schemes
            </div>

            <div className={progress >= 100 ? "complete" : ""}>
                {progress >= 100 ? "✓" : "○"} Finalising paper
            </div>

        </div>

        <div className="loading-summary">

            <h3>Paper Summary</h3>

            <div className="summary-row">
                <span>Subject</span>
                <strong>{examSubject}</strong>
            </div>

            <div className="summary-row">
                <span>Paper Type</span>
                <strong>{examPaperType}</strong>
            </div>

            {examTopic && (
                <div className="summary-row">
                    <span>Topic</span>
                    <strong>{examTopic}</strong>
                </div>
            )}

            {examSubtopics.length > 0 && (
                <div className="summary-row">
                    <span>Subtopic</span>
                    <strong>{examSubtopics.join(", ")}</strong>
                </div>
            )}

            <div className="summary-row">
                <span>Questions</span>
                <strong>{examQuestionCount}</strong>
            </div>

            <div className="summary-row">
                <span>Difficulty</span>
                <strong>{examDifficulty}</strong>
            </div>

            <div className="summary-row">
                <span>Time Allowed</span>
                <strong>{examTime}</strong>
            </div>

        </div>

    </div>

</div>

)
}

if(!examQuestions || examQuestions.length===0){

console.log(
  "NO QUESTIONS RECEIVED",
  examQuestions
);

return (

  <div className="exam-page">

    <h1>
      No questions loaded
    </h1>

  </div>

);

}




const question =
examQuestions[currentQuestion];



return (

<div className="exam-page">



<div className="exam-header">


<h1>
{examSettings.subject} {examSettings.level} Exam
</h1>


<div className="exam-timer">

⏱ {formatTime()}

</div>


</div>






<div className="exam-question">


<h2>

Question {currentQuestion+1}
/
{examQuestions.length}
({question.marks} marks)

</h2>



<p>

{question.question}

</p>




<textarea

value={
answers[currentQuestion] || ""
}

onChange={(e)=>
saveAnswer(e.target.value)
}


/>



</div>






<div className="exam-navigation">


<button

disabled={currentQuestion===0}

onClick={()=>
setCurrentQuestion(currentQuestion-1)
}

>

← Previous

</button>





<button

onClick={()=>{


if(
currentQuestion===
examQuestions.length-1
){

submitExam();

}

else{

setCurrentQuestion(
currentQuestion+1
);

}


}}

>


{
currentQuestion===
examQuestions.length-1

?

"Submit Exam"

:

"Next →"

}


</button>


</div>




</div>


  );
}