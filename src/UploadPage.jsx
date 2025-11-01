// src/UploadPage.jsx
import React, { useState } from 'react';
import { useQuiz } from './QuizContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function UploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleQuizUpload, totalTestTime, setTotalTestTime } = useQuiz(); 
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      const msg = 'Error: Please upload a valid .json file.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true); 
    setError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileText = e.target.result;
        const jsonData = JSON.parse(fileText);
        
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
           throw new Error("Invalid JSON format. Expected a non-empty array.");
        }

        handleQuizUpload(jsonData); 
        toast.success('Quiz loaded successfully!');
        navigate('/quiz');

      } catch (err) {
        console.error("Error parsing JSON:", err);
        const msg = `Error: ${err.message}. Please check the file content.`;
        setError(msg);
        toast.error(msg);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      const msg = "An error occurred while reading the file.";
      console.error("File reading error:", reader.error);
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="upload-layout">
      <div className="config-card">
        <h2>Test Configuration</h2>
        <p>Set the parameters for your test before uploading.</p>
        
        <div className="settings-container-vertical">
          <label htmlFor="time-input">Total test time (minutes):</label>
          <input
            id="time-input"
            type="number"
            min="1"
            step="1"
            value={totalTestTime}
            onChange={(e) => setTotalTestTime(Number(e.target.value))}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="upload-card">
        <h2>Upload Quiz</h2>
        <p>Select your .json quiz file to begin the test.</p>
        <input 
          type="file" 
          accept=".json" 
          onChange={handleFileChange} 
          disabled={isLoading}
          id="file-upload-input" // For better styling
        />
        <label htmlFor="file-upload-input" className="file-upload-label">
          {isLoading ? 'Loading...' : 'Choose File...'}
        </label>
        
        {error && <p style={{ color: 'var(--color-incorrect)', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
}

export default UploadPage;