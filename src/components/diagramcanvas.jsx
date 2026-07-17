import { useRef, useState, useEffect } from "react";

export default function DiagramCanvas({ onSave }) {



  const canvasRef = useRef(null);

  const [tool, setTool] = useState("pen");
  const [brushSize, setBrushSize] = useState(3);


  useEffect(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;


    const resizeCanvas = () => {

      const rect = canvas.getBoundingClientRect();

      const ratio = window.devicePixelRatio || 1;


      const ctx = canvas.getContext("2d");


      // store current drawing
      const image = canvas.toDataURL();


      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;


      ctx.setTransform(1,0,0,1,0,0);

      ctx.scale(ratio, ratio);


      // restore background
      ctx.fillStyle = "#a9c3ec";

      ctx.fillRect(
        0,
        0,
        rect.width,
        rect.height
      );


      // restore drawing if exists
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(
          img,
          0,
          0,
          rect.width,
          rect.height
        );
      };

      if(image.length > 100){
        img.src = image;
      }

    };


    resizeCanvas();


    window.addEventListener(
      "resize",
      resizeCanvas
    );


    return () => {

      window.removeEventListener(
        "resize",
        resizeCanvas
      );

    };


  }, []);



  useEffect(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;


    const ctx = canvas.getContext("2d");


    ctx.fillStyle = "#a9c3ec";


    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


  }, []);



  function getPosition(e){

    const canvas = canvasRef.current;

    const rect = canvas.getBoundingClientRect();


    return {

      x:
      (e.clientX - rect.left),

      y:
      (e.clientY - rect.top)

    };

  }


function startDrawing(e) {

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  canvas.isDrawing = true;

  ctx.beginPath();

  const pos = getPosition(e);

ctx.beginPath();
ctx.moveTo(pos.x,pos.y);

  if (tool === "eraser") {

  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "#a9c3ec";

}
  else {

  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "#000";

}

  if (tool === "eraser") {

  ctx.lineWidth = brushSize * 4;

} else {

  ctx.lineWidth = brushSize;

}
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

}
function draw(e) {

  const canvas = canvasRef.current;

  if (!canvas.isDrawing) return;

  const ctx = canvas.getContext("2d");

 const pos = getPosition(e);

ctx.lineTo(
 pos.x,
 pos.y
); 

  ctx.stroke();

}

  function stopDrawing() {

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  canvas.isDrawing = false;

  ctx.closePath();

  ctx.globalCompositeOperation = "source-over";

}

function clearCanvas() {

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  ctx.globalCompositeOperation =
    "source-over";

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = "#a9c3ec";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

}
  

  function saveCanvas(){

    const image =
      canvasRef.current.toDataURL();

    onSave(image);

  }


  return (

    <div className="diagram-container">

     <h3>
✏️ Draw your answer
</h3>

<p className="diagram-help">
Include clear labels, arrows and accurate structures.
When finished, press "Submit Answer".
</p>

    <canvas
 ref={canvasRef}
 className="diagram-canvas"

 style={{
   touchAction:"none"
 }}

 onPointerDown={startDrawing}
 onPointerMove={draw}
 onPointerUp={stopDrawing}
 onPointerLeave={stopDrawing}
/>

      <div className="drawing-toolbar">

<button

className={
tool==="pen"
?"active-tool"
:""
}

onClick={() => setTool("pen")}

>

✏️ Pen

</button>

<button

className={
tool==="eraser"
?"active-tool"
:""
}

onClick={() => setTool("eraser")}

>

🧽 Eraser

</button>


<button
onClick={clearCanvas}
>
🗑 Clear
</button>


<label>

Thickness

</label>

<input

type="range"

min="1"

max="12"

value={brushSize}

onChange={(e)=>

setBrushSize(
Number(e.target.value)
)

}

/>

<span>

{brushSize}px

</span>


<button 
className="submit-diagram-button"
onClick={saveCanvas}
>
Submit Answer →
</button>

</div>

        

    </div>

  );

}