import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/MapUtils";
import { Bot, Brain, AudioLines, Download } from "lucide-react";
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import usePreferencesStore from "@/lib/preferenceStore";

type LLMLoadProgress = {
  progress: number;
  timeElapsed: number;
  text: string;
};

const textToSpeech = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
};

const Assistant = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [llmProgress, setLLMProgress] = useState<LLMLoadProgress>({
    progress: -1,
    timeElapsed: 0,
    text: "Not yet started",
  });
  const [mlcEngine, setMLCEngine] = useState<MLCEngine | null>(null);
  const { enableTTS } = usePreferencesStore();

  const initProgressCallback = (progressUpdate: LLMLoadProgress) => {
    setLLMProgress(progressUpdate);
    console.log("Model loading progress:", progressUpdate);
  };

  const loadLLM = async () => {
    try {
      console.log("Loading LLM...");
      const engine = await CreateMLCEngine(
        "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        {
          initProgressCallback,
        },
      );

      setMLCEngine(engine);
      console.log("LLM loaded");
    } catch (error) {
      console.error("Error loading LLM:", error);
      setLLMProgress({
        progress: -1,
        timeElapsed: llmProgress.timeElapsed,
        text: "Failed to load",
      });
    }
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const startVoiceRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
    };
  };

  useEffect(() => {
    if (!query.trim() || mlcEngine === null) return;
    const timer = setTimeout(async () => {
      const stream = await mlcEngine.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a web assistant made to provide answers to maps and other geographical questions and data, mostly relating to India.",
          },
          { role: "user", content: query },
        ],
        stream: true,
      });

      let res = "";
      for await (const chunk of stream) {
        res += chunk.choices[0].delta.content || "";
        setResponse(res);
      }

      if (enableTTS && res) {
        textToSpeech(res);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, mlcEngine, enableTTS]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Bot />
      </Button>
      <Dialog.Root
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) {
            setQuery("");
            setResponse("");
            speechSynthesis.cancel();
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/10 z-999">
            <Dialog.Content className="fixed top-20 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-[500px] bg-white p-4 shadow-md rounded-lg">
              <Dialog.Title />
              <Dialog.Description />
              <div className="flex items-center gap-2">
                <Brain size={24} />
                <input
                  autoFocus
                  type="text"
                  disabled={llmProgress.progress < 1}
                  placeholder="What do you need help with?"
                  value={query}
                  onChange={(e) => {
                    speechSynthesis.cancel();
                    setResponse("");
                    setQuery(e.target.value);
                  }}
                  className="w-full p-1 border-none rounded focus:outline-hidden"
                />
                <Button onClick={startVoiceRecognition}>
                  <AudioLines />
                </Button>
                {llmProgress.progress === -1 && (
                  <Button onClick={loadLLM}>
                    <Download />
                  </Button>
                )}
              </div>
              {llmProgress.progress < 1 && (
                <div className="mt-2">
                  <Progress value={llmProgress.progress * 100} />
                  <div className="text-xs mt-1">
                    Time: {llmProgress.timeElapsed}s - {llmProgress.text}
                  </div>
                </div>
              )}
              {response && (
                <div className="mt-4 p-1 text-md max-h-[40vh] overflow-y-auto text-gray-800">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default Assistant;
