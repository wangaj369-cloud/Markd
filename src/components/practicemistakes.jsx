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
examTopic

}){


const [selectedTopics,setSelectedTopics] = useState([]);


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

<div>


<h1>
🎯 Practice My Mistakes
</h1>


<h2>
Your weak areas
</h2>


<p>
These are topics where you scored below 60%.
</p>



{
weakTopics.map((item,index)=>(

<div key={index}>


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


<strong>
{item.subtopic}
</strong>


<br/>

Score:

{item.mark}/{item.maxMark}

(

{item.percentage}%

)


</label>


</div>


))

}



<br/>


<button

disabled={selectedTopics.length===0}

onClick={() => {

setRevisionQueue(
selectedTopics.map(t => ({
  subject: examSubject, 
  topic: t.topic,
  subtopic: t.subtopic
}))
);

setCurrentRevisionIndex(0);
const first = selectedTopics[0];

generateQuestions({
  subject: examSubject,
  topic: first.topic,
  subtopic: first.subtopic
});

setRevisionStage("explanation");
generateQuestions({

subject: examSubject,

topic: examTopic,

subtopic: selectedTopics[0]

});

}}
>

Revise Selected Topics

</button>


<button

onClick={()=>{

console.log(
"REVISING ALL:",
weakTopics.map(t=>t.subtopic)
);

}}

>

Revise All

</button>



</div>

);


}