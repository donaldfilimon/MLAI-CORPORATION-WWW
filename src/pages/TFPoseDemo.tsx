import React, { useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';

const TFPoseDemo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const detectionRequested = useRef(false);

  useEffect(() => {
    let mounted = true;
    let resizeHandler: (() => void) | null = null;

    const loadModelAndDetect = async () => {
      if (!mounted) return;
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically load TensorFlowJS and the pose detection model
        const tf = await import('@tensorflow/tfjs');
        // Using MoveNet for pose detection (lightweight and accurate)
        const { load } = await import('@tensorflow-models/posenet');

        const net = await load({
          architecture: 'MobileNetV1',
          outputStride: 16,
          inputResolution: 200,
          multiplier: 0.5,
        });

        if (!mounted) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) {
          throw new Error('Media elements not found');
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Set canvas size to match video
        const setCanvasSize = () => {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        };

        resizeHandler = setCanvasSize;
        setCanvasSize();
        window.addEventListener('resize', resizeHandler);

        const detectPose = async () => {
          if (!mounted) return;
          try {
            const pose = await net.estimateSinglePose(video, {
              flipHorizontal: false,
              // decodingMethod removed due to type issues; default behavior is used
            });

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Draw keypoints
            ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            pose.keypoints.forEach((keypoint: any) => {
              if (keypoint.score > 0.5) {
                const x = (keypoint.position.x / video.videoWidth) * canvas.width;
                const y = (keypoint.position.y / video.videoHeight) * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
              }
            });

            // Draw skeleton (optional)
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
            ctx.lineWidth = 2;
            const skeleton = [
              [5, 7], [7, 9], [6, 8], [8, 10], // Arms
              [5, 6], [5, 11], [6, 12], [11, 12], // Torso
              [11, 13], [13, 15], [12, 14], [14, 16] // Legs
            ];
            skeleton.forEach(([i, j]) => {
              const keypointI = pose.keypoints[i];
              const keypointJ = pose.keypoints[j];
              if (keypointI.score > 0.5 && keypointJ.score > 0.5) {
                const x1 = (keypointI.position.x / video.videoWidth) * canvas.width;
                const y1 = (keypointI.position.y / video.videoHeight) * canvas.height;
                const x2 = (keypointJ.position.x / video.videoWidth) * canvas.width;
                const y2 = (keypointJ.position.y / video.videoHeight) * canvas.height;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
              }
            });

            // Request next frame
            if (detectionRequested.current) {
              requestAnimationFrame(detectPose);
            }
          } catch (err) {
            console.error('Pose detection error:', err);
            // Continue trying
            if (detectionRequested.current && mounted) {
              requestAnimationFrame(detectPose);
            }
          }
        };

        // Start video stream
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;

          video.play().then(() => {
            setIsLoading(false);
            detectionRequested.current = true;
            requestAnimationFrame(detectPose);
          }).catch((err) => {
            throw new Error(`Could not play video: ${err}`);
          });
        } else {
          throw new Error('Webcam not available');
        }

      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      }
    };

    // Check if webcam is available
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      loadModelAndDetect();
    } else {
      setError('Webcam not available on this device');
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      detectionRequested.current = false;
      // Stop video stream if it exists
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream | null;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
      // Remove resize listener
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <PageHeader
          id="tf-pose-demo-heading"
          tag="AI POSE DETECTION DEMO"
          title="TensorFlowJS Pose Detection"
          subtitle="Real-time human pose estimation using TensorFlowJS and your webcam."
        />
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 mr-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
            Loading model and accessing webcam...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <PageHeader
          id="tf-pose-demo-heading"
          tag="AI POSE DETECTION DEMO"
          title="TensorFlowJS Pose Detection"
          subtitle="Real-time human pose estimation using TensorFlowJS and your webcam."
        />
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">
            Error: {error}
          </p>
        </div>
        <div className="text-center py-12">
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <PageHeader
        id="tf-pose-demo-heading"
        tag="AI POSE DETECTION DEMO"
        title="TensorFlowJS Pose Detection"
        subtitle="Real-time human pose estimation using TensorFlowJS and your webcam."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How it works</h3>
          <p className="mb-4">
            This demo uses TensorFlowJS and the PoseNet model to detect human pose in real-time from your webcam feed.
            The model identifies key points on the body (like shoulders, elbows, knees, etc.) and draws them on the canvas.
          </p>
          <p className="mb-4">
            <strong>Note:</strong> No video or personal data leaves your browser. All processing happens locally.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => {
                detectionRequested.current = false;
                // Reset the component by reloading
                window.location.reload();
              }}
              variant="outline"
            >
              Reset Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TFPoseDemo;