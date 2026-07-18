import { useState } from "react";


export default function ExamPageSetup({
  subject,
  setRevisionStage
}) {


const [paperType,setPaperType] = useState("Full Subject");

const [questions,setQuestions] = useState(5);


const marksPerQuestion = 4;

const totalMarks = questions * marksPerQuestion;


const examTime = questions * 2;



return (

<div className="exam-setup-page">


<h1>
📝 Exam Paper Mode
</h1>


<p>
AI generated A-Level exam paper
</p>



<h2>
Subject
</h2>


<select>

<option>
{subject}
</option>

</select>



<h2>
Paper Type
</h2>


<div className="exam-options">


<button
className={
paperType==="Full Subject"
?"active"
:""
}

onClick={()=>setPaperType("Full Subject")}
>

Full Subject

</button>



<button

className={
paperType==="By Topic"
?"active"
:""
}

onClick={()=>setPaperType("By Topic")}

>

By Topic

</button>



<button

className={
paperType==="Custom"
?"active"
:""
}

onClick={()=>setPaperType("Custom")}

>

Custom

</button>


</div>



<h2>
Number of Questions
</h2>


<div className="question-options">


{[5,10,15,20].map(num=>(


<button

key={num}

className={
questions===num
?"active"
:""
}

onClick={()=>setQuestions(num)}

>

{num}

</button>


))}


</div>



<h2>
Exam Details
</h2>


<div className="exam-summary">


<p>
Total Marks:
<b>
 {totalMarks}
</b>
</p>


<p>
Time:
<b>
 {examTime} minutes
</b>
</p>


</div>



<button

className="start-button"

onClick={()=>{

setRevisionStage("exam");

}}

>

Start Exam →

</button>



</div>

);


}