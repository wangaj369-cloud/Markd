import { useEffect, useState } from "react";

export default function Exampage({

    examQuestions,
    setExamQuestions,

    answers,
    setAnswers,

    setRevisionStage,

    examSettings,

    setCompletedExam

}) {


const [loadingExam, setLoadingExam] = useState(true);

const [currentQuestion, setCurrentQuestion] = useState(0);

const [timeLeft, setTimeLeft] = useState(0);


// NEW LOADING SYSTEM

const [progress, setProgress] = useState(0);





useEffect(()=>{


let progressTimer;



async function generateExam(){


try{


// Fake loading progression

progressTimer = setInterval(()=>{


setProgress(prev=>{


if(prev < 90){

return prev + 1;

}


return prev;


});


},120);




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


}

);




const data = await response.json();

console.log("GENERATED EXAM:", data);





const questions = data.questions || [];



setExamQuestions(

questions.map(q=>({

...q,

topic:examSettings.topic

}))

);





const totalMarks = questions.reduce(

(total,q)=>total + Number(q.marks || 0),

0

);





setTimeLeft(totalMarks * 77);





// Finish loading animation

clearInterval(progressTimer);


setProgress(100);





setTimeout(()=>{


setLoadingExam(false);

setCurrentQuestion(0);

setAnswers({});


},800);





}



catch(error){


console.log(

"EXAM GENERATION ERROR",

error

);


clearInterval(progressTimer);


}



}




generateExam();



return ()=>{


clearInterval(progressTimer);


};



},[]);
// ==========================
// TIMER
// ==========================


useEffect(()=>{


if(loadingExam) return;


if(timeLeft <= 0) return;




const timer = setInterval(()=>{


setTimeLeft(prev=>prev - 1);


},1000);




return ()=>clearInterval(timer);



},[timeLeft, loadingExam]);






// ==========================
// FORMAT TIMER
// ==========================


function formatTime(){


const minutes = Math.floor(timeLeft / 60);


const seconds = timeLeft % 60;



return `${minutes}:${seconds
.toString()
.padStart(2,"0")}`;


}






// ==========================
// SAVE ANSWERS
// ==========================


function saveAnswer(value){


setAnswers({

...answers,

[currentQuestion]:value

});


}







// ==========================
// SUBMIT EXAM
// ==========================


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


subtopics: examSettings.subtopics,


difficulty: examSettings.difficulty



});





setRevisionStage("examResults");



}
if(loadingExam){

return (

<div className="exam-loading-page">


<div className="exam-loading-card">


<span className="exam-loading-badge">
EXAM MODE
</span>




<div className="exam-paper-animation">

📄

</div>





<h1>
Preparing your exam paper...
</h1>




<p className="exam-loading-text">

AI is creating your AQA-style paper based on your selected options.

</p>





<div className="loading-progress-container">


<div

className="loading-progress-bar"

>

<div

className="loading-progress-fill"

style={{

width:`${progress}%`

}}

/>


</div>



<div className="loading-percent">

{progress}%

</div>


</div>








<div className="loading-checklist">


<div className={progress >= 20 ? "checked" : ""}>

{progress >= 20 ? "✓" : "○"}

&nbsp; Loading specification

</div>




<div className={progress >= 45 ? "checked" : ""}>

{progress >= 45 ? "✓" : "○"}

&nbsp; Selecting questions

</div>




<div className={progress >= 70 ? "checked" : ""}>

{progress >= 70 ? "✓" : "○"}

&nbsp; Creating mark schemes

</div>




<div className={progress >= 100 ? "checked" : ""}>

{progress >= 100 ? "✓" : "○"}

&nbsp; Finalising paper

</div>



</div>








<div className="exam-summary-card">


<h3>
Paper Summary
</h3>




<div className="summary-row">

<span>
Subject
</span>

<strong>
{examSettings.subject}
</strong>

</div>






<div className="summary-row">

<span>
Paper Type
</span>

<strong>
{examSettings.paperType}
</strong>

</div>






{examSettings.topic && (

<div className="summary-row">

<span>
Topic
</span>

<strong>
{examSettings.topic}
</strong>

</div>

)}







{examSettings.subtopics?.length > 0 && (

<div className="summary-row">

<span>
Subtopics
</span>


<strong>

{examSettings.subtopics.join(", ")}

</strong>


</div>

)}






<div className="summary-row">

<span>
Questions
</span>


<strong>

{examSettings.questions}

</strong>


</div>







<div className="summary-row">

<span>
Difficulty
</span>


<strong>

{examSettings.difficulty}

</strong>


</div>






</div>






</div>


</div>


);

}if(!examQuestions || examQuestions.length === 0){

return (

<div className="exam-page">

<h1>
No questions loaded
</h1>

<p>
Something went wrong generating your exam.
</p>

</div>

);

}






const question = examQuestions[currentQuestion];






return (

<div className="exam-paper-page">



<div className="exam-paper-header">


<div>

<span className="exam-paper-badge">
AQA PRACTICE PAPER
</span>


<h1>

{examSettings.subject} {examSettings.level}

</h1>


</div>





<div className="exam-timer">

⏱ {formatTime()}

</div>



</div>






<div className="exam-paper-info">

<span>
Question {currentQuestion + 1} / {examQuestions.length}
</span>

</div>








<div className="exam-question-card">



<h2>

Question {currentQuestion + 1}

</h2>




<p className="question-text">

{question.question}

<span className="question-marks">
 ({question.marks} marks)
</span>

</p>





<textarea


value={

answers[currentQuestion] || ""

}


onChange={(e)=>

saveAnswer(e.target.value)

}


placeholder="Write your answer here..."



/>





</div>









<div className="exam-navigation">





<button


disabled={currentQuestion === 0}


onClick={()=>


setCurrentQuestion(

currentQuestion - 1

)


}



>


← Previous


</button>







<button


onClick={()=>{


if(

currentQuestion === examQuestions.length - 1

){


submitExam();


}

else{


setCurrentQuestion(

currentQuestion + 1

);


}



}}



>


{


currentQuestion === examQuestions.length - 1

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