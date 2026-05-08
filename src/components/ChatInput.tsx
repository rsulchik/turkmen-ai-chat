import { Send, Mic, MicOff, Paperclip, X, Square } from "lucide-react";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  isLoading: boolean;
  onStop?: () => void;
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChatInput({ onSend, isLoading, onStop }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    recognition.lang = "tr-TR";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
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
      try { recognition.stop(); } catch {}
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

  const handleFiles = async (files: FileList | File[]) => {
    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast({ title: "Surat aşa uly", description: "Maksimum 4 MB.", variant: "destructive" });
      return;
    }
    try {
      const url = await fileToDataUrl(file);
      setImages([url]);
    } catch {
      toast({ title: "Suraty ýükläp bolmady", variant: "destructive" });
    }
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if ((!trimmed && images.length === 0) || isLoading) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onSend(trimmed || (images.length ? "Bu suraty türkmençe düşündir." : ""), images);
    setInput("");
    setImages([]);
    baseTextRef.current = "";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="glass border-t border-accent/20 p-4 md:px-8"
      onDragOver={(e) => { e.preventDefault(); }}
      onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
    >
      <div className="max-w-3xl mx-auto">
        {images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {images.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt="surat" className="h-20 w-20 object-cover rounded-lg border border-accent/30" />
                <button
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground shadow-md hover:scale-110 transition-transform"
                  aria-label="Aýyr"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative rounded-2xl bg-secondary/60 backdrop-blur-md border border-border/60 focus-within:border-accent/60 focus-within:shadow-glow transition-all">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              baseTextRef.current = e.target.value;
            }}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Diňleýär..." : "Habaryňyzy ýazyň ýa-da surat goşuň..."}
            rows={1}
            className="w-full resize-none bg-transparent text-foreground rounded-2xl pl-12 pr-24 py-3.5 outline-none placeholder:text-muted-foreground scrollbar-thin text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Surat goşmak"
            className="absolute left-2 bottom-2 p-2 rounded-xl bg-background/60 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all"
          >
            <Paperclip size={16} />
          </button>
          {speechSupported && (
            <button
              onClick={toggleListening}
              disabled={isLoading}
              title={isListening ? "Sesi togtat" : "Ses bilen ýazmak"}
              className={`absolute right-12 bottom-2 p-2 rounded-xl transition-all ${
                isListening
                  ? "bg-carpet text-carpet-foreground animate-pulse"
                  : "bg-background/60 text-muted-foreground hover:text-accent hover:bg-accent/10"
              }`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
          {isLoading && onStop ? (
            <button
              onClick={onStop}
              title="Generasiýany togtat"
              className="absolute right-2 bottom-2 p-2 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition-all animate-pulse"
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={(!input.trim() && images.length === 0) || isLoading}
              className="absolute right-2 bottom-2 p-2 rounded-xl bg-gradient-primary text-primary-foreground disabled:opacity-40 disabled:hover:shadow-none hover:shadow-emerald transition-all"
            >
              <Send size={16} />
            </button>
          )}
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-2.5 tracking-wide">
          Made by <span className="text-accent">Resul Sopyyev</span> · CEO of <span className="text-accent">Sopyyev Software</span>
        </p>
      </div>
    </div>
  );
}
