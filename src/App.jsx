import "./App.css";
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





export default function App() {
  const [subject, setSubject] = useState("Biology");


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
const [customQuestionCount,setCustomQuestionCount] = useState("");
const [examDifficulty, setExamDifficulty] = useState("Mixed");
const examSettings = {

  subject: examSubject,

  level: examLevel,

  paperType: examPaperType,

  topic: examTopic,

  subtopics: examSubtopics,

  questions:
    examQuestionCount === "custom"
      ? Number(customQuestionCount)
      : Number(examQuestionCount),

  difficulty: examDifficulty,
  
};

const [examResults, setExamResults] = useState(null);
 const [revisionHistory, setRevisionHistory] = useState(() => {
  return JSON.parse(
    localStorage.getItem("revisionHistory")
  ) || [];
});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("revisionHistory")) || [];
    setRevisionHistory(history);
 }, []);

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
async function markAnswer(question, index, diagram) {
  console.log("Diagram sent:", diagram);
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
            diagram: diagram,
             markScheme: question.markScheme
          }),
        }
      );

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
      />
    )}
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

setRevisionStage={setRevisionStage}

examMark={examMark}

examResults={examResults}

setExamResults={setExamResults}


/>

)
}
    </div>
  );
}
