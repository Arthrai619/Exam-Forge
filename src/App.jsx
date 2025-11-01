import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QuizProvider } from './QuizContext'; // <-- IMPORT PROVIDER
import { Toaster } from 'react-hot-toast'; // <-- IMPORT TOASTER
import Header from './Header'; // <-- IMPORT HEADER
import UploadPage from './UploadPage';
import TakeExamPage from './TakeExamPage';
import ResultsPage from './ResultsPage';
import './App.css'; 

function App() {
  return (
    <QuizProvider> {/* <-- WRAP IN PROVIDER */}
      <div className="App"> {/* This is now the main app shell */}
        <Header /> {/* <-- RENDER HEADER */}
        
        <main className="app-content"> {/* This is the new content area */}
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/quiz" element={<TakeExamPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </main>
        
        <Toaster 
          position="top-center"
          reverseOrder={false}
        /> {/* <-- ADD TOASTER COMPONENT */}
      </div>
    </QuizProvider>
  );
}

export default App;