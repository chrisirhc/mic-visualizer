// Maybe use mjs?
const canvas = document.getElementById("oscilloscope");
const canvasCtx = canvas.getContext("2d");

const wfCanvas = document.getElementById("waveform");
const wfCanvasCtx = wfCanvas.getContext("2d");

function start() {
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  // analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const freqArray = new Uint8Array(bufferLength);
  const timeArray = new Uint8Array(bufferLength);

  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({"audio": true}).then((stream) => {
      const microphone = audioCtx.createMediaStreamSource(stream);
      // `microphone` can now act like any other AudioNode

      microphone.connect(analyser);
      analyser.getByteFrequencyData(freqArray);
      analyser.getByteTimeDomainData(timeArray);

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

    analyser.getByteFrequencyData(freqArray);
    analyser.getByteTimeDomainData(timeArray);
    console.log(timeArray);

    wfCanvasCtx.fillStyle = "rgb(200 200 200)";
    wfCanvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    wfCanvasCtx.lineWidth = 2;
    wfCanvasCtx.strokeStyle = "rgb(0 0 0)";
    wfCanvasCtx.beginPath();

    canvasCtx.fillStyle = "rgb(200 200 200)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0 0 0)";

    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = freqArray[i] / 128.0;
      const v2 = timeArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      const y2 = (v2 * canvas.height) / 2;

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
  }
}
