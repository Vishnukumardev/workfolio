// src/components/Timer.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../../firebase'; // Adjust the path as necessary
import { ref, uploadBytes } from 'firebase/storage';
import { auth } from '../../firebase';

function Timer() {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const { name, email } = location.state || {}; // Access passed state

  const [isWorking, setIsWorking] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [workDuration, setWorkDuration] = useState(0); // in seconds
  const [intervalId, setIntervalId] = useState(null);
  const [screenshotIntervalId, setScreenshotIntervalId] = useState(null); // For screenshots
  const [screenshotCounter, setScreenshotCounter] = useState(0);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalId);
      clearInterval(screenshotIntervalId); // Clear screenshot interval on unmount
    };
  }, [intervalId, screenshotIntervalId]);

  // Start work session and capture screenshots every 60 seconds
  const handleClockIn = () => {
    setIsWorking(true);
    setWorkDuration(0);
    setScreenshotCounter(0);
    
    // Start interval for the timer
    const id = setInterval(() => {
      setWorkDuration((prev) => prev + 1); // Update every second
    }, 1000); // Update every second
    setIntervalId(id);

    // Start capturing screenshots every 60 seconds
    const screenshotId = setInterval(() => {
      if (!isOnBreak) {
        captureScreenshot();
      }
    }, 60000); // Capture every 60 seconds
    setScreenshotIntervalId(screenshotId);
  };

  const handleClockOut = () => {
    setIsWorking(false);
    clearInterval(intervalId);
    clearInterval(screenshotIntervalId); // Stop screenshots
    setIntervalId(null);
    setScreenshotIntervalId(null);
  };

  const handleStartBreak = () => {
    setIsOnBreak(true);
    clearInterval(intervalId); // Stop the timer when on break
    clearInterval(screenshotIntervalId); // Stop capturing screenshots during break
  };

  const handleEndBreak = () => {
    setIsOnBreak(false);
    
    // Resume timer for work duration
    const id = setInterval(() => {
      setWorkDuration((prev) => prev + 1); // Update every second
    }, 1000); // Update every second
    setIntervalId(id);

    // Resume capturing screenshots
    const screenshotId = setInterval(() => {
      captureScreenshot();
    }, 60000); // Capture every 60 seconds
    setScreenshotIntervalId(screenshotId);
  };

  const captureScreenshot = async () => {
    // Simulate screenshot capturing logic
    console.log('Capturing screenshot...');
    
    // Simulated screenshot data
    const screenshotBlob = new Blob(['fake screenshot data'], { type: 'image/png' });
    
    // Get current time for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Format timestamp for filename
    const userId = auth.currentUser.uid; // Get current user's ID
    const screenshotRef = ref(storage, `screenshots/${userId}-${timestamp}.png`);

    try {
      await uploadBytes(screenshotRef, screenshotBlob);
      console.log('Screenshot uploaded successfully!');
      setScreenshotCounter((prev) => prev + 1);
    } catch (error) {
      console.error('Error uploading screenshot:', error);
    }
  };

  // Helper function to format time in HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login'); // Navigate back to login screen
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Welcome, {name}!</h2>
      <div className="mb-4">
        <p>Work Duration: {formatTime(workDuration)}</p>
      </div>
      <div className="space-x-4">
        {!isWorking ? (
          <button onClick={handleClockIn} className="bg-green-600 text-white py-2 px-4 rounded">Clock In</button>
        ) : (
          <button onClick={handleClockOut} className="bg-red-600 text-white py-2 px-4 rounded">Clock Out</button>
        )}
        {!isOnBreak ? (
          <button onClick={handleStartBreak} className="bg-yellow-600 text-white py-2 px-4 rounded">Start Break</button>
        ) : (
          <button onClick={handleEndBreak} className="bg-blue-600 text-white py-2 px-4 rounded">End Break</button>
        )}
      </div>
      <button onClick={handleLogout} className="mt-4 bg-gray-600 text-white py-2 px-4 rounded">Logout</button>
    </div>
  );
}

export default Timer;
