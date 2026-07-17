export default function DashboardPage({
  revisionHistory,
  retryTopic,
  setPage
}) {

return (

<div className="dashboard-page">
  <button
  className="back-button"
  onClick={() => setPage("setup")}
>
  ← Back
</button>
<h1>
📊 Revision Dashboard
</h1>


{revisionHistory.map((item,index)=>(

  <div 
    key={index}
    className={`dashboard-card ${item.subject.toLowerCase()}`}
  >

<div className="history-header">

<h2>
{item.subtopic}
</h2>

<span>
{item.subject}
</span>

</div>



<div className="history-score">

<h3>
{item.score} / {item.totalMarks}
</h3>


<div className={`grade-pill ${item.grade}`}>

  {item.grade === "A" && "🥇 "}
  {item.grade === "B" && "🟢 "}
  {item.grade === "C" && "🟡 "}
  {item.grade === "D" && "🟠 "}
  {item.grade === "E" && "🔴 "}

  Grade {item.grade} • {item.percentage}%

</div>
</div>



<div className="history-status">

{
item.status === "completed"
?
"✅ Completed"
:
"🟡 Attempted"
}

</div>



<p className="history-date">

Attempted:
{" "}
{new Date(item.date).toLocaleDateString()}

</p>
<div className="dashboard-actions">

{item.percentage < 50 && (

<div className="recommendation-box">

💡 We suggest reviewing the explanation first to strengthen your understanding.

</div>

)}

<button
onClick={() =>
retryTopic(item,"explanation")
}
>
📖 Review Explanation


<small>
Go back through the notes
</small>

</button>


<button
onClick={() =>
retryTopic(item,"questions")
}
>

<div>
📝 Retake Questions
</div>

<small>
Test yourself again
</small>

</button>


<button
onClick={() =>
retryTopic(item,"videos")
}
>

<div>
🎥 Rewatch Videos
</div>

<small>
Review the videos
</small>

</button>


<button
className="full-retry"
onClick={() =>
retryTopic(item,"full")
}
>

<div>
🔄 Retry Full Topic
</div>

<small>
Start from the beginning
</small>

</button>

</div>

</div>

))}

</div>

);
}