// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "./my_model/";
let lastUpdateTime = 0;
let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  const now = Date.now();
  const prediction = await model.predict(webcam.canvas);
  if (now - lastUpdateTime > 1000) {
    predictClass(prediction);
    lastUpdateTime = now; // Atualiza o marcador de tempo
  }
  /*for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }*/
}

function predictClass(prediction) {
  let highestProb = 0;
  let bestClass = "";

  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability > highestProb) {
      highestProb = prediction[i].probability;
      bestClass = prediction[i].className;
    }
  }

  let statusColor = "#2ecc71";
  if (
    bestClass.toLowerCase().includes("no") ||
    bestClass.toLowerCase().includes("sem")
  ) {
    statusColor = "#e74c3c";
  }

  labelContainer.innerHTML = `
        <div style="background: #f0f0f0; padding: 10px; border-radius: 5px; border-left: 5px solid ${statusColor}">
            <strong>RESULTADO DO ARQUIVO:</strong>
            <h2 style="color: ${statusColor}; margin: 5px 0;">${bestClass.toUpperCase()}</h2>
            <small>Confiança: ${(highestProb * 100).toFixed(2)}%</small>
        </div>`;
}
