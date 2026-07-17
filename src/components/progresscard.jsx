export default function ProgressCard({
  subject,
  totalTopics,
  revisionHistory
}) {

  const subjectAttempts =
    revisionHistory.filter(
      item => item.subject === subject
    );


  const completed =
    subjectAttempts.filter(
      item => item.percentage >= 70
    ).length;


  const attempted =
    subjectAttempts.filter(
      item => item.percentage < 70
    ).length;


  const progress =
  totalTopics > 0
    ? Math.round(
        ((completed) / totalTopics) * 100
      )
    : 0;


  return (

   <div className={`mini-progress-card ${subject.toLowerCase()}`}>

      <h2>
        {subject}
      </h2>


    <div className="mini-progress-bar">

       <div
         className="mini-progress-fill"
         style={{
           width: `${progress}%`
         }}
       />

      </div>


    <h3>
  {Math.round(progress)}% Complete
</h3>

<p>
  ✅ {completed} Completed
</p>

<p>
  🟡 {attempted} Attempted
</p>

<p>
  ⚪ {totalTopics - completed - attempted} Remaining
</p>

    </div>

  );
}