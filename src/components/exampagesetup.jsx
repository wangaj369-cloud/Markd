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
examSubtopics,
setExamSubtopics,

examQuestionCount,
setExamQuestionCount,

examTotalMarks,
setExamTotalMarks,

setRevisionStage,

customQuestionCount,
setCustomQuestionCount,

customMarks,
setCustomMarks,

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
examPaperType === "By Topic"
? "active"
: ""
}

onClick={()=>setExamPaperType("By Topic")}

>

By Topic

</button>

<button

className={
examPaperType==="By Subtopic"
? "active"
: ""
}

onClick={()=>setExamPaperType("By Subtopic")}

>

By Subtopic

</button>



</div>

{examPaperType === "By Topic" && (

<div className="exam-topic-select">

<label>
Topic
</label>


<select

value={examTopic}

onChange={(e)=>
setExamTopic(e.target.value)
}

>

<option value="">
Select Topic
</option>


{Object.keys(subjectTopics[examSubject] || {}).map((topic)=>(
<option
key={topic}
value={topic}
>
{topic}
</option>
))}


</select>


</div>

)}
{examPaperType === "By Subtopic" && examTopic && (

<div className="exam-subtopic-select">

<label>
Subtopics
</label>


<select

multiple

value={examSubtopics}

onChange={(e)=>{

const selected =
Array.from(
e.target.selectedOptions,
(option)=>option.value
);


setExamSubtopics(selected);

}}

>


{
subjectTopics[examSubject][examTopic]
.map((subtopic)=>(

<option

key={subtopic}

value={subtopic}

>

{subtopic}

</option>

))

}


</select>


</div>

)}





<label>
Number of Questions
</label>


<select

value={examQuestionCount}

onChange={(e)=>{

const value = e.target.value;


if(value === "custom"){

setExamQuestionCount("custom");

}

else{

setExamQuestionCount(
Number(value)
);

}

}}

>

<option value={5}>
5 Questions
</option>

<option value={10}>
10 Questions
</option>

<option value={15}>
15 Questions
</option>

<option value={20}>
20 Questions
</option>

<option value="custom">
Custom
</option>


</select>



{examQuestionCount === "custom" && (

<input

type="number"

min="1"

placeholder="Enter number of questions"

value={customQuestionCount}

onChange={(e)=>{

setCustomQuestionCount(
Number(e.target.value)
);

}}

 />

)}
<label>
Total Marks
</label>


<select

value={examTotalMarks}

onChange={(e)=>{

const value = e.target.value;


if(value === "custom"){

setExamTotalMarks("custom");

}

else{

setExamTotalMarks(
Number(value)
);

}

}}

>


<option value={50}>
50 marks
</option>


<option value={80}>
80 marks
</option>


<option value={100}>
100 marks
</option>


<option value="custom">
Custom
</option>


</select>



{examTotalMarks === "custom" && (

<input

type="number"

min="1"

placeholder="Enter total marks"

value={customMarks}

onChange={(e)=>{

setCustomMarks(
Number(e.target.value)
);


}}

 />

)}

<div className="exam-summary">


<p>
Questions:
<b>
{
examQuestionCount === "custom"
?
customQuestionCount
:
examQuestionCount
}
</b>
</p>


Marks:{
examTotalMarks === "custom"
?
customMarks
:
examTotalMarks
}


Time:{
(
examTotalMarks === "custom"
?
customMarks
:
examTotalMarks
) * 1.5
}
 minutes

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
