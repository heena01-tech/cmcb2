import { useState } from 'react';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { ConversationView } from './components/conversation/ConversationView';
import { AboutPage } from './components/pages/AboutPage';
import { HomePage } from './components/pages/HomePage';
import { ToolsPage } from './components/pages/ToolsPage';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import type { PageId, ToolId } from './types/communication';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [activeTool, setActiveTool] = useState<ToolId>('tts');
  const tts = useTextToSpeech();

  const handleNavigate = (page: PageId) => {
    tts.stop();
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTool = (tool: ToolId) => {
    tts.stop();
    setActiveTool(tool);
    setActivePage('tools');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      <main id="main-content" className="app-main">
        {activePage === 'home' && (
          <HomePage onNavigate={handleNavigate} onOpenTool={handleOpenTool} />
        )}

        {activePage === 'tools' && (
          <ToolsPage
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            tts={tts}
          />
        )}

        {activePage === 'conversation' && <ConversationView tts={tts} />}

        {activePage === 'about' && <AboutPage />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
