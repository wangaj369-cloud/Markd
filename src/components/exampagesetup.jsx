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
const [setupError, setSetupError] = useState("");


return (

<div className="exam-mode">

  <div className="exam-shell">

    <div className="exam-header">

      <span className="exam-badge">
        EXAM MODE
      </span>

      <h1>AQA Practice Paper</h1>

      <p>
        Personalise Your Exam Paper
      </p>

    </div>

<label className="exam-label">
Subject
</label>

<select className="exam-select"

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




<label className="exam-label">
Paper Type
</label>

<div className="paper-type-buttons">

<button
className={
examPaperType==="Full Subject"
? "paper-button active"
: "paper-button"
}

onClick={() => {

    setExamPaperType("Full Subject");

    setExamTopic("");
    setExamSubtopics([]);

    setShowTopicDropdown(false);
    setShowSubtopicDropdown(false);

}}

>

Full Subject

</button>


<button
className={
examPaperType==="Topic"
? "paper-button active"
: "paper-button"
}

onClick={() => {

    setExamPaperType("Topic");

    setExamTopic("");
    setExamSubtopics([]);

    setShowSubtopicDropdown(false);
    setShowTopicDropdown(true);

}}
>

Topic

</button>

<button
className={
examPaperType==="Subtopic"
? "paper-button active"
: "paper-button"
}

onClick={() => {

    setExamPaperType("Subtopic");

    setExamTopic("");
    setExamSubtopics([]);

    setShowTopicDropdown(true);
    setShowSubtopicDropdown(false);

}}

>

Subtopic

</button>



</div>

{showTopicDropdown && (

<div className="exam-topic-select">

<label className="exam-label">
Topic
</label>



<select className="exam-select"

value={examTopic}

onChange={(e)=>{

const selectedTopic = e.target.value;

setExamTopic(selectedTopic);


// Load subtopics for this topic
const foundSubtopics =
subjectTopics[examSubject][selectedTopic];


setExamSubtopics(
foundSubtopics || []
);
console.log(
"CURRENT SUBTOPICS:",
examSubtopics
);

if(selectedTopic && examPaperType === "Subtopic"){
  setShowSubtopicDropdown(true);
}


if(selectedTopic && examPaperType === "Topic"){
  setShowTopicDropdown(false);
}

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

<label className="exam-label">
Subtopics
</label>

<select
className="exam-select"

value={examSubtopics[0] || ""}

onChange={(e)=>{

setExamSubtopics(
e.target.value ? [e.target.value] : []
);

setShowSubtopicDropdown(false);

}}

>

<option value="">
Select Subtopic
</option>

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





</div>

)}




<label className="exam-label">
Number of Questions
</label>


<select className="exam-select"

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

<label className="exam-label">
Difficulty
</label>

<select className="exam-select"
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

<p>
<strong>Estimated Time:</strong> {(() => {
  const count = examQuestionCount === "custom" ? customQuestionCount : examQuestionCount;
  const avgMarksPerQuestion = {
    'Easy': 2,
    'Medium': 4,
    'Hard': 13,
    'Mixed': 7
  }[examDifficulty] || 7;
  const totalMarks = count * avgMarksPerQuestion;
  const totalSeconds = totalMarks * 77;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
})()}
</p>






</div>



<button

className="start-button"

disabled={startingExam}

onClick={() => {


if(examPaperType === "Topic" && !examTopic){

    setSetupError(
        "Please select a topic to continue."
    );

    return;

}



if(examPaperType === "Subtopic" && examSubtopics.length === 0){

    setSetupError(
        "Please select a subtopic to continue."
    );

    return;

}



setSetupError("");

setStartingExam(true);

setRevisionStage("exam");


}}
>
{setupError && (

<div className="setup-error">

{setupError}

</div>

)}
{startingExam ? "Generating Exam..." : "Start Exam →"}

</button>

</div>
</div>

);

}