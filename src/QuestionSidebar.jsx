// src/QuestionSidebar.jsx
import React from 'react';

function QuestionSidebar({ 
  questionCount, 
  currentIndex, 
  answeredQuestions, 
  markedQuestions, // <-- NEW
  onJumpToQuestion,
  onEndTest          // <-- NEW
}) {
  
  const questions = Array.from({ length: questionCount }, (_, i) => i);

  return (
    <aside className="question-sidebar">
      <h3>Questions</h3>
      <nav className="question-nav-list">
        {questions.map((index) => {
          const questionNumber = index + 1;
          const isCurrent = index === currentIndex;
          const isAnswered = answeredQuestions.includes(questionNumber);
          const isMarked = markedQuestions.includes(questionNumber); // <-- NEW

          // Determine class precedence
          let className = "nav-button";
          if (isCurrent) {
            className += " current";
          } else if (isAnswered) {
            className += " answered";
          }
          
          // 'marked' can be combined with 'answered' or 'current'
          if (isMarked) { 
            className += " marked";
          }

          return (
            <button
              key={questionNumber}
              className={className}
              onClick={() => onJumpToQuestion(index)}
              aria-label={`Jump to question ${questionNumber}`}
            >
              {questionNumber}
            </button>
          );
        })}
      </nav>
      
      {/* --- NEW "END TEST" BUTTON --- */}
      <div className="sidebar-footer">
        <button className="btn-end-test" onClick={onEndTest}>
          End Test
        </button>
      </div>
    </aside>
  );
}

export default QuestionSidebar;