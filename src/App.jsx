import "./App.css";
import { supabase } from "./supabase";
import LoginPage from "./components/LoginPage";
import LandingPage from "./components/Landingpage";
import { useState, useEffect } from "react";
import SetupPage from "./components/setuppage";
import DashboardPage from "./components/dashboardpage";
import LoadingScreen from "./components/loadingscreen";
import ExplanationPage from "./components/Explanationpage";
import { subjectTopics } from "./components/subject.js";
import QuestionMode from "./components/questionmode";
import SummaryPage from "./components/summarypage";
import LearnMode from "./components/learnmode";
import ExamPageSetup from "./components/exampagesetup";
import ExamPage from "./components/exampage";
import ExamResults from "./components/examresults";
import ExamFeedback from "./components/examfeedback";
import PracticeMistakes from "./components/practicemistakes";
import ExamResultsFinal from "./components/ExamResultsFinal"; 






export default function App() {
  const [subject, setSubject] = useState("Biology");
const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);

  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [resources, setResources] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [revisionStage, setRevisionStage] = useState("setup");
// ======================
// EXAM MODE STATES
// ======================

const [examSubject, setExamSubject] = useState("Biology");

const [examLevel,setExamLevel] = useState("A Level");

const [examPaperType, setExamPaperType] = useState("Full Subject");

const [examTopic, setExamTopic] = useState("");
const [examSubtopics,setExamSubtopics] = useState([]);

const [examQuestionCount, setExamQuestionCount] = useState(5);

const [examQuestions, setExamQuestions] = useState([]);
const [examAnswers, setExamAnswers] = useState({});
const [completedExam,setCompletedExam] = useState(null);
const [examMark,setExamMark] = useState(null);
const [customQuestionCount,setCustomQuestionCount] = useState("");
const [examDifficulty, setExamDifficulty] = useState("Mixed");
const [examResults,setExamResults] = useState(null);
const [revisionQueue, setRevisionQueue] = useState([]);
const [currentRevisionIndex, setCurrentRevisionIndex] = useState(0);
const [examHistory, setExamHistory] = useState([]);
const handleLogin = (user) => {
  setUser(user);
  setShowLandingPage(false);
  setRevisionStage("setup");
};
const examSettings = {

  subject: examSubject,

  level: examLevel,

  paperType: examPaperType,

  topic: examTopic,

  subtopics:
examPaperType === "Full Subject"
?
Object.values(subjectTopics[examSubject])
.flat()
:
examSubtopics,
  questions:
    examQuestionCount === "custom"
      ? Number(customQuestionCount)
      : Number(examQuestionCount),

  difficulty: examDifficulty,
  
};


 const [revisionHistory, setRevisionHistory] = useState(() => {
  return JSON.parse(
    localStorage.getItem("revisionHistory")
  ) || [];
});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loginMode, setLoginMode] = useState("login");
  const [showLandingPage, setShowLandingPage] = useState(true);
  async function handleCreateAccount() {
  await supabase.auth.signOut();
  setUser(null);
  setLoginMode("signup");
  setRevisionStage("login");
}
useEffect(() => {
  async function loadRevisionHistory() {
    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("revision_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load revision history:", error);
      return;
    }

    console.log("Loaded revision history from Supabase:", data);

    setRevisionHistory(
  data.map(item => ({
    id: item.id,
    subject: item.subject,
    topic: item.topic,
    subtopic: item.subtopic,
    score: item.score,
    totalMarks: item.max_score,
    percentage:
      item.max_score > 0
        ? Math.round((item.score / item.max_score) * 100)
        : 0,
    createdAt: item.created_at
  }))
);
  }

  loadRevisionHistory();
}, [user]);

useEffect(() => {
  async function loadExamHistory() {
    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("exam_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load exam history:", error);
      return;
    }

    console.log("Loaded exam history from Supabase:", data);

    setExamHistory(data || []);
  }

  loadExamHistory();
}, [user]);

useEffect(() => {

  async function getUser() {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    setUser(user);
    setAuthLoading(false);

  }

  getUser();

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {

      setUser(session?.user || null);

    }
  );

  return () => {
    subscription.unsubscribe();
  };

}, []);

if (authLoading) {
  return <LoadingScreen />;
}

if (!user) {

  if (showLandingPage) {
    return (
      <LandingPage
        onGetStarted={() => {
          setShowLandingPage(false);
          setLoginMode("signup");
        }}
        onLogin={() => {
          setShowLandingPage(false);
          setLoginMode("login");
        }}
        onGuest={() => {
          setShowLandingPage(false);
          setLoginMode("login");
        }}
      />
    );
  }

  return (
    <LoginPage
      onLogin={handleLogin}
      initialSignUp={loginMode === "signup"}
    />
  );
}
async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout failed:", error);
    return;
  }

  setUser(null);
}

 async function generateExplanation(customData = null) {

  const currentSubject = customData?.subject || subject;
  const currentTopic = customData?.topic || topic;
  const currentSubtopic = customData?.subtopic || subtopic;

  if (!currentTopic || !currentSubtopic) {
    console.log("Missing explanation data:", {
      currentSubject,
      currentTopic,
      currentSubtopic
    });
    return;
  }

  try {

    const explanationRes = await fetch("https://markd-ltw1.onrender.com/generate-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: currentSubject,
          topic: currentTopic,
          subtopic: currentSubtopic,
        }),
      }
    );


    const explanationData = await explanationRes.json();

    console.log("Explanation response:", explanationData);


    setExplanation(explanationData.explanation);

    return explanationData.explanation;


  } catch(error) {
    console.error("Explanation error:", error);
  }
}
function retakeExam(exam) {
  setExamSubject(exam.subject);
  setExamLevel(exam.level);
  setExamPaperType(exam.paper_type);
  setExamTopic(exam.topic || "");
  setExamDifficulty(exam.difficulty || "Mixed");

  setExamSubtopics(
    exam.exam_data?.completedExam?.subtopics || []
  );

  setRevisionStage("examSetup");
}

function findTopicFromSubtopic(subject, subtopic) {

  const topics = subjectTopics[subject];

  for (const topic in topics) {

    if (topics[topic].includes(subtopic)) {
      return topic;
    }

  }

  return "";
}
async function generateQuestions(customData = null) {
  console.log("GENERATE QUESTIONS STARTED");
  const currentSubject = customData?.subject || subject;
  const currentTopic = customData?.topic || topic;
  const currentSubtopic = customData?.subtopic || subtopic;
    console.log("CLICKED GENERATE QUESTIONS");
    console.log("Current state:", {
  subject: currentSubject,
  topic: currentTopic,
  subtopic: currentSubtopic,
});
   if (!currentTopic || !currentSubtopic) {
  console.log("Missing topic or subtopic, returning");
  return;
}

    setLoading(true);
    console.log("About to send request");

    const generateResources = async () => {
      console.log("Calling generate resources");
      console.log("Sending:", {
  subject: currentSubject,
  topic: currentTopic,
  subtopic: currentSubtopic,
});
      try {
        const res = await fetch("https://markd-ltw1.onrender.com/generate-resources", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
         body: JSON.stringify({
 subject: customData?.subject || subject,
 topic: customData?.topic || topic,
 subtopic: customData?.subtopic || subtopic,
}),
        });

        console.log("Resources response status:", res.status);
        const data = await res.json();
        console.log("Resources response:", data);
        setResources(data?.videos || []);
      } catch (error) {
        console.error("Error generating resources:", error);
      }
    };

    try {
      console.log("BEFORE RESOURCES");
      await generateResources();
      console.log("AFTER RESOURCES");
     const explanationResult = await generateExplanation({
  subject: currentSubject,
  topic: currentTopic,
  subtopic: currentSubtopic
});

console.log("Generated explanation:", explanationResult);
      const questionsRes = await fetch("https://markd-ltw1.onrender.com/generate-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  subject: currentSubject,
  topic: currentTopic,
  subtopic: currentSubtopic,
}),

        }
      );

      console.log("Questions response status:", questionsRes.status);
      const data = await questionsRes.json();
      console.log("Questions response:", data);

     setQuestions(data.questions);

console.log(data.questions);

setLoading(false);

return {
  questions: data.questions,
};

    } catch (error) {
      console.error("Error in generateQuestions:", error);
    }
setLoading(false);
  }
async function markAnswer(question, index, diagram, selfScore = null) {
  if (selfScore !== null) {
    setResults({
      ...results,
      [index]: {
        ...results[index],
        score: selfScore,
        strengths: "Self-assessed mark",
        improvements: "Compare your answer with the model answer and mark scheme",
        automaticMarkingFailed: true // Keep true so self-assessment buttons remain visible
      }
    });
    return;
  }

  // For diagram questions, skip API call and show self-assessment immediately
  if (question.requiresDiagram) {
    setResults({
      ...results,
      [index]: {
        automaticMarkingFailed: true,
        score: null,
        strengths: "",
        improvements: "Automatic marking is unavailable for diagram questions. Compare your answer with the model answer and mark scheme, then award yourself marks.",
        modelAnswer: question.modelAnswer,
        markScheme: question.markScheme
      }
    });
    return;
  }

  try {
    const res = await fetch("https://markd-ltw1.onrender.com/mark-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    body: JSON.stringify({

  question: question.question,

  marks: question.marks,

  answer: answers[index],

  markScheme: question.markScheme,

  requiresDiagram: question.requiresDiagram,

  modelAnswer: question.modelAnswer,
answerType: question.answerType
})
    });

    const data = await res.json();

    setResults({
      ...results,
      [index]: data,
    });

  } catch (error) {
    console.error(error);
  }
}

  async function generateSummary() {
    try {
      console.log("Generating summary with:", { subject, topic, subtopic, questions, answers, results });
      const res = await fetch("https://markd-ltw1.onrender.com/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          topic,
          subtopic,
          questions,
          answers,
          results,
        }),
      });

      const data = await res.json();
      console.log("Summary response:", data);
      setSummary(data);
    } catch (error) {
      console.error("Error generating summary:", error);
    }
  }

  return (
    <div className="app-container">
   {revisionStage === "setup" && (
  <SetupPage
    subject={subject}
    setSubject={setSubject}
    topic={topic}
    setTopic={setTopic}
    subtopic={subtopic}
    setSubtopic={setSubtopic}
    subjectTopics={subjectTopics}
    generateQuestions={generateQuestions}
    setRevisionStage={setRevisionStage}
    revisionHistory={revisionHistory}
    setRevisionHistory={setRevisionHistory}
     onLogout={handleLogout}
     onCreateAccount={handleCreateAccount}
  />
)}

    {loading && (
      <LoadingScreen />
    )}

    {revisionStage === "explanation" && (
      <ExplanationPage
        subject={subject}
        subtopic={subtopic}
        explanation={explanation}
        setRevisionStage={setRevisionStage}
      />
    )}

{revisionStage === "dashboard" && (
  <DashboardPage
    revisionHistory={revisionHistory}
     examHistory={examHistory}
  retakeExam={retakeExam}
  retryTopic={async (item, stage) => {

  console.log("RETRY CLICKED:", item, stage);


  const newSubject = item.subject;
  const newTopic = item.topic || item.subtopic;
  const newSubtopic = item.subtopic;


  // update state
  setSubject(newSubject);
  setTopic(newTopic);
  setSubtopic(newSubtopic);


  // temporarily use the values directly
  setLoading(true);


  try {

    const resourcesRes = await fetch("https://markd-ltw1.onrender.com/generate-resources", {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          subject:newSubject,
          topic:newTopic,
          subtopic:newSubtopic
        })
      }
    );


    const resourcesData = await resourcesRes.json();

    setResources(resourcesData.videos || []);



    const explanationRes = await fetch("https://markd-ltw1.onrender.com/generate-explanation", {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          subject:newSubject,
          topic:newTopic,
          subtopic:newSubtopic
        })
      }
    );


    const explanationData = await explanationRes.json();

    setExplanation(explanationData.explanation);



    const questionsRes = await fetch("https://markd-ltw1.onrender.com/generate-questions", {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          subject:newSubject,
          topic:newTopic,
          subtopic:newSubtopic
        })
      }
    );


    const questionsData = await questionsRes.json();

    setQuestions(questionsData.questions || []);


  } catch(error){

    console.error(error);

  }


  setLoading(false);


  if(stage==="full"){
    setAnswers({});
    setResults({});
    setCurrentQuestion(0);
    setRevisionStage("explanation");
  }

  else if(stage==="explanation"){
    setRevisionStage("explanation");
  }

  else if(stage==="questions"){
    setRevisionStage("questions");
  }

  else if(stage==="videos"){
    setRevisionStage("videos");
  }

}}
    setPage={setRevisionStage}
  />
)}

    {revisionStage === "videos" && (
      <LearnMode
        resources={resources}
        subject={subject}
        setRevisionStage={setRevisionStage}
      />
    )}

    {revisionStage === "questions" && (
      <QuestionMode
        questions={questions}
        answers={answers}
        setAnswers={setAnswers}
        results={results}
        markAnswer={markAnswer}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        subject={subject}
        setRevisionStage={setRevisionStage}
        generateSummary={generateSummary}
      />
    )}

    {revisionStage === "summary" && (
      <SummaryPage
        subject={subject}
        topic={topic}
        subtopic={subtopic}
        results={results}
        questions={questions}
        summary={summary}
        setRevisionStage={setRevisionStage}
        setQuestions={setQuestions}
        setAnswers={setAnswers}
        setResults={setResults}
        setCurrentQuestion={setCurrentQuestion}
        setTopic={setTopic}
        setSubtopic={setSubtopic}
        setRevisionHistory={setRevisionHistory}
        revisionQueue={revisionQueue}
currentRevisionIndex={currentRevisionIndex}
setCurrentRevisionIndex={setCurrentRevisionIndex}
generateQuestions={generateQuestions}
user={user}
      />
    )}
    {
revisionStage === "weakTopicsComplete" && (

<div className="summary-page">

<div className="summary-container">


<h1>
🎉 Weak Topics Completed
</h1>


<p>
You have revised all your exam weak areas.
</p>


<button
className="retry-button"
onClick={()=>{

setRevisionStage("examSetup");

}}
>

📝 Retake Exam

</button>


</div>

</div>

)
}

    {revisionStage==="examSetup" && (
<ExamPageSetup
  subjectTopics={subjectTopics}

  examSubject={examSubject}
  setExamSubject={setExamSubject}

  examLevel={examLevel}
  setExamLevel={setExamLevel}

  examPaperType={examPaperType}
  setExamPaperType={setExamPaperType}

  examTopic={examTopic}
  setExamTopic={setExamTopic}
 examSubtopics={examSubtopics}

setExamSubtopics={setExamSubtopics} 

  examQuestionCount={examQuestionCount}
  setExamQuestionCount={setExamQuestionCount}


  

  

  setRevisionStage={setRevisionStage}
  customQuestionCount={customQuestionCount}
setCustomQuestionCount={setCustomQuestionCount}

examDifficulty={examDifficulty}
setExamDifficulty={setExamDifficulty}


/>

)}
{
revisionStage==="exam" && (

<ExamPage

examSettings={examSettings}

subject={examSubject}

level={examLevel}



examQuestions={examQuestions}

setExamQuestions={setExamQuestions}

answers={examAnswers}

setAnswers={setExamAnswers}

setRevisionStage={setRevisionStage}
setCompletedExam={setCompletedExam}



/>

)
}
{
revisionStage==="examResults" && (

<ExamResults
    completedExam={completedExam}
    examResults={examResults}
    setExamResults={setExamResults}
    setRevisionStage={setRevisionStage}
/>

)
}
{revisionStage === "finalExamResults" && (

<ExamResultsFinal

examResults={examResults}

completedExam={completedExam}

setRevisionStage={setRevisionStage}

setExamResults={setExamResults}

user={user}

/>

)}
{
revisionStage === "examFeedback" && (
    <ExamFeedback
        examResults={examResults}
        setExamResults={setExamResults}
        setRevisionStage={setRevisionStage}
    />
)
}
{
revisionStage === "practiceMistakes" && (
    <PracticeMistakes
        examResults={examResults}
        setRevisionStage={setRevisionStage}
        revisionQueue={revisionQueue}
setRevisionQueue={setRevisionQueue}
currentRevisionIndex={currentRevisionIndex}
setCurrentRevisionIndex={setCurrentRevisionIndex}
    generateQuestions={generateQuestions} 
     examSubject={completedExam?.subject}
    examTopic={examTopic}
    findTopicFromSubtopic={findTopicFromSubtopic}
    />
)
}
{
revisionStage === "practiceQueue" && (

<QuestionMode

questions={questions}

answers={answers}

setAnswers={setAnswers}

results={results}

markAnswer={markAnswer}

currentQuestion={currentQuestion}

setCurrentQuestion={setCurrentQuestion}

subject={examSubject}

topic={revisionQueue[currentRevisionIndex]?.topic}

subtopic={revisionQueue[currentRevisionIndex]?.subtopic}

practiceMode={true}

revisionQueue={revisionQueue}

currentRevisionIndex={currentRevisionIndex}

setCurrentRevisionIndex={setCurrentRevisionIndex}

setRevisionStage={setRevisionStage}

generateSummary={generateSummary}

/>

)
}
    </div>
  );
}
