// Maybe use mjs?
const canvas = document.getElementById("oscilloscope");
const canvasCtx = canvas.getContext("2d");

function start() {
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({"audio": true}).then((stream) => {
      const microphone = audioCtx.createMediaStreamSource(stream);
      // `microphone` can now act like any other AudioNode

      microphone.connect(analyser);
      analyser.getByteFrequencyData(dataArray);

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

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = "rgb(200 200 200)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0 0 0)";

    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
}
