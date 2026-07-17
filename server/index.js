
import express from "express";
import dotenv from "dotenv";
dotenv.config();
console.log("🔥 THIS IS THE CORRECT INDEX.JS RUNNING 🔥");
import cors from "cors";
import Groq from "groq-sdk";
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

const app = express();

app.get("/", (req, res) => {
  res.send("THIS IS MY NEW BACKEND");
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://markdai.app"
];

app.use(cors({
  origin:function(origin, callback){

    if(!origin) return callback(null,true);

    if(
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ){
      return callback(null,true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials:true
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
  console.log("ROUTE HIT");
  console.log(req.body);
  const { subject, topic, subtopic } = req.body;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
       content: `
You are an AQA A-Level ${subject} examiner.

Generate questions that closely match real AQA exam style.

Questions must:
- Be based only on the official AQA specification content.
- Use wording and command terms similar to AQA past papers.
- Match the difficulty and style of AQA examinations.
- Include realistic mark allocations.
- Test application, analysis, and recall where appropriate.
- Avoid unrealistic or overly broad questions.

Use past papers as inspiration for:
- question structure
- command words
- difficulty
- mark scheme expectations

Do not copy past paper questions word-for-word.
Create original questions with the same style.
You MUST respond ONLY in valid JSON.
Do NOT include markdown, backticks, or explanations.
Give a mix of short answer questions and long answer questions.
Include calculations,mechanisms etc for some of the chemistry questions.


IMPORTANT DIAGRAM RULES:

Only set requiresDrawing to true if the student MUST create a visual diagram as part of the mark scheme.

Set requiresDrawing to false for:
- Questions that only ask to describe, explain, compare, or outline
- Questions where a diagram would be helpful but is not required
- Questions asking about processes where written answers are acceptable
- Questions involving formulas, calculations, definitions, or explanations
Subject-specific diagram rules:

BIOLOGY DIAGRAM RULES:

For Biology, requiresDiagram should almost always be false.

Only set requiresDiagram to true for:
- Drawing a genetic diagram (Punnett square)
- Drawing a graph from experimental data
- Completing or annotating a provided diagram
- Drawing a simple scientific model where AQA commonly expects it

Do NOT require students to draw:
- Organs (heart, lungs, kidney, etc.)
- Cells
- Biological structures from memory
- Microscopic structures
- Protein structures
- Enzymes
- Molecules

If a biological structure is normally tested, ask the student to explain, identify, or interpret it instead.

Only create diagram questions if the wording "draw", "complete", "plot", or "construct" would realistically appear in an AQA mark scheme.

CHEMISTRY:
Set requiresDiagram to true for:
- displayed formula drawings
- structural formula drawings
- organic mechanisms
- curly arrow mechanisms
- reaction diagrams
- graphs where drawing is required

PSYCHOLOGY:
Normally set requiresDiagram to false unless the question explicitly requires a diagram or graph.




Do not mark a question as requiring a drawing unless the wording explicitly requires a diagram/drawing/graph/structure.
Return format:
{
  "questions": [
    {
      "question": "...",
      "marks": "...",
       "requiresDiagram": false
       "markScheme":"..."
      
    }
  ]
}
`
      },
      {
        role: "user",
        content: `
Subject: ${subject}
Topic: ${topic}
Subtopic: ${subtopic}

Generate 5 exam questions.

        `
      }
    ]
  });

  const raw = completion.choices[0].message.content;

  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  console.log("RAW AI RESPONSE:");
  console.log(raw);

  console.log("CLEANED RESPONSE:");
  console.log(cleaned);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.log("JSON PARSE ERROR:", err.message);
    return res.status(500).json({
      error: "AI returned invalid JSON",
      raw: cleaned
    });
  }

  res.json(parsed);
});
app.post("/mark-answer", async (req, res) => {
  try {
    const { question, marks, answer, diagram, markScheme } = req.body;
    console.log("DIAGRAM RECEIVED:", diagram ? "YES" : "NO");
const diagramInstructions = diagram
  ? `
The student has also submitted a labelled diagram.

Analyse the diagram carefully.

Check:
- Are labels correct?
- Are important structures included?
- Is the arrangement accurate?
- Are there missing features?

Include diagram feedback only when an actual diagram error exists.

Do not give generic diagram advice.
Do not tell students to add labels unless the question asks for labels.
Do not tell students to add written explanations unless the question asks for an explanation.
`
  : "";
    const completion = await groq.chat.completions.create({
     model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content:
            "You are an AQA A-Level Biology examiner. Return valid JSON only. Address the student directly using 'you' and 'your' in your feedback.",
        },
        {
          role: "user",
content: [
  {
    type: "text",
    text: `
Question:
${question}

Maximum marks:
${marks}

Your answer:
${answer}

Expected mark scheme:
${markScheme}

${diagramInstructions}

You are an AQA A-Level Biology examiner.

You MUST return ONLY valid JSON.

You MUST follow this schema exactly:

{
  "score": 0,
  "strengths": "string",
  "improvements": "string",
  "modelAnswer": "string"
}

RULES:
- ALL keys must exist
- DO NOT omit any field
- DO NOT add extra keys
- DO NOT include markdown
- DO NOT include explanation outside JSON
- Always start with a capital letter
- Address the student directly using "you" and "your" in strengths and improvements
- If the written answer is blank but a diagram has been submitted:
  - Do NOT mark the student down for having no written response.
  - Do NOT mention that they did not provide a written answer.
  - Mark only the diagram against the requirements of the question.
  - Only expect written explanation if the question explicitly asks for explanation, description, evaluation, justification, or calculations.

- If the written answer is blank and no diagram has been submitted:
  - Award marks only if the question can be answered without written text (for example a structure drawing).
  - Otherwise explain what information is missing.
- Only provide Strengths when the answer contains relevant scientific/subject knowledge.

If a diagram image is provided:

IMPORTANT:
The diagram is part of the student's answer.

Do NOT mark the answer as blank just because the written response is empty.

Analyse the diagram itself.

Check:
- Are all required structures present?
- Are labels scientifically correct?
- Are arrows/annotations accurate?
- Are bonds, shapes, and arrangements correct?
- Are important intermediate steps included?
- Are there missing features required by the mark scheme?

Award marks based on the diagram quality.

IMPORTANT:
Do not penalise the student for not writing an explanation when the question only requires a diagram, structure, mechanism, graph, or labelled drawing.

Only mention missing written explanation if the question wording requires:
- explain
- describe
- discuss
- evaluate
- justify
- calculate
- compare

If the question contains a chemical structure or mechanism diagram:

Analyse the student's diagram as a chemistry examiner.
For mechanism drawing questions:

The diagram itself is the complete answer.

Do NOT request:
- written explanations
- extra labels
- descriptions of steps

unless the question explicitly asks for them.
Do not give generic advice such as "make your diagram clearer" unless a genuine visual error is visible.

For organic structures:
- Identify every carbon atom position.
- Count the carbon chain carefully.
- Check the position of every functional group.
- Check whether substituents are attached to the correct carbon number.
- Check stereochemistry if relevant.
- Carefully inspect the student's drawing before making a judgement.
- Do not rely on guessing from unclear handwriting.
- If a structure appears incorrect, explain exactly:
  - which atom is wrong
  - which carbon number is affected
  - what the correct position should be
- Only deduct marks for visible structural errors.
- If the student's structure is correct, award the marks.

For displayed structural formulas:
- Trace the carbon backbone from left to right.
- Number the longest carbon chain.
- Verify substituent positions.
- Verify bonds and atoms.

Mark this response:

Question:
${question}

Maximum marks:
${marks}

Student written answer:
${answer || "No written answer provided."}

A diagram has been submitted:
${diagram ? "YES - analyse the image carefully." : "NO"}
`
  },

  ...(diagram
    ? [
        {
          type: "image_url",
          image_url: {
            url: diagram,
         },
              },
            ]
          : []),
      ],
    },
  ],
});  
   let content = completion.choices[0].message.content;

console.log("MARKING AI RESPONSE:");
console.log(content);

content = content
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

console.log("CLEANED JSON:");
console.log(content);
    let result;

    try {
      result = JSON.parse(content);
    } catch (e) {
      console.log("BAD JSON FROM AI:", content);

     return res.json({
    score: 0,
    strengths: "Unable to parse examiner feedback.",
    improvements: "AI returned invalid format.",
    modelAnswer: "",
      });
    }

    res.json({
      score: result.score ?? 0,
      strengths: result.strengths ?? "Not provided.",
      improvements: result.improvements ?? "Not provided.",
      modelAnswer: result.modelAnswer ?? "",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to mark answer",
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