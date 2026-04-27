import { Send, Mic, MicOff } from "lucide-react";
import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>("");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    setSpeechSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "tr-TR"; // ближайший к туркменскому

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      const combined = (baseTextRef.current + " " + finalTranscript + interimTranscript).trim();
      setInput(combined);
      if (finalTranscript) {
        baseTextRef.current = (baseTextRef.current + " " + finalTranscript).trim();
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      baseTextRef.current = input;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onSend(trimmed);
    setInput("");
    baseTextRef.current = "";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4 md:px-8">
      <div className="max-w-3xl mx-auto relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            baseTextRef.current = e.target.value;
          }}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Diňleýär..." : "Habaryňyzy ýazyň..."}
          rows={1}
          className="w-full resize-none bg-secondary text-foreground rounded-xl px-4 py-3 pr-24 outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground scrollbar-thin text-sm"
          disabled={isLoading}
        />
        {speechSupported && (
          <button
            onClick={toggleListening}
            disabled={isLoading}
            title={isListening ? "Sesi togtat" : "Ses bilen ýazmak"}
            className={`absolute right-12 bottom-2 p-2 rounded-lg transition-colors ${
              isListening
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "bg-secondary-foreground/10 text-foreground hover:bg-secondary-foreground/20"
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2">
        Made by: Resul_Sopyyev; CEO of "Sopyyev Software"
      </p>
    </div>
  );
}
