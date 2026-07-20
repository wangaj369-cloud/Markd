import { useState } from "react";

 export default function ExamPageSetup({

subjectTopics,

examSubject,
setExamSubject,

examLevel,
setExamLevel,

examPaperType,
setExamPaperType,

examTopic,
setExamTopic,

examQuestionCount,
setExamQuestionCount,

examTotalMarks,
setExamTotalMarks,

setRevisionStage

}){





const estimatedTime =
Math.ceil(examTotalMarks * 1.8);



return (

<div className="exam-setup-page">


<h1>
📝 Exam Paper Mode
</h1>


<p>
AI generated A-Level exam paper
</p>



<label>Subject</label>

<select
  value={examSubject}
  onChange={(e)=>setExamSubject(e.target.value)}
>

  <option>Biology</option>

  <option>Chemistry</option>

  <option>Psychology</option>

</select>

<label>examLevel</label>

<div className="exam-level-buttons">

<button

className={
examLevel==="AS"
? "active"
: ""
}

onClick={()=>setExamLevel("AS")}

>

AS

</button>


<button

className={
examLevel==="A Level"
? "active"
: ""
}

onClick={()=>setExamLevel("A Level")}

>

A Level

</button>

</div>

<label>Paper Type</label>

<div className="paper-type-buttons">

<button

className={
examPaperType==="Full Subject"
? "active"
: ""
}

onClick={()=>{

setExamPaperType("Full Subject");

setExamTopic("");

}}

>

Full Subject

</button>


<button

className={
examPaperType==="By Topic"
? "active"
: ""
}

onClick={()=>setExamPaperType("By Topic")}

>

By Topic

</button>


<button

className={
examPaperType==="Custom"
? "active"
: ""
}

onClick={()=>setExamPaperType("Custom")}

>

Custom

</button>

</div>






<h2>
Number of examquestions
</h2>


<div className="examquestion-options">


{
[5,10,15,20].map(num=>(


<button

key={num}

className={
examQuestionCount===num
?"active"
:""
}

onClick={()=>{
  setExamQuestionCount(num);
}}

>

{num}

</button>


))
}


<button

className={
examQuestionCount==="custom"
?"active"
:""
}

onClick={()=>setExamQuestionCount("custom")}

>
Custom
</button>


</div>



{
examQuestionCount==="custom" && (

<input

type="number"

placeholder="Number of questions"

value={examQuestionCount}

onChange={(e)=>
setExamQuestionCount(Number(e.target.value))
}

/>

)

}




<h2>
Total Marks
</h2>


<input

type="number"

value={examTotalMarks}

onChange={(e)=>
setExamTotalMarks(Number(e.target.value))
}

/>




<div className="exam-summary">


<p>
Questions:
<b>
{examQuestionCount}
</b>
</p>


<p>
Marks:
<b>
{examTotalMarks}
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