import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

class MediaPipeEmotionDetector {
  constructor() {
    this.faceLandmarker = null;
    this.isInitialized = false;
    this.isLoading = false;
    
    // Emotion mapping from MediaPipe blendshapes to standard emotions
    this.emotionMapping = {
      // Happy emotions
      'mouthSmileLeft': 'happy',
      'mouthSmileRight': 'happy',
      'cheekSquintLeft': 'happy',
      'cheekSquintRight': 'happy',
      
      // Sad emotions
      'mouthFrownLeft': 'sad',
      'mouthFrownRight': 'sad',
      'browDownLeft': 'sad',
      'browDownRight': 'sad',
      
      // Angry emotions
      'browLowererLeft': 'angry',
      'browLowererRight': 'angry',
      'eyeSquintLeft': 'angry',
      'eyeSquintRight': 'angry',
      
      // Surprised emotions
      'browInnerUp': 'surprised',
      'eyeWideLeft': 'surprised',
      'eyeWideRight': 'surprised',
      'jawOpen': 'surprised',
      
      // Fear emotions
      'eyeWideLeft': 'fear',
      'eyeWideRight': 'fear',
      'browInnerUp': 'fear',
      
      // Disgust emotions
      'noseSneerLeft': 'disgust',
      'noseSneerRight': 'disgust',
      'mouthUpperUpLeft': 'disgust',
      'mouthUpperUpRight': 'disgust',
    };
    
    this.emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'fear', 'disgust'];
  }

  async initialize() {
    if (this.isInitialized || this.isLoading) {
      return this.isInitialized;
    }

    this.isLoading = true;
    
    try {
      console.log('Initializing MediaPipe Face Landmarker...');
      
      // Initialize MediaPipe
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      // Create Face Landmarker with blendshapes
      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: 'VIDEO',
        numFaces: 1
      });
      
      this.isInitialized = true;
      console.log('MediaPipe Face Landmarker initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to initialize MediaPipe Face Landmarker:', error);
      this.isInitialized = false;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  analyzeBlendshapes(blendshapes) {
    if (!blendshapes || blendshapes.length === 0) {
      return { emotion: 'neutral', confidence: 0.5, allScores: {} };
    }

    // Initialize emotion scores
    const emotionScores = {
      neutral: 0.3, // Base neutral score
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      fear: 0,
      disgust: 0
    };

    // Analyze blendshapes and map to emotions
    blendshapes.forEach(blendshape => {
      const shapeName = blendshape.categoryName;
      const score = blendshape.score;
      
      if (this.emotionMapping[shapeName]) {
        const emotion = this.emotionMapping[shapeName];
        emotionScores[emotion] += score;
      }
    });

    // Apply emotion-specific logic
    this.applyEmotionLogic(emotionScores, blendshapes);

    // Find dominant emotion
    let dominantEmotion = 'neutral';
    let maxScore = emotionScores.neutral;
    
    Object.entries(emotionScores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    });

    // Normalize confidence (0-1 range)
    const confidence = Math.min(1.0, Math.max(0.1, maxScore));

    return {
      emotion: dominantEmotion,
      confidence: confidence,
      allScores: emotionScores
    };
  }

  applyEmotionLogic(emotionScores, blendshapes) {
    // Get specific blendshape values
    const getBlendshapeScore = (name) => {
      const blendshape = blendshapes.find(b => b.categoryName === name);
      return blendshape ? blendshape.score : 0;
    };

    // Happy detection logic
    const smileLeft = getBlendshapeScore('mouthSmileLeft');
    const smileRight = getBlendshapeScore('mouthSmileRight');
    const cheekRaise = (getBlendshapeScore('cheekSquintLeft') + getBlendshapeScore('cheekSquintRight')) / 2;
    
    if (smileLeft > 0.3 || smileRight > 0.3) {
      emotionScores.happy += 0.4;
      if (cheekRaise > 0.2) {
        emotionScores.happy += 0.3; // Genuine smile (Duchenne)
      }
    }

    // Sad detection logic
    const frownLeft = getBlendshapeScore('mouthFrownLeft');
    const frownRight = getBlendshapeScore('mouthFrownRight');
    const browDown = (getBlendshapeScore('browDownLeft') + getBlendshapeScore('browDownRight')) / 2;
    
    if (frownLeft > 0.2 || frownRight > 0.2) {
      emotionScores.sad += 0.4;
      if (browDown > 0.2) {
        emotionScores.sad += 0.3;
      }
    }

    // Angry detection logic
    const browLowerer = (getBlendshapeScore('browLowererLeft') + getBlendshapeScore('browLowererRight')) / 2;
    const eyeSquint = (getBlendshapeScore('eyeSquintLeft') + getBlendshapeScore('eyeSquintRight')) / 2;
    
    if (browLowerer > 0.3) {
      emotionScores.angry += 0.4;
      if (eyeSquint > 0.2) {
        emotionScores.angry += 0.3;
      }
    }

    // Surprised detection logic
    const browInnerUp = getBlendshapeScore('browInnerUp');
    const eyeWide = (getBlendshapeScore('eyeWideLeft') + getBlendshapeScore('eyeWideRight')) / 2;
    const jawOpen = getBlendshapeScore('jawOpen');
    
    if (browInnerUp > 0.3 && eyeWide > 0.3) {
      emotionScores.surprised += 0.5;
      if (jawOpen > 0.2) {
        emotionScores.surprised += 0.3;
      }
    }

    // Fear detection logic (similar to surprise but with different intensity)
    if (browInnerUp > 0.4 && eyeWide > 0.4 && jawOpen < 0.1) {
      emotionScores.fear += 0.4;
    }

    // Disgust detection logic
    const noseSneer = (getBlendshapeScore('noseSneerLeft') + getBlendshapeScore('noseSneerRight')) / 2;
    const upperLipRaise = (getBlendshapeScore('mouthUpperUpLeft') + getBlendshapeScore('mouthUpperUpRight')) / 2;
    
    if (noseSneer > 0.3 || upperLipRaise > 0.3) {
      emotionScores.disgust += 0.4;
    }

    // Reduce neutral score if any strong emotion is detected
    const maxEmotionScore = Math.max(
      emotionScores.happy, emotionScores.sad, emotionScores.angry,
      emotionScores.surprised, emotionScores.fear, emotionScores.disgust
    );
    
    if (maxEmotionScore > 0.3) {
      emotionScores.neutral = Math.max(0.1, emotionScores.neutral - maxEmotionScore);
    }
  }

  async detectEmotionFromVideo(videoElement, canvasElement) {
    if (!this.isInitialized || !this.faceLandmarker) {
      console.warn('MediaPipe Face Landmarker not initialized');
      return null;
    }

    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return null;
    }

    try {
      // Set canvas size to match video
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      
      const ctx = canvasElement.getContext('2d');
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Detect faces and blendshapes
      const results = this.faceLandmarker.detectForVideo(videoElement, performance.now());
      
      if (!results.faceBlendshapes || results.faceBlendshapes.length === 0) {
        return null;
      }

      // Analyze the first face's blendshapes
      const blendshapes = results.faceBlendshapes[0].categories;
      const emotionResult = this.analyzeBlendshapes(blendshapes);
      
      // Draw face landmarks if available
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        this.drawFaceLandmarks(ctx, results.faceLandmarks[0], canvasElement.width, canvasElement.height);
      }
      
      // Draw emotion result
      this.drawEmotionResult(ctx, emotionResult, canvasElement.width, canvasElement.height);

      return {
        emotion: emotionResult.emotion,
        confidence: emotionResult.confidence,
        allScores: emotionResult.allScores,
        blendshapes: blendshapes,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('MediaPipe emotion detection error:', error);
      return null;
    }
  }

  drawFaceLandmarks(ctx, landmarks, width, height) {
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    
    // Draw key facial landmarks
    landmarks.forEach((landmark, index) => {
      const x = landmark.x * width;
      const y = landmark.y * height;
      
      // Draw landmark points (only key points to avoid clutter)
      if (index % 5 === 0) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
    
    // Draw face outline (approximate)
    if (landmarks.length > 0) {
      const faceOutline = [
        10, 151, 9, 8, 168, 6, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
      ];
      
      ctx.beginPath();
      faceOutline.forEach((index, i) => {
        if (landmarks[index]) {
          const x = landmarks[index].x * width;
          const y = landmarks[index].y * height;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }
  }

  drawEmotionResult(ctx, emotionResult, width, height) {
    // Draw emotion label background
    const labelWidth = 250;
    const labelHeight = 80;
    const x = 20;
    const y = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, labelWidth, labelHeight);
    
    // Draw emotion text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Emotion: ${emotionResult.emotion.toUpperCase()}`, x + 10, y + 25);
    
    ctx.font = '14px Arial';
    ctx.fillText(`Confidence: ${Math.round(emotionResult.confidence * 100)}%`, x + 10, y + 45);
    
    // Draw confidence bar
    const barWidth = 200;
    const barHeight = 8;
    const barX = x + 10;
    const barY = y + 55;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(barX, barY, barWidth * emotionResult.confidence, barHeight);
    
    // Draw emotion emoji
    ctx.font = '24px Arial';
    const emojis = {
      neutral: '😐',
      happy: '😊',
      sad: '😢',
      angry: '😠',
      surprised: '😲',
      fear: '😨',
      disgust: '🤢'
    };
    ctx.fillText(emojis[emotionResult.emotion] || '😐', x + labelWidth - 40, y + 35);
  }

  dispose() {
    if (this.faceLandmarker) {
      this.faceLandmarker.close();
      this.faceLandmarker = null;
    }
    this.isInitialized = false;
  }
}

export default MediaPipeEmotionDetector;