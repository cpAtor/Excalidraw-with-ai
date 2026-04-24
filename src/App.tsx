import { useState, useEffect } from 'react';
import { Excalidraw, exportToBlob, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import Sidebar from './components/Sidebar';
import { analyzeCanvas } from './services/aiCollaborator';
import { Sparkles, BrainCircuit, Layout, Moon, Sun } from 'lucide-react';

export default function App() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleAnalyze = async (message: string) => {
    if (!excalidrawAPI) return;
    
    setIsLoading(true);
    try {
      const elements = excalidrawAPI.getSceneElements();
      const files = excalidrawAPI.getFiles();
      const blob = await exportToBlob({
        elements,
        appState: { ...excalidrawAPI.getAppState(), exportWithStyle: true },
        files,
        mimeType: "image/png",
      });

      const aiResponse = await analyzeCanvas(blob, message);
      return aiResponse;
    } catch (error) {
      console.error("AI Analysis failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen w-screen bg-canvas text-main overflow-hidden font-sans ${theme}`}>
      {/* Mobile-optimized Header */}
      <header className="h-14 shrink-0 border-b border-base bg-panel/80 backdrop-blur-md flex items-center justify-between px-3 md:px-4 z-30">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
            <Layout size={18} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-main text-xs md:text-sm tracking-tight leading-none uppercase">AI CANVAS</h1>
            <p className="text-[9px] md:text-[10px] text-muted font-medium uppercase tracking-widest mt-0.5">Gemini 2.5 Vision</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
             className="p-2 mr-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 transition-colors"
           >
             {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
           </button>
           <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-full">
              <BrainCircuit size={14} className="text-indigo-600 animate-pulse" />
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 whitespace-nowrap">Collaborator Active</span>
           </div>
           <div className="md:hidden flex items-center gap-1.5 p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
              <BrainCircuit size={14} className="text-indigo-600 animate-pulse" />
           </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Workspace Area */}
        <main className="flex-1 relative min-w-0">
          <div className="absolute inset-0 excalidraw-wrapper">
            <Excalidraw 
              excalidrawAPI={(api) => setExcalidrawAPI(api)}
              theme={theme}
              UIOptions={{
                canvasActions: {
                  loadScene: true,
                  saveAsImage: true,
                  changeViewBackgroundColor: true,
                  clearCanvas: true,
                }
              }}
            >
              <WelcomeScreen>
                <WelcomeScreen.Hints.MenuHint />
                <WelcomeScreen.Hints.ToolbarHint />
                <WelcomeScreen.Hints.HelpHint />
                <WelcomeScreen.Center>
                  <WelcomeScreen.Center.Logo>
                     <div className="flex items-center gap-2 text-indigo-600 mb-4 justify-center">
                      <Sparkles size={48} />
                     </div>
                  </WelcomeScreen.Center.Logo>
                  <WelcomeScreen.Center.Heading>
                    Ready to collaborate?
                  </WelcomeScreen.Center.Heading>
                  <WelcomeScreen.Center.MenuItemHelp />
                </WelcomeScreen.Center>
              </WelcomeScreen>
              <MainMenu>
                <MainMenu.DefaultItems.SaveAsImage />
                <MainMenu.DefaultItems.ClearCanvas />
                <MainMenu.Separator />
                <MainMenu.DefaultItems.ToggleTheme />
                <MainMenu.Separator />
                <MainMenu.DefaultItems.ChangeCanvasBackground />
              </MainMenu>
            </Excalidraw>
          </div>
        </main>

        <Sidebar 
          onAnalyze={handleAnalyze} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}
