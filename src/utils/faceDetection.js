import * as faceapi from 'face-api.js';

class AdvancedFaceDetector {
  constructor() {
    this.isInitialized = false;
    this.models = {
      detection: null,
      landmarks: null,
      recognition: null,
      expression: null
    };
    this.emotions = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];
  }

  async initialize() {
    try {
      console.log('Loading face-api.js models...');
      
      // Load models from CDN
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);

      this.isInitialized = true;
      console.log('Face-api.js models loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load face-api.js models:', error);
      return false;
    }
  }

  async detectFacesAndExpressions(videoElement) {
    if (!this.isInitialized || !videoElement) {
      return null;
    }

    try {
      // Detect faces with landmarks and expressions
      const detections = await faceapi
        .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      return detections;
    } catch (error) {
      console.error('Face detection error:', error);
      return null;
    }
  }

  drawDetections(canvas, detections) {
    if (!canvas || !detections || detections.length === 0) {
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection, index) => {
      const { box } = detection.detection;
      const expressions = detection.expressions;

      // Draw face bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Find dominant expression
      const dominantExpression = Object.keys(expressions).reduce((a, b) => 
        expressions[a] > expressions[b] ? a : b
      );
      const confidence = expressions[dominantExpression];

      // Draw expression label
      const labelY = box.y - 10;
      const labelText = `${dominantExpression.toUpperCase()} (${Math.round(confidence * 100)}%)`;
      
      // Background for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillRect(box.x, labelY - 25, textWidth + 10, 30);
      
      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(labelText, box.x + 5, labelY - 5);

      // Draw landmarks (optional)
      if (detection.landmarks) {
        ctx.fillStyle = '#ff0000';
        detection.landmarks.positions.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });
  }

  getBestExpression(detections) {
    if (!detections || detections.length === 0) {
      return null;
    }

    // Get the first (usually largest) face detection
    const detection = detections[0];
    const expressions = detection.expressions;

    // Find dominant expression
    const dominantExpression = Object.keys(expressions).reduce((a, b) => 
      expressions[a] > expressions[b] ? a : b
    );

    return {
      emotion: dominantExpression,
      confidence: expressions[dominantExpression],
      allExpressions: expressions,
      faceBox: detection.detection.box,
      timestamp: new Date()
    };
  }

  dispose() {
    this.isInitialized = false;
    // face-api.js doesn't require explicit disposal
  }
}

export default AdvancedFaceDetector;