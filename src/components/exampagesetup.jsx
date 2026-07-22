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

examDifficulty,
setExamDifficulty,

customQuestionCount,
setCustomQuestionCount,

setRevisionStage

}) {

const [showCustomQuestionsInput, setShowCustomQuestionsInput] = useState(false);
const [showTopicDropdown, setShowTopicDropdown] = useState(false);
const [showSubtopicDropdown, setShowSubtopicDropdown] = useState(false);
const [startingExam, setStartingExam] = useState(false);


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

onChange={(e)=>{

setExamSubject(e.target.value);

setExamTopic("");

setExamSubtopics([]);

}}

>

  <option>Biology</option>

  <option>Chemistry</option>

  <option>Psychology</option>

</select>




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

onClick={()=>{setExamPaperType("By Topic"); setShowTopicDropdown(true);}}

>

By Topic

</button>

<button

className={
examPaperType==="By Subtopic"
? "active"
: ""
}

onClick={()=>{setExamPaperType("By Subtopic"); setShowTopicDropdown(true);}}

>

By Subtopic

</button>



</div>

{showTopicDropdown && (

<div className="exam-topic-select">

<label>
Topic
</label>


<select

value={examTopic}

onChange={(e)=>{
setExamTopic(e.target.value);
if(e.target.value && examPaperType === "By Subtopic") setShowSubtopicDropdown(true);
if(e.target.value && examPaperType === "By Topic") setShowTopicDropdown(false);
}}

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
{showSubtopicDropdown && (

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

onKeyDown={(e)=>{
if(e.key === "Enter") setShowSubtopicDropdown(false);
}}


>

{
(subjectTopics[examSubject]?.[examTopic] || [])
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


<button
onClick={()=>setShowSubtopicDropdown(false)}
>
Done
</button>


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
setShowCustomQuestionsInput(true);

}

else{

setExamQuestionCount(
Number(value)
);
setShowCustomQuestionsInput(false);

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



{showCustomQuestionsInput && (

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

onKeyDown={(e)=>{
if(e.key === "Enter") setShowCustomQuestionsInput(false);
}}

 />

)}

 <label>Difficulty</label>

<select
value={examDifficulty}
onChange={(e)=>setExamDifficulty(e.target.value)}
>

<option>Mixed</option>
<option>Easy</option>
<option>Medium</option>
<option>Hard</option>

</select>

<div className="exam-preview">

<h3>
Exam Preview
</h3>


<p>
<strong>Subject:</strong> {examSubject}
</p>


<p>
<strong>Paper Type:</strong> {examPaperType}
</p>



{examTopic && (

<p>
<strong>Topic:</strong> {examTopic}
</p>

)}



{examSubtopics?.length > 0 && (

<div>

<strong>
Subtopics:
</strong>


<ul>

{
examSubtopics.map((subtopic)=>(

<li key={subtopic}>
{subtopic}
</li>

))

}

</ul>

</div>

)}



<p>
<strong>Questions:</strong> {examQuestionCount === "custom" ? customQuestionCount : examQuestionCount}
</p>






</div>



<button

className="start-button"

disabled={startingExam}

onClick={() => {

    setStartingExam(true);

    setRevisionStage("exam");

}}

>

{startingExam ? "Generating Exam..." : "Start Exam →"}

</button>



</div>

);


}

