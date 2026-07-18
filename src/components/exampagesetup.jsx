import { useState } from "react";


export default function ExamPageSetup({
  setRevisionStage,
}) {


const [subject,setSubject] = useState("Biology");

const [level,setLevel] = useState("A Level");

const [paperType,setPaperType] = useState("Full Subject");

const [topic,setTopic] = useState("");

const [questionNumber,setQuestionNumber] = useState(5);

const [customQuestions,setCustomQuestions] = useState("");

const [totalMarks,setTotalMarks] = useState(50);



const questions =
questionNumber === "custom"
? Number(customQuestions)
: questionNumber;



const estimatedTime =
Math.ceil(totalMarks * 1.8);



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


<select
value={subject}
onChange={(e)=>setSubject(e.target.value)}
>

<option>
Biology
</option>

<option>
Chemistry
</option>

<option>
Psychology
</option>

</select>




<h2>
Course Level
</h2>


<div className="exam-options">


<button
className={level==="AS"?"active":""}
onClick={()=>setLevel("AS")}
>
AS
</button>


<button
className={level==="A Level"?"active":""}
onClick={()=>setLevel("A Level")}
>
A Level
</button>


</div>





<h2>
Paper Type
</h2>


<div className="exam-options">


{
[
"Full Subject",
"By Topic",
"Custom"
].map(type=>(


<button

key={type}

className={
paperType===type
?"active"
:""
}

onClick={()=>{
setPaperType(type)
}}

>

{type}

</button>


))
}


</div>



{
paperType==="By Topic" && (

<select
value={topic}
onChange={(e)=>setTopic(e.target.value)}
>

<option>
Select Topic
</option>

<option>
Cell Biology
</option>

<option>
Genetics
</option>

<option>
Energy Transfers
</option>


</select>


)

}





<h2>
Number of Questions
</h2>


<div className="question-options">


{
[5,10,15,20].map(num=>(


<button

key={num}

className={
questions===num
?"active"
:""
}

onClick={()=>setQuestionNumber(num)}

>

{num}

</button>


))
}


<button

className={
questionNumber==="custom"
?"active"
:""
}

onClick={()=>setQuestionNumber("custom")}

>
Custom
</button>


</div>



{
questionNumber==="custom" && (

<input

type="number"

placeholder="Number of questions"

value={customQuestions}

onChange={(e)=>
setCustomQuestions(e.target.value)
}

/>

)

}




<h2>
Total Marks
</h2>


<input

type="number"

value={totalMarks}

onChange={(e)=>
setTotalMarks(Number(e.target.value))
}

/>




<div className="exam-summary">


<p>
Questions:
<b>
{questions}
</b>
</p>


<p>
Marks:
<b>
{totalMarks}
</b>
</p>


<p>
Time:
<b>
{estimatedTime} minutes
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