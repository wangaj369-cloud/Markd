import { useEffect, useState } from "react";


export default function ExamPage({
  subject,
  level,
  totalMarks,
  questions,
  setRevisionStage
}) {


const [currentQuestion,setCurrentQuestion] = useState(0);


const [timeLeft,setTimeLeft] = useState(0);
useEffect(()=>{

setTimeLeft(totalMarks * 90);

},[totalMarks]);

const [answers,setAnswers] = useState({});


const [examQuestions,setExamQuestions] = useState([]);



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

subject,
level,
questions,
totalMarks

})

});


const data = await response.json();

console.log("GENERATED EXAM DATA:", data);

setExamQuestions(data.questions || []);



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


if(timeLeft<=0){

submitExam();

return;

}


const timer=setInterval(()=>{

setTimeLeft(prev=>prev-1);

},1000);



return ()=>clearInterval(timer);


},[timeLeft]);






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


setRevisionStage("examResults");


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
{subject} {level} Exam
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