"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Send,
  FileText,
  Loader,
  X,
  Download,
  Sparkles,
  BookOpen,
  Check,
  User,
} from "lucide-react";
import { extractTextFromFile, ExtractedContent } from "@/lib/fileProcessor";
import { ChatMessage } from "@/lib/ollamaService";
import { cn } from "@/lib/utils";



import {
  generateQuizFromContent,
  GeneratedQuiz,
} from "@/lib/quizGenerator";
import { saveCustomQuiz } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { UserData, QuizQuestion } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface StudyAssistantChatbotProps {
  userData?: UserData | null;
}

interface ChatGeneratedQuiz {
  type: string;
  title: string;
  questions: QuizQuestion[];
}

interface AIStatusResponse {
  available: boolean;
  provider?: 'groq' | 'ollama';
}

interface OllamaStreamResponse {
  model: string;
  message?: {
    role: string;
    content: string;
  };
  done: boolean;
}

interface AIResponse {
  response: string;
}

export default function StudyAssistantChatbot({ userData }: StudyAssistantChatbotProps) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingChatQuiz, setIsSavingChatQuiz] = useState<string | null>(null);
  const [studyMaterial, setStudyMaterial] = useState<ExtractedContent | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiProvider, setAiProvider] = useState<'groq' | 'ollama' | null>(null);

  const addSystemMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: text,
        timestamp: new Date(),
      },
    ]);
  };

  const checkAIAvailability = async () => {
    try {
      const res = await fetch("/api/ai/status");
      const data = (await res.json()) as AIStatusResponse;
      setOllamaAvailable(!!data.available);
      setAiProvider(data.provider ?? null);
      if (!data.available) {
        addSystemMessage(
          "⚠️ AI is not available. Use Groq (set GROQ_API_KEY in .env.local) for fast cloud AI, or run Ollama locally on port 11434.",
        );
      } else {
        addSystemMessage(
          "✅ Study Assistant ready! Upload study materials to begin.",
        );
      }
    } catch {
      setOllamaAvailable(false);
      setAiProvider(null);
      addSystemMessage("⚠️ Could not check AI status.");
    }
  };

  // Check AI availability on mount (Groq or Ollama)
  useEffect(() => {
    checkAIAvailability();
  }, []);

  const handleSaveChatQuiz = async (quizData: ChatGeneratedQuiz, messageId: string) => {
    if (!user || !quizData) return;

    setIsSavingChatQuiz(messageId);
    try {
      await saveCustomQuiz(user.uid, {
        title: quizData.title || "Chat Generated Quiz",
        topic: quizData.title || "Chat Topic",
        description: `Generated via Study Assistant chat`,
        questions: quizData.questions,
        category: "custom",
      });

      addSystemMessage(`✅ Quiz "${quizData.title}" has been saved and published! You can find it in the Quizzes tab.`);
    } catch (error) {
      addSystemMessage(`❌ Error saving quiz: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSavingChatQuiz(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const content = await extractTextFromFile(file);
      setStudyMaterial(content);

      const isImage = file.type.startsWith("image/");
      const successMessage = isImage 
        ? `✅ Successfully uploaded and read image "${file.name}". OCR extracted ${content.text.length} characters. Ask me anything about it!`
        : `✅ Successfully uploaded "${file.name}" (${file.type}). ${content.text.length} characters extracted. Ask me any questions about this material!`;

      addSystemMessage(successMessage);

      // If it's an image and has text, we could proactively offer to explain it
      if (isImage && content.text.length > 20) {
        // Optional: Trigger a small analysis message if it's a dense image
      }
    } catch (error) {
      addSystemMessage(
        `❌ Error uploading file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !ollamaAvailable || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const conversationHistory: ChatMessage[] = messages
        .filter((m) => m.role !== "assistant" || !m.content.startsWith("✅"))
        .filter((m) => !m.content.startsWith("❌"))
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Start an empty assistant message
      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: inputValue,
            history: conversationHistory,
            studyMaterial: studyMaterial?.text,
            imageData: studyMaterial?.imageData,
            userData: userData ? {
              displayName: userData.displayName,
              username: userData.username,
              coins: userData.coins,
              loginStreak: userData.loginStreak,
              rank: userData.rank,
              totalQuizzesTaken: userData.totalQuizzesTaken,
              badges: userData.badges,
              quizStreaks: userData.quizStreaks,
              totalQuizCorrect: userData.totalQuizCorrect,
              perfectDays: userData.perfectDays
            } : null,
            stream: true, // Request streaming
          }),
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error || `API failed with status ${res.status}`);
      }

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Ollama returns JSON chunks like {"model":"...","message":{"role":"assistant","content":"..."},"done":false}
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line) as OllamaStreamResponse;
            if (data.message?.content) {
              fullContent += data.message.content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: fullContent }
                    : msg
                )
              );
            }
          } catch {
            // Partial JSON or unexpected format, skip
          }
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `❌ Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!studyMaterial || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Summarize the following material:\n\n${studyMaterial.text}`,
          history: [],
          imageData: studyMaterial.imageData,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `📝 **Summary:**\n\n${data.response}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!studyMaterial || isLoading) return;

    setIsLoading(true);
    try {
      addSystemMessage("🎯 Generating quiz questions from your material...");
      const quiz = await generateQuizFromContent(
        studyMaterial.text,
        studyMaterial.fileName,
        10,
      );

      setGeneratedQuiz(quiz);
      setQuizTitle(`${studyMaterial.fileName} - Quiz`);
      setShowQuizDialog(true);

      const message: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `🎯 **Quiz Generated!**\n\nI've created ${quiz.questions.length} quiz questions based on your material. You can save this quiz to your library or take it now!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, message]);
    } catch (error) {
      addSystemMessage(
        `❌ Error generating quiz: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!user || !generatedQuiz || !quizTitle.trim()) {
      addSystemMessage("❌ Please provide a title for the quiz");
      return;
    }

    setIsSavingQuiz(true);
    try {
      await saveCustomQuiz(user.uid, {
        title: quizTitle,
        topic: studyMaterial?.fileName || "Study Material",
        description: `Generated from ${studyMaterial?.fileName || "uploaded material"}`,
        questions: generatedQuiz.questions,
        category: "custom",
        sourceFile: studyMaterial?.fileName,
      });

      setQuizSuccess(true);
      addSystemMessage(
        `✅ Quiz saved successfully! You can now find it in the Quiz section.`,
      );

      setTimeout(() => {
        setShowQuizDialog(false);
        setGeneratedQuiz(null);
        setQuizTitle("");
        setQuizSuccess(false);
      }, 2000);
    } catch (error) {
      addSystemMessage(
        `❌ Error saving quiz: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!studyMaterial || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Create well-organized study notes from this material:\n\n${studyMaterial.text}`,
          history: [],
          imageData: studyMaterial.imageData,
        }),
      });

      const data = (await res.json()) as AIResponse;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `📚 **Study Notes:**\n\n${data.response}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeDocument = () => {
    setStudyMaterial(null);
    addSystemMessage("🗑️ Document removed. You can still continue the chat or upload a new one!");
  };

  const clearChat = () => {
    setMessages([]);
  };

  const downloadConversation = () => {
    const conversation = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(conversation),
    );
    element.setAttribute("download", "study-conversation.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-background/30 p-1 md:p-2 gap-2 w-full">
      {/* Header - Premium Redesign */}
      <div className="relative group overflow-hidden rounded-[1rem] p-0.5 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 opacity-50 blur-2xl animate-pulse" />
        <div className="relative bg-card/60 backdrop-blur-3xl rounded-[0.9rem] px-4 py-2.5 border border-white/10 flex items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-[0.8rem] bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black uppercase tracking-tight text-foreground">
                  Study <span className="text-primary">Assistant</span>
                </h1>
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 shadow-inner">
                  <div className={`h-1 w-1 rounded-full animate-pulse ${ollamaAvailable ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"}`} />
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {ollamaAvailable
                      ? `${aiProvider === "groq" ? "Groq" : "Ollama"} ONLINE`
                      : "AI OFFLINE"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={downloadConversation}
                  className="h-10 px-5 rounded-[0.8rem] bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/20 font-black uppercase tracking-[0.2em] text-[9px] transition-all duration-500 shadow-xl group/export"
                >
                  <Download className="mr-2 h-3.5 w-3.5 transition-transform duration-500 group-hover/export:scale-125 group-hover/export:rotate-12" />
                  EXPORT
                </Button>
                <Button 
                  onClick={clearChat} 
                  className="h-10 px-5 rounded-[0.8rem] bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 font-black uppercase tracking-[0.2em] text-[9px] transition-all duration-500 shadow-xl group/clear"
                >
                  <X className="mr-2 h-3.5 w-3.5 transition-transform duration-500 group-hover/clear:scale-125 group-hover/clear:rotate-12" />
                  RESET
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-6">
        {/* Chat Area - Premium Redesign */}
        <div className="flex flex-1 flex-col relative group overflow-hidden rounded-[1.5rem] p-0.5">
          <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-[1.5rem]" />
          <div className="relative h-full bg-card/10 backdrop-blur-3xl rounded-[1.4rem] flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
              {messages.length === 0 && !studyMaterial && (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-xl w-full p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl text-center space-y-6 shadow-2xl relative group/welcome overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover/welcome:opacity-100 transition-opacity duration-700" />
                    <div className="relative">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 ring-1 ring-primary/20 shadow-2xl group-hover/welcome:scale-110 group-hover/welcome:rotate-6 transition-all duration-700">
                        <BookOpen className="h-10 w-10" />
                      </div>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-foreground mb-4">
                        StudiFy <span className="text-primary">Intelligence</span>
                      </h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 leading-relaxed max-w-sm mx-auto">
                        Your personalized academic powerhouse. 
                        Upload documents to unlock deep insights, 
                        summarize complex materials, and generate 
                        intelligent quizzes in seconds.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-400`}
                  >
                    <div className={cn(
                      "max-w-[85%] md:max-w-[75%] rounded-[1.2rem] px-5 py-3 shadow-xl transition-all duration-300 hover:scale-[1.002]",
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary via-accent to-primary bg-[length:200%_auto] text-white border-0"
                        : "bg-secondary/80 backdrop-blur-3xl text-foreground border border-white/10"
                    )}>
                      <div className="whitespace-pre-wrap text-sm md:text-sm font-medium leading-relaxed tracking-wide">
                        {(() => {
                          const jsonMatch = message.content.match(/```json\n([\s\S]*?)\n```/);
                          if (jsonMatch && message.role === "assistant") {
                            try {
                              const quizData = JSON.parse(jsonMatch[1]);
                              if (quizData.type === "quiz_data") {
                                const cleanContent = message.content.replace(/```json\n[\s\S]*?\n```/, "").trim();
                                return (
                                  <div className="space-y-4">
                                    {cleanContent && <p>{cleanContent}</p>}
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                                      <div className="flex items-center gap-3">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-black uppercase tracking-wider text-primary">Interactive Quiz Ready</span>
                                      </div>
                                      
                                      <h4 className="font-bold text-base">{quizData.title}</h4>
                                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{quizData.questions.length} QUESTIONS • {quizData.questions[0]?.difficulty?.toUpperCase() || "MEDIUM"}</p>
                                      <Button 
                                        onClick={() => handleSaveChatQuiz(quizData, message.id)}
                                        disabled={isSavingChatQuiz === message.id}
                                        className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[10px] h-10 rounded-lg shadow-lg transition-all"
                                      >
                                        {isSavingChatQuiz === message.id ? (
                                          <Loader className="h-3 w-3 animate-spin mr-2" />
                                        ) : (
                                          <Download className="h-3 w-3 mr-2" />
                                        )}
                                        SAVE & PUBLISH
                                      </Button>
                                    </div>
                                  </div>
                                );
                              }
                            } catch {}
                          }
                          return message.content;
                        })()}
                      </div>
                      <div className={cn(
                        "mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-3 text-[8px] font-black uppercase tracking-[0.2em]",
                        message.role === "user" ? "text-white/70" : "text-muted-foreground"
                      )}>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1.5 rounded-md",
                            message.role === "user" ? "bg-white/20" : "bg-primary/10"
                          )}>
                            {message.role === "user" ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                          </div>
                          <span>{message.role === "user" ? "AUTHOR" : "STUDY AI"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="opacity-30">•</span>
                          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="rounded-[1.8rem] bg-secondary/80 backdrop-blur-2xl px-6 py-5 border border-primary/20 shadow-2xl">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Loader className="h-4 w-4 animate-spin text-primary" />
                          <div className="absolute inset-0 bg-primary/20 blur-lg animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">AI is analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Premium Redesign */}
            <div className="flex flex-col gap-4 p-4 md:p-6 bg-card/10 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] shrink-0">
              {studyMaterial && (
                <div className="mb-2 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between p-4 rounded-[1.2rem] bg-primary/5 border border-primary/20 backdrop-blur-3xl group/file">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary text-white shadow-2xl group-hover/file:scale-110 transition-transform duration-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black uppercase tracking-tight text-foreground">{studyMaterial.fileName}</p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                          {studyMaterial.fileType.toUpperCase()} • {studyMaterial.text.length.toLocaleString()} CHARACTERS
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeDocument}
                      className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all duration-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 text-foreground border border-white/20 font-black uppercase tracking-[0.2em] text-[9px] transition-all duration-500 shadow-xl"
                  >
                    <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                    {showAdvancedOptions ? "HIDE ANALYSIS" : "SHOW ANALYSIS"}
                  </Button>
                </div>

                {showAdvancedOptions && studyMaterial && (
                  <div className="flex flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    {[
                      { icon: BookOpen, label: 'SUMMARIZE', action: handleSummarize, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
                      { icon: Sparkles, label: 'QUIZ', action: handleGenerateQuiz, color: 'from-primary to-accent', shadow: 'shadow-primary/20' },
                      { icon: FileText, label: 'NOTES', action: handleGenerateNotes, color: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20' }
                    ].map((item) => (
                      <Button
                        key={item.label}
                        variant="outline"
                        onClick={item.action}
                        disabled={isLoading}
                        className="h-14 min-w-[120px] rounded-[1rem] bg-white/10 hover:bg-primary/20 hover:border-primary/40 text-foreground border-white/20 flex flex-col items-center justify-center gap-2 transition-all duration-500 group/action shadow-lg backdrop-blur-md"
                      >
                        <item.icon className="h-4 w-4 text-primary group-hover/action:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 sm:gap-4"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.pptx,image/*"
                />
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading || !ollamaAvailable}
                  className="h-10 w-10 sm:h-14 sm:w-14 rounded-[0.8rem] sm:rounded-[1.2rem] bg-primary text-white hover:bg-primary/90 shrink-0 transition-all duration-500 shadow-2xl hover:scale-105 active:scale-95"
                >
                  {isUploading ? (
                    <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
                <div className="flex-1 relative group/input min-w-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover/input:opacity-100 blur-xl transition-opacity duration-700" />
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={studyMaterial ? "Ask anything..." : "Upload material..."}
                    className="relative w-full h-10 sm:h-14 bg-card/40 border border-white/10 rounded-[0.8rem] sm:rounded-[1.2rem] px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-base font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-500 resize-none overflow-hidden"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim() || !ollamaAvailable}
                  className="h-10 sm:h-14 px-4 sm:px-8 rounded-[0.8rem] sm:rounded-[1.2rem] bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] hover:bg-right text-white font-black uppercase tracking-[0.25em] text-[8px] sm:text-[10px] transition-all duration-700 shadow-2xl hover:scale-105 active:scale-95 shrink-0"
                >
                  {isLoading ? (
                    <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-0 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">SEND</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
      </div>
    </div>

    {/* Quiz Creation Dialog - Premium Redesign */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="max-w-2xl bg-transparent border-0 shadow-none p-0 overflow-visible">
          <div className="relative group overflow-hidden rounded-[3rem] p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/30 to-primary/30 opacity-50 blur-2xl animate-pulse" />
            <div className="relative bg-card/60 backdrop-blur-3xl rounded-[2.9rem] border border-white/10 shadow-2xl overflow-hidden">
              <DialogHeader className="p-10 pb-0">
                <div className="flex items-center gap-6 mb-4">
                  <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-xl ring-1 ring-primary/20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-black uppercase tracking-tight text-foreground">
                      Save <span className="text-primary">Quiz</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">
                      Customize and save to your library
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-10 space-y-8">
                {quizSuccess ? (
                  <div className="flex flex-col items-center justify-center gap-6 py-12 animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-2xl ring-1 ring-emerald-500/20">
                        <Check className="h-10 w-10" />
                      </div>
                      <div className="absolute inset-0 bg-emerald-500/20 blur-2xl animate-pulse rounded-full" />
                    </div>
                    <p className="text-xl font-black uppercase tracking-[0.2em] text-emerald-500">
                      Quiz saved successfully!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {generatedQuiz && (
                      <>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4">
                            Quiz Title
                          </label>
                          <div className="relative group/input">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover/input:opacity-100 transition-opacity duration-700 rounded-[1.5rem]" />
                            <Input
                              value={quizTitle}
                              onChange={(e) => setQuizTitle(e.target.value)}
                              placeholder="e.g., Biology Chapter 5 Quiz"
                              className="h-16 rounded-[1.5rem] bg-white/5 border-white/10 focus-visible:ring-primary/20 font-black uppercase tracking-[0.1em] text-xs px-8 shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="rounded-[2rem] bg-white/5 p-6 border border-white/10 shadow-xl relative overflow-hidden group/info">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/info:opacity-100 transition-opacity duration-700" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">QUESTIONS</p>
                            <p className="text-2xl font-black text-primary">{generatedQuiz.questions.length}</p>
                          </div>
                          <div className="rounded-[2rem] bg-white/5 p-6 border border-white/10 shadow-xl relative overflow-hidden group/info">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover/info:opacity-100 transition-opacity duration-700" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">TOPIC</p>
                            <p className="text-sm font-black text-accent uppercase tracking-tight truncate">{generatedQuiz.topic}</p>
                          </div>
                        </div>

                        <div className="rounded-[2rem] bg-white/5 p-8 border border-white/10 shadow-xl space-y-6">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Questions Preview</p>
                          <div className="space-y-4">
                            {generatedQuiz.questions.slice(0, 3).map((q, idx) => (
                              <div key={idx} className="flex gap-4 group/q">
                                <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 group-hover/q:scale-110 transition-transform">
                                  {idx + 1}
                                </div>
                                <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed italic">
                                  &quot;{q.question.substring(0, 80)}...&quot;
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="p-10 pt-0 flex gap-4">
                {!quizSuccess && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowQuizDialog(false)}
                      disabled={isSavingQuiz}
                      className="h-16 flex-1 rounded-[1.5rem] bg-white/5 hover:bg-white/10 text-white border-white/10 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveQuiz}
                      disabled={isSavingQuiz || !quizTitle.trim()}
                      className="h-16 flex-[2] rounded-[1.5rem] bg-gradient-to-r from-primary to-accent text-white border-0 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      {isSavingQuiz ? (
                        <div className="flex items-center gap-3">
                          <Loader className="h-4 w-4 animate-spin" />
                          SAVING...
                        </div>
                      ) : (
                        "Save Quiz"
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
