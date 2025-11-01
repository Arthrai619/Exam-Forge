// src/TakeExamPage.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuiz } from './QuizContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionSidebar from './QuestionSidebar';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

function TakeExamPage() {
  const { 
    quizData, 
    handleQuizFinish, 
    totalTestTime,
    markedQuestions,       // <-- NEW
    toggleMarkQuestion     // <-- NEW
  } = useQuiz(); 
  
  const navigate = useNavigate(); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [direction, setDirection] = useState(1); // For animation direction

  // Effect to protect the route if no quiz data is loaded
  useEffect(() => {
    if (!quizData) {
      navigate('/');
    }
  }, [quizData, navigate]);

  // Memoize the total time in seconds
  const totalTimeInSeconds = useMemo(() => {
    return (totalTestTime || 20) * 60; 
  }, [totalTestTime]);
  
  const [timeLeft, setTimeLeft] = useState(totalTimeInSeconds);
  
  // Use a ref to store the latest answers for auto-submit on timeout
  const answersRef = useRef(selectedAnswers);
  answersRef.current = selectedAnswers;

  // Effect to set up the master timer
  useEffect(() => {
    if (!quizData) return; // Don't start if no quiz
    setTimeLeft(totalTimeInSeconds); // Reset timer when quiz loads
    
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Cleanup interval on unmount
    return () => clearInterval(timerId);
  }, [quizData, totalTimeInSeconds]);

  // Effect to auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && quizData) { 
      const timeTaken = totalTimeInSeconds; // Total time elapsed
      handleQuizFinish(answersRef.current, timeTaken); // Use ref for latest answers
      navigate('/results'); 
    }
  }, [timeLeft, quizData, totalTimeInSeconds, handleQuizFinish, navigate]);

  // Memoize the list of answered question numbers
  const answeredQuestions = useMemo(() => {
    return Object.keys(selectedAnswers)
      .filter(key => selectedAnswers[key] && selectedAnswers[key].length > 0)
      .map(Number); // Convert keys from string to number
  }, [selectedAnswers]);

  // Handler for jumping to a question from the sidebar
  const handleJumpToQuestion = (index) => {
    if (index > currentQuestionIndex) {
      setDirection(1);
    } else if (index < currentQuestionIndex) {
      setDirection(-1);
    }
    setCurrentQuestionIndex(index);
  };

  // Guard clause: If quizData isn't loaded, don't render (redirect will happen)
  if (!quizData) {
    return null; 
  }

  // --- Current Question Logic ---
  const currentQuestion = quizData[currentQuestionIndex];
  const isMultiChoice = currentQuestion.answer.length > 1;
  const options = Object.entries(currentQuestion.options);

  // Handler for selecting/deselecting an answer
  const handleAnswerSelect = (optionKey) => {
    const questionNumber = currentQuestion.question_number;
    const currentSelections = selectedAnswers[questionNumber] || [];
    let newSelections;
    
    if (isMultiChoice) {
      // Checkbox logic
      if (currentSelections.includes(optionKey)) {
        newSelections = currentSelections.filter((key) => key !== optionKey);
      } else {
        newSelections = [...currentSelections, optionKey];
      }
    } else {
      // Radio button logic
      newSelections = [optionKey];
    }
    setSelectedAnswers({ ...selectedAnswers, [questionNumber]: newSelections });
  };

  // --- Navigation Handlers ---

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setDirection(1); 
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleFinishClick = () => {
    const timeTaken = totalTimeInSeconds - timeLeft; 
    handleQuizFinish(selectedAnswers, timeTaken);
    navigate('/results'); 
  };

  const handleEndTest = () => {
    // Show a confirmation dialog
    if (window.confirm("Are you sure you want to end the test?")) {
      handleFinishClick();
    }
  };

  const handleMarkClick = () => {
    toggleMarkQuestion(currentQuestion.question_number);
  };
  
  const isCurrentQuestionMarked = markedQuestions.includes(currentQuestion.question_number);

  // Helper to see if an option is checked
  const isChecked = (optionKey) => {
    return (selectedAnswers[currentQuestion.question_number] || []).includes(optionKey);
  }

  // Animation variants for Framer Motion
  const questionVariants = {
    enter: (direction) => ({ x: direction > 0 ? 500 : -500, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 500 : -500, opacity: 0 }),
  };

  return (
    <div className="quiz-layout-container">
      <QuestionSidebar 
        questionCount={quizData.length}
        currentIndex={currentQuestionIndex}
        answeredQuestions={answeredQuestions}
        markedQuestions={markedQuestions}
        onJumpToQuestion={handleJumpToQuestion}
        onEndTest={handleEndTest}
      />
      
      <div className="page-container quiz-content-area" style={{ overflow: 'hidden' }}> 
        <div className="quiz-header">
          <div className="progress-indicator">
            Question {currentQuestionIndex + 1} of {quizData.length}
          </div>
          <div className="timer">
            Time Left: <span className={timeLeft <= 30 ? 'time-low' : ''}>{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* --- ANIMATION FIX: mode="wait" --- */}
        {/* This ensures the old question animates out before the new one animates in */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentQuestionIndex} // The 'key' is crucial for AnimatePresence
            custom={direction}
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            <h2 className="question-text">
              {currentQuestion.question_number}. {currentQuestion.question}
            </h2>
            
            {isMultiChoice && <p style={{color: "var(--color-text-secondary)", marginTop: "-1rem", marginBottom: "1rem"}}>(Select all that apply)</p>}

            <ul className="options-list">
              {options.map(([key, value]) => (
                <li key={key} className="option-item">
                  <label>
                    <input
                      type={isMultiChoice ? 'checkbox' : 'radio'}
                      name={`question-${currentQuestion.question_number}`}
                      value={key}
                      checked={isChecked(key)}
                      onChange={() => handleAnswerSelect(key)}
                    />
                    {value}
                  </label>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <div className="navigation-buttons">
          <button 
            className={`btn-secondary btn-mark ${isCurrentQuestionMarked ? 'marked' : ''}`}
            onClick={handleMarkClick}
          >
            {isCurrentQuestionMarked ? 'Unmark Review' : 'Mark for Review'}
          </button>
          
          <div style={{ flex: 1 }}></div> {/* Spacer */}

          {currentQuestionIndex < quizData.length - 1 ? (
            <button className="btn-primary" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button className="btn-finish" onClick={handleFinishClick}>
              Finish Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TakeExamPage;