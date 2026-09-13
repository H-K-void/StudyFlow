import React from 'react';
import { StudyFlowProvider, useStudyFlow } from './context/StudyFlowContext';
import { Navbar } from './components/layout/Navbar';
import { StepTracker } from './components/layout/StepTracker';
import { Footer } from './components/layout/Footer';
import { WorkspaceLanding } from './components/workspace/WorkspaceLanding';
import { UploadSection } from './components/upload/UploadSection';
import { ProcessingView } from './components/processing/ProcessingView';
import { RevisionNotesView } from './components/notes/RevisionNotesView';
import { QuizView } from './components/quiz/QuizView';
import { ExportModal } from './components/export/ExportModal';
import { ToastContainer } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { currentScreen } = useStudyFlow();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'workspace':
        return <WorkspaceLanding />;
      case 'upload':
        return <UploadSection />;
      case 'processing':
        return <ProcessingView />;
      case 'notes':
      case 'graph':
        return <RevisionNotesView />;
      case 'quiz':
        return <QuizView />;
      default:
        return <WorkspaceLanding />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-brand/20 selection:text-brand font-sans transition-colors duration-150">
      <Navbar />
      <StepTracker />
      <main className="flex-1 pb-16">
        {renderScreen()}
      </main>
      <Footer />
      <ExportModal />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StudyFlowProvider>
      <AppContent />
    </StudyFlowProvider>
  );
};

export default App;
