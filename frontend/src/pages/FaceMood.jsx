import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import "./FaceMood.css";

export default function FaceMood({ isActive, paused = false, onFaceDetected, onMoodCalculated }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const MODEL_URL = "/models";

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!isActive || paused) return;

    const loadModelsAndStart = async () => {
      setLoading(true);
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      await startVideo();
      setLoading(false);
    };
    loadModelsAndStart();

    return () => {
      stopStream();
      onFaceDetected(false);
    };
  }, [isActive, paused]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setLoading(false);
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || loading) return;

    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
    const detection = await faceapi.detectSingleFace(videoRef.current, options)
      .withFaceLandmarks()
      .withFaceExpressions();

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detection) {
      onFaceDetected(true);
      faceapi.draw.drawDetections(canvas, [detection]);
      faceapi.draw.drawFaceLandmarks(canvas, [detection]);
      faceapi.draw.drawFaceExpressions(canvas, [detection]);
      if (onMoodCalculated) {
        const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
        onMoodCalculated(sorted[0][0]);
      }
    } else {
      onFaceDetected(false);
    }
  };

  useEffect(() => {
    if (!isActive || loading || paused) return;
    const interval = setInterval(detectFace, 500);
    return () => clearInterval(interval);
  }, [isActive, loading, paused]);

  if (!isActive) return null;

  return (
    <div className="facemood-container">
      {loading && <div className="loading">🎥 Loading camera...</div>}
      <video ref={videoRef} autoPlay muted playsInline style={{ display: loading ? "none" : "block" }} />
      <canvas ref={canvasRef} className="canvas-overlay" />
    </div>
  );
}
