
import express from "express";
import dotenv from "dotenv";
dotenv.config();

console.log("🔥 THIS IS THE CORRECT INDEX.JS RUNNING 🔥");

import cors from "cors";
import Groq from "groq-sdk";
import OpenAI from "openai";
import biologyVideos from "./biologyvideos.js";
import chemistryVideos from "./chemistryvideos.js";
import psychologyVideos from "./psychologyvideos.js";

const videoLibraries = {
  Biology: biologyVideos,
  Chemistry: chemistryVideos,
  Psychology: psychologyVideos,
};

console.log(Object.keys(videoLibraries.Chemistry));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});



const app = express();

app.get("/", (req, res) => {
  res.send("THIS IS MY NEW BACKEND");
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://markdai.app"
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  credentials: true
}));
app.use(express.json());


app.get("/test", (req, res) => {
  console.log("TEST ROUTE HIT");
  res.send("TEST WORKS");
});
app.post("/generate-resources", (req, res) => {
  const { subject, subtopic } = req.body;
  res.json({
    videos: videoLibraries[subject]?.[subtopic] || [],
  });
});

app.post("/generate-explanation", async (req, res) => {

  console.log("ROUTE HIT");
  console.log(req.body);
  const { subject, topic, subtopic } = req.body;
  console.log("Subtopic received:", subtopic);
  console.log("Available video keys:", Object.keys(chemistryVideos));

  const examinerMap = {
    Biology: "You are an expert AQA A-Level Biology teacher. You ONLY teach Biology.",
Chemistry: "You are an expert AQA A-Level Chemistry teacher. You ONLY teach Chemistry.",
Psychology: "You are an expert AQA A-Level Psychology teacher. You ONLY teach Psychology."
  };

  const systemPrompt =
  examinerMap[subject?.trim()] ?? "You are an expert AQA examiner.";

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
       content: `
Create concise AQA A-Level revision notes for the following subtopic.

You MUST use this exact markdown structure.


# Topic Overview

- Write 5-8 concise bullet points explaining the subtopic.
- Bold important terminology.
- Keep each bullet to one or two sentences.
- No unnecessary introduction.

# Key Terms

For exactly 5 key terms, use this format:

- **Term**: Definition


Do not include any other headings or sections.

After the key terms section, create:

# Common Mistakes

Provide exactly 3 common student mistakes.
Each mistake must start with ⚠️
Use bullet points.
Address the student directly: "You often..." or "You might..."

Subject: ${subject}
Topic: ${topic}
Subtopic: ${subtopic}
`
        
      }
    ]
  });

  res.json({
    explanation: completion.choices[0].message.content
  });
});
app.post("/generate-questions", async (req, res) => {

  try {

    console.log("ROUTE HIT");
    console.log(req.body);

    const { subject, topic, subtopic } = req.body;


    const completion = await groq.chat.completions.create({

      model: "llama-3.3-70b-versatile",

      temperature: 0.2,

      max_tokens: 3000,

      messages: [

        {
          role: "system",

          content: `

You are an AQA A-Level ${subject} examiner.

Generate 5 realistic AQA style exam questions.

Return ONLY valid JSON.
No markdown.
No code blocks.
No explanations outside JSON.
Do not ask the student to show working out

Your output must exactly follow this structure:

{
 "questions":[
  {
   "question":"",
   "marks":5,
   "requiresDiagram":false,
   "answerType":"",
   "markScheme":[],
   "modelAnswer":""
  }
 ]
}


QUESTION RULES:

- Use AQA command words.
- Create original questions.
- Include realistic mark allocations.
- Include recall and application.
- Include calculations and mechanisms where appropriate.


DIAGRAM RULES:

requiresDiagram is ONLY true when the student must draw something.

Chemistry:
requiresDiagram:true for:
- organic mechanisms
- curly arrow mechanisms
- displayed formula drawing
- structural formula drawing
- reaction diagrams

requiresDiagram:false for:
- explanations
- calculations
- definitions
- descriptions


MODEL ANSWER RULES:

If requiresDiagram:false:

modelAnswer:
- plain text only
- no diagrams
- no ASCII structures
- no curly arrows
- no markdown


If requiresDiagram:true:

modelAnswer:
- MUST describe the correct answer AND include the diagram.
- The diagram must be inside the modelAnswer string.
- Use \\n for line breaks.
- Do not use markdown code blocks.
- Do not use backticks.


Example diagram answer:

"The mechanism should show protonation of the alcohol followed by loss of water.\\n\\nCH3CH2OH + H+ -> CH3CH2OH2+\\n\\nCurly arrow from the C-O bond to oxygen showing water leaving."


MARK SCHEME RULES:

markScheme MUST be an array.

Each item gives exactly ONE mark.

Example:

[
"1 mark - correct reagent",
"1 mark - correct condition",
"1 mark - correct mechanism",
"1 mark - correct product"
]


Never write:

"Correct answer (4 marks)"

Every mark must be separate.


JSON RULES:

- Escape all quotes inside strings.
- Escape all newline characters using \\n.
- Never output raw line breaks inside JSON strings.

`

        },

        {

          role:"user",

          content:`

Subject: ${subject}

Topic: ${topic}

Subtopic: ${subtopic}


Generate 5 exam questions.

Do not ask the student to show working out in any question.

`

        }

      ]

    });



    const raw = completion.choices[0].message.content;


    console.log("RAW AI RESPONSE:");
    console.log(raw);



    let cleaned = raw
      .replace(/```json/g,"")
      .replace(/```/g,"")
      .trim();



    // Extract JSON only

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");


    if(start === -1 || end === -1){

      throw new Error("No JSON found");

    }


    cleaned = cleaned.substring(start,end+1);



    console.log("CLEANED JSON:");
    console.log(cleaned);



    let parsed;


    try {

      parsed = JSON.parse(cleaned);


    }

    catch(error){

      console.log("JSON ERROR:",error.message);

      return res.status(500).json({

        error:"AI returned invalid JSON",

        raw:cleaned

      });

    }



    // Remove accidental line breaks from non-diagram answers

    parsed.questions.forEach(q=>{

      if(
        q.requiresDiagram === false &&
        q.modelAnswer
      ){

        q.modelAnswer =
        q.modelAnswer.replace(/\r?\n/g," ");

      }


    });



    res.json(parsed);



  }


  catch(error){

    console.error("GENERATE QUESTIONS ERROR:");

    console.error(error);


    res.status(500).json({

      error:"Question generation failed",

      details:error.message

    });


  }


});
app.post("/generate-exam", async (req,res)=>{

try {

const {
subject,
level,
paperType,
topic,
subtopics,
questions,
difficulty
} = req.body;

// Number the subtopics so AI only chooses an index
const numberedSubtopics = subtopics
.map((s,index)=>`${index}: ${s}`)
.join("\n");
const prompt = `
Generate a realistic ${level} ${subject} exam paper.

Paper type: ${paperType}
Topic: ${topic || "Full Subject"}

Available subtopics:
${numberedSubtopics}

Return ONLY valid JSON.

Format:
{
 "questions":[
   {
    "question":"",
    "marks":5,
    "requiresDiagram":false,
    "answerType":"",
    "subtopicIndex":0,
    "markScheme":[],
    "modelAnswer":""
   }
 ]
}

RULES:
- Create exactly ${questions} questions
- Difficulty: ${difficulty}
- Do not ask the student to show working out
- Use AQA A-Level exam wording
- Include recall and application questions
- No markdown, no explanations, only JSON

MARK LIMITS:
Easy: 1-3 marks
Medium: 3-5 marks (min 2)
Hard: 5-25 marks (psych max 16, chem max 8, bio max 9 except essays 15-25)
Mixed: Realistic mix based on subject

DIAGRAMS (Chemistry only):
Set requiresDiagram:true for: mechanisms, curly arrows, displayed/structural formulas, reaction diagrams
Set requiresDiagram:false for: explanations, calculations, definitions

MODEL ANSWER:
If requiresDiagram:false: plain text written answer
If requiresDiagram:true: describe the diagram with labels/structures, use \\n for line breaks, no markdown

MARK SCHEME:
Array where each item = 1 mark
Example: ["1 mark - correct reagent", "1 mark - correct condition"]
Never write: "Correct answer (4 marks)"

JSON FORMAT:
Escape quotes with \\, escape newlines with \\n, no raw line breaks in strings

SUBTOPIC INDEX:
Must match the numbered list above
Example: if topic is "1: Photosynthesis", use subtopicIndex:1
`;
const completion = await openrouter.chat.completions.create({
 model: "nvidia/nemotron-3-nano-30b-a3b:free",
messages:[
{
role:"user",
content:prompt
}
]});


let text =
completion.choices[0].message.content;


// Remove markdown if AI adds it
text = text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();


// Extract JSON only
const jsonStart = text.indexOf("{");
const jsonEnd = text.lastIndexOf("}");

if(jsonStart !== -1 && jsonEnd !== -1){

text = text.substring(
jsonStart,
jsonEnd + 1
);

}


let exam;

try {

  exam = JSON.parse(text);

}
catch(error){

console.log(
"FULL EXAM ERROR:",
JSON.stringify(error,null,2)
);

console.log(
"RAW AI RESPONSE:",
text
);

res.status(500).json({
error:"Exam generation failed",
details:text
});

}


if(!exam.questions){

  return res.status(500).json({
    error:"Exam response missing questions"
  });

}


// Convert subtopicIndex into real saved subtopic
console.log(
  "SUBTOPICS RECEIVED:",
  subtopics
);

console.log(
  "SUBTOPIC COUNT:",
  subtopics.length
);


exam.questions = exam.questions.map(q => {

  const index = Number(q.subtopicIndex);

  return {

    ...q,

    topic: topic || "Full Subject",

    subtopic:
      subtopics[index] || subtopics[0]

  };

});


// remove temporary AI field
exam.questions.forEach(q => {

  delete q.subtopicIndex;

});

console.log(
"NEMOTRON EXAM RESPONSE:",
JSON.stringify(completion,null,2)
);
console.log(
  "FINAL QUESTIONS WITH SUBTOPICS:",
  exam.questions
);


res.json(exam);


}


catch(error){


console.log(
"EXAM GENERATION ERROR:",
error
);


res.status(500).json({

error:"Exam generation failed"

});


}


});



app.post("/mark-exam", async (req,res)=>{

try{

const {
questions,
answers,

} = req.body;
// Separate written questions from diagram questions

const questionsToMark = [];

const diagramFeedback = [];


questions.forEach((q,index)=>{


if(q.requiresDiagram === true){

    diagramFeedback.push({

        question:index + 1,

        questionText:q.question,

        studentAnswer:
        "Diagram submitted by student",

        mark:null,

        maxMark:q.marks,

        strengths:
        "Compare your diagram with the model answer and mark scheme.",

        improvements:
        "Check labels, structures, arrows and required features.",

        modelAnswer:
        q.modelAnswer,

        markScheme:
        q.markScheme,

        requiresDiagram: true,

        originalIndex:index

    });


}

else{


    questionsToMark.push({

        ...q,

        originalIndex:index

    });


}


});

const prompt = `

You are an A-Level exam examiner.

Mark the student's answers.

Questions:

${questionsToMark.map((q,index)=>`

Question ${index+1}:
${q.question}

Available marks:
${q.marks}

Student answer:
${
answers[index]?.type === "diagram"

?

"Student submitted a diagram."

:

answers[index] || "No answer"

}

`).join("\n")}

Rules:
- Award partial marks where appropriate.
- Accept alternative wording.
- Do not require exact textbook phrases.
- Mark based on understanding, not keyword matching.
- Use the question and mark value to decide.
- Be fair but follow A-Level standards.

Return ONLY valid JSON in this format:

{
  "feedback":[
   {
    "question":1,
    "questionText":"",
    "studentAnswer":"",
    "mark":0,
    "maxMark":0,
    "strengths":"",
    "improvements":"",
    "modelAnswer":""
   }
  ]
}

Rules:
- Award marks like a real A-Level examiner.
- Strengths should explain what the student did well. You dont have to give a strength if the student has genuinely done nothing good.
- Improvements should explain exactly what was missing.
- QuestionText must contain the original exam question.
- StudentAnswer must contain the student's submitted answer.
- ModelAnswer must be a full-mark A-Level answer.
- Speak to the student directly using words like "you" and "your".
- Return only JSON.
IMPORTANT:
- You MUST include "modelAnswer" for EVERY question except if the student got full marks
- Never leave modelAnswer empty except if studdent got full marks
- The modelAnswer must be a full-mark A-Level answer.
- Even if the student gives no answer, still provide the correct model answer.
VERY IMPORTANT:
Before returning JSON, check every string value.
No string may contain an actual line break.
All line breaks must be written as \n.
- Every feedback object MUST contain exactly these keys:
question
questionText
studentAnswer
mark
maxMark
strengths
improvements
modelAnswer
`;



const completion = await groq.chat.completions.create({

model:"llama-3.1-8b-instant",


messages:[
{
role:"user",
content:prompt
}
]

});


let text =
completion.choices[0].message.content;


text=text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();


// Fix AI raw line breaks inside JSON strings
text = text.replace(
  /"([^"]*)\n([^"]*)"/g,
  (match, p1, p2) => {
    return `"${p1}\\n${p2}"`;
  }
);


let result;

try {

result = JSON.parse(text);

}

catch(error){

console.log("JSON FAILED - attempting repair");


const repaired = text
.replace(/\n/g, "\\n");


try{

result = JSON.parse(repaired);

}

catch(secondError){

console.log("REPAIR FAILED");
console.log(text);

throw secondError;

}

}
console.log(
"AI MARK RESPONSE:",
JSON.stringify(result,null,2)
);

if(Array.isArray(result)){

result = {
feedback: result
};

}


if(!result.feedback || !Array.isArray(result.feedback)){

throw new Error(
"AI response missing feedback array"
);

}
// Restore original question numbers
result.feedback = result.feedback.map((item, index) => {

    return {

        ...item,

        question:
            questionsToMark[index].originalIndex + 1,

        originalIndex:
            questionsToMark[index].originalIndex

    };

});
const mergedFeedback = [

    ...result.feedback,

    ...diagramFeedback

];

mergedFeedback.sort(

    (a,b)=>

    a.originalIndex -

    b.originalIndex

);

mergedFeedback.forEach(item=>{

    delete item.originalIndex;

});

result.feedback = mergedFeedback;
res.json(result);



}


catch(error){

console.log(
"MARKING ERROR:",
error
);


res.status(500).json({

error:"Exam marking failed"

});


}


});
async function generateModelAnswer(question, marks, markScheme) {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
        "HTTP-Referer": "https://markdai.app",
        "X-Title": "Markd"
      },
     body: JSON.stringify({
 model:"nvidia/nemotron-3-super-120b-a12b:free",
        messages: [
          {
            role: "user",
            content: `You are an AQA examiner. Give a full mark model answer.\nQuestion: ${question}\nMarks: ${marks}\nMark scheme: ${markScheme}` 
         }
        ]
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  } catch {
    return "";
  }
}

app.post("/mark-answer", async (req, res) => {

  console.log("MARK ANSWER RECEIVED:", req.body);


  const {
    question,
    marks,
    answer,
    markScheme,
    requiresDiagram,
    modelAnswer
  } = req.body;


  try {


    // Diagram questions should not be automatically marked
    // because the AI cannot reliably judge drawings from text.
    if (requiresDiagram === true) {

      return res.json({

        score: null,

        strengths:
        "Your diagram should be compared against the required features in the model answer.",

        improvements:
        "Check each label, bond, arrow, and structural feature against the mark scheme.",

        modelAnswer:
        modelAnswer ||
        "Compare your diagram with the required features.",

        markScheme,

        automaticMarkingFailed:true

      });

    }



    const markingPrompt = `

You are an AQA A-Level examiner.

Mark the student's answer using the mark scheme.

Question:
${question}

Maximum marks:
${marks}

Student answer:
${answer || "No answer provided."}

Mark scheme:
${JSON.stringify(markScheme)}


Return ONLY valid JSON:

{
 "score":0,
 "strengths":"",
 "improvements":"",
 "modelAnswer":""
}


RULES:

Score:
- Award marks only for correct points.
- Do not give credit for missing information.
- Maximum score is ${marks}.


Strengths:
- Address the student directly using "you".
- Mention what was done well.


Improvements:
- Address the student directly using "you".
- Explain exactly what is missing.


Model answer:
- Write a full-mark AQA answer.
- Use correct scientific terminology.
- Include every mark point.
- Keep it suitable for an exam.


DIAGRAM RULES:

requiresDiagram is ${requiresDiagram}

If requiresDiagram is false:
- Do not include diagrams.
- Do not include ASCII structures.
- Do not include reaction schemes.

If requiresDiagram is true:
- Describe the diagram instead.
- Do not use markdown.
- Do not use code blocks.


Never output:
- markdown
- backticks
- explanations outside JSON

`;



    const openRouterRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {

        method:"POST",

        headers:{

          "Content-Type":"application/json",

          "Authorization":
          `Bearer ${process.env.OPENROUTER_KEY}`,

          "HTTP-Referer":
          "https://markdai.app",

          "X-Title":
          "Markd"

        },


        body:JSON.stringify({

          model:
          "openai/gpt-oss-20b:free",


          temperature:0.1,


          max_tokens:1500,


          response_format:{
            type:"json_object"
          },


          messages:[

            {
              role:"user",
              content:markingPrompt
            }

          ]

        })

      }
    );



    console.log(
      "OpenRouter status:",
      openRouterRes.status
    );


    const data =
    await openRouterRes.json();



    if(!openRouterRes.ok){

      throw new Error(
        JSON.stringify(data)
      );

    }



    let raw =
    data.choices?.[0]?.message?.content;



    console.log(
      "RAW MARK RESPONSE:",
      raw
    );



    if(!raw){

      throw new Error(
        "Empty AI response"
      );

    }



    let cleaned =
    raw
    .replace(/```json/g,"")
    .replace(/```/g,"")
    .trim();



    // Extract JSON object

    const start =
    cleaned.indexOf("{");

    const end =
    cleaned.lastIndexOf("}");



    if(start === -1 || end === -1){

      throw new Error(
        "No JSON object found"
      );

    }


    cleaned =
    cleaned.substring(
      start,
      end + 1
    );



    let result;



    try{

      result =
      JSON.parse(cleaned);

    }

    catch(err){

      console.log(
        "FAILED JSON:",
        cleaned
      );

      throw err;

    }



    const safeScore =
    Math.min(
      Math.max(
        Number(result.score) || 0,
        0
      ),
      Number(marks)
    );



    return res.json({

      score:safeScore,

      strengths:
      result.strengths ||
      "No strengths identified.",

      improvements:
      result.improvements ||
      "No improvements identified.",

      modelAnswer:
      result.modelAnswer ||
      "",

      markScheme

    });



  }


  catch(error){


    console.error(
      "MARKING ERROR:",
      error
    );



    return res.json({

      score:null,

      strengths:"",

      improvements:
      "Automatic marking failed. Compare your answer with the model answer.",

      modelAnswer:
      modelAnswer || "",

      markScheme,

      automaticMarkingFailed:true

    });


  }


});
app.post("/api/generate-summary", async (req, res) => {
  try {

    const {
      subject,
      topic,
      subtopic,
      questions,
      answers,
      results
    } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert AQA A-Level ${subject} examiner.

Return ONLY valid JSON.

Schema:
{
  "overallFeedback": "",
  "strengths": ["", "", ""],
  "improvements": ["", "", ""],
  "examinerTip": ""
}`
        },
        {
          role: "user",
          content: `
Topic:
${topic}

Subtopic:
${subtopic}

Questions:
${JSON.stringify(questions)}

Student Answers:
${JSON.stringify(answers)}

Examiner Results:
${JSON.stringify(results)}

Review the student's overall performance.

Rules:
- Speak directly to the student using "you".
- Be encouraging but honest.
- If answers are blank or gibberish, do not invent strengths.
- Give exactly 3 strengths.
- Give exactly 3 improvements.
- Give one examiner tip.
- Return ONLY valid JSON.
`
        }
      ]
    });

    const raw = completion.choices[0].message.content;

    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const summary = JSON.parse(cleaned);

    res.json(summary);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate summary"
    });
  }
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});