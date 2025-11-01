// src/QuizContext.jsx
import React, { createContext, useState, useContext } from 'react';

const QuizContext = createContext();

export function QuizProvider({ children }) {
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeTaken, setTimeTaken] = useState(0);
  const [totalTestTime, setTotalTestTime] = useState(20);
  
  // --- NEW STATE ---
  const [markedQuestions, setMarkedQuestions] = useState([]);

  const handleQuizUpload = (data) => {
    setQuizData(data);
    setUserAnswers({});
    setTimeTaken(0);
    setMarkedQuestions([]); // Clear marks on new quiz
  };

  const handleQuizFinish = (finalAnswers, time) => {
    setUserAnswers(finalAnswers);
    setTimeTaken(time);
  };

  const handleRestart = () => {
    setQuizData(null);
    setUserAnswers({});
    setTimeTaken(0);
    setMarkedQuestions([]);
    // We keep totalTestTime
  };

  // --- NEW HANDLER ---
  const toggleMarkQuestion = (questionNumber) => {
    setMarkedQuestions((prevMarks) => {
      if (prevMarks.includes(questionNumber)) {
        // Already marked, so unmark it
        return prevMarks.filter((qNum) => qNum !== questionNumber);
      } else {
        // Not marked, so mark it
        return [...prevMarks, questionNumber];
      }
    });
  };

  const value = {
    quizData,
    userAnswers,
    timeTaken,
    totalTestTime,
    setTotalTestTime,
    handleQuizUpload,
    handleQuizFinish,
    handleRestart,
    // --- EXPOSE NEW STATE & HANDLER ---
    markedQuestions,
    toggleMarkQuestion,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export const useQuiz = () => {
  return useContext(QuizContext);
};