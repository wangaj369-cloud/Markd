import { useState } from "react";

export default function PracticeMistakes({

examResults,
setRevisionStage,

revisionQueue,
setRevisionQueue,

currentRevisionIndex,
setCurrentRevisionIndex,

generateQuestions,
examSubject,
examTopic,
findTopicFromSubtopic


}){


const [selectedTopics,setSelectedTopics] = useState([]);
function getMistakeClass(percentage){

if(percentage >= 60){

return "okay";

}

if(percentage >= 30){

return "warning";

}

return "weak";

}
if(!examResults || !examResults.weakTopics){

return(
  

<div>

<h1>
No weak topics found
</h1>

</div>

);

}


const weakTopics = examResults.weakTopics;
const groupedWeakTopics = Object.values(

weakTopics.reduce((groups,item)=>{

const key = item.subtopic;


if(!groups[key]){

groups[key] = {

subtopic:key,

questions:[],

totalMark:0,

totalMaxMark:0

};

}


groups[key].questions.push(item);


groups[key].totalMark += item.mark;

groups[key].totalMaxMark += item.maxMark;


return groups;


},{})
).map(item=>({

...item,

percentage: Math.round(
(item.totalMark / item.totalMaxMark) * 100
)

}));
const selectedTopicData = weakTopics.map(item => ({

  subject: examResults.subject,

  topic: findTopicFromSubtopic(
    examResults.subject,
    item.subtopic
  ),

  subtopic: item.subtopic,

  mark: item.mark,

  maxMark: item.maxMark,

  percentage: item.percentage

}));
console.log(
"SELECTED REVISION QUEUE:",
selectedTopicData
);

function toggleTopic(topic){

if(selectedTopics.includes(topic)){

setSelectedTopics(
selectedTopics.filter(t=>t!==topic)
);

}

else{

setSelectedTopics([
...selectedTopics,
topic
]);

}

}



return(

<div className="practice-mistakes-page">


<div className="practice-mistakes-shell">


<h1>
 Practice My Mistakes
</h1>

<h2>
Your weak areas
</h2>


<p>
These are topics you scored low on
</p>


{
groupedWeakTopics.map((item,index)=>(
<div

key={index}

className={`mistake-card ${getMistakeClass(item.percentage)} ${
selectedTopics.includes(item.subtopic)
? "selected"
: ""
}`}

>


<label>


<input

type="checkbox"

checked={
selectedTopics.includes(item.subtopic)
}

onChange={()=>
toggleTopic(item.subtopic)
}

/>



<div className="mistake-info">


<h3>
{item.subtopic}
</h3>


<p>
Questions:
{item.questions.length}
</p>


<p>
Average score:
<strong>
{item.percentage}%
</strong>
</p>


</div>


</label>


</div>


))

}


<br/>


<button

disabled={selectedTopics.length===0}

onClick={() => {

const queue = groupedWeakTopics
.filter(item =>
selectedTopics.includes(item.subtopic)
)
.map(item=>({

subject:examResults.subject,

topic:findTopicFromSubtopic(
examResults.subject,
item.subtopic
),

subtopic:item.subtopic

}));


console.log(
"FINAL REVISION QUEUE:",
queue
);


setRevisionQueue(queue);

setCurrentRevisionIndex(0);


const firstTopic = queue[0];


if(!firstTopic){

return;

}


generateQuestions({

subject: firstTopic.subject,

topic: firstTopic.topic,

subtopic: firstTopic.subtopic

});


setRevisionStage("explanation");


}}

>

Revise Selected Topics

</button>





</div>

</div>

);


}