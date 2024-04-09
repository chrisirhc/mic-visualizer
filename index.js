import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Maybe use mjs?
const canvas = document.getElementById("oscilloscope");
const canvasCtx = canvas.getContext("2d");

const wfCanvas = document.getElementById("waveform");
const wfCanvasCtx = wfCanvas.getContext("2d");

const startButton = document.getElementById("start");
startButton.addEventListener("click", start);

function start() {
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  // analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const freqArrays = [new Uint8Array(bufferLength), new Uint8Array(bufferLength)];
  const timeArrays = [new Uint8Array(bufferLength), new Uint8Array(bufferLength)];
  let timeArrayIndex = 0;

  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({"audio": true}).then((stream) => {
      const microphone = audioCtx.createMediaStreamSource(stream);
      // `microphone` can now act like any other AudioNode

      microphone.connect(analyser);
      analyser.getByteFrequencyData(freqArrays[timeArrayIndex]);
      analyser.getByteTimeDomainData(timeArrays[timeArrayIndex]);

      draw();
    }).catch((err) => {
      // browser unable to access microphone
      // (check to see if microphone is attached)
      console.error('error accessing microphone', err);
    });
  } else {
    // browser unable to access media devices
    // (update your browser)
    console.error('unable to access media devices')
  }

  function draw() {
    requestAnimationFrame(draw);

    const freqArray = freqArrays[timeArrayIndex];
    const timeArray = timeArrays[timeArrayIndex];
    const prevFreqArray = freqArrays[timeArrayIndex === 0 ? 1 : 0];
    const prevTimeArray = timeArrays[timeArrayIndex === 0 ? 1 : 0]
    analyser.getByteFrequencyData(freqArray);
    analyser.getByteTimeDomainData(timeArray);

    // Idea to try is to render into shader and move "sand particles" using the force
    // of the sound waves. This would be a cool effect to try out.
    wfCanvasCtx.globalAlpha = 0.01;
    wfCanvasCtx.fillStyle = "rgb(200 200 200)";
    wfCanvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    wfCanvasCtx.globalAlpha = 0.5;
    wfCanvasCtx.lineWidth = 2;
    wfCanvasCtx.strokeStyle = "hsl(150 30% 0%)";
    wfCanvasCtx.beginPath();

    canvasCtx.fillStyle = "rgb(200 200 200)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    wfCanvasCtx.strokeStyle = "rgb(200 200 200)";

    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    // console.log('freq', freqArray[0]);
    for (let i = 0; i < bufferLength; i++) {
      const v = freqArray[i] / 255.0;
      const v2 = timeArray[i] / 128.0;
      const y = canvas.height - (v * canvas.height);
      const y2 = (v2 * canvas.height) / 2;

      const dV = (freqArray[i] - prevFreqArray[i] + 64.0) / 128.0;
      if (dV) console.log(dV, freqArray[i], prevFreqArray[i]);
      const freqColor = d3.interpolateRdYlGn(dV);
      canvasCtx.strokeStyle = freqColor;
      const dV2 = (timeArray[i] - prevTimeArray[i] + 128.0) / 255.0;
      // if (dV2) console.log(dV2, timeArray[i], prevTimeArray[i]);
      wfCanvasCtx.strokeStyle = d3.interpolateRdYlGn(dV2);

      if (i === 0) {
        canvasCtx.moveTo(x, y);
        wfCanvasCtx.moveTo(x, y2);
      } else {
        canvasCtx.lineTo(x, y);
        wfCanvasCtx.lineTo(x, y2);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();

    wfCanvasCtx.lineTo(canvas.width, canvas.height / 2);
    wfCanvasCtx.stroke();

    switchIndex();
  }

  function switchIndex() {
    timeArrayIndex = timeArrayIndex === 0 ? 1 : 0;
  }
}
