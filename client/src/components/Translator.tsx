import { useState, useEffect } from "react";
import { useWords } from "@/hooks/use-words";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRightLeft, Copy, Check, Loader2 } from "lucide-react";
import { wordToThe, translateEnglishToThe } from "@/lib/translator-client";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import clsx from "clsx";

export function Translator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"eng-to-the" | "the-to-eng">("eng-to-the");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: words } = useWords();
  const { toast } = useToast();

  const [reverseMap, setReverseMap] = useState<Map<string, string>>(new Map());

  // Build reverse map when words change or component mounts
  useEffect(() => {
    if (!words) return;
    
    const buildMap = async () => {
      const map = new Map<string, string>();
      for (const w of words) {
        const theWord = await wordToThe(w.word);
        map.set(theWord, w.word);
        // Also map lowercase version for robust lookup
        map.set(theWord.toLowerCase(), w.word); 
      }
      setReverseMap(map);
    };
    
    buildMap();
  }, [words]);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setIsTranslating(true);
    
    try {
      if (mode === "eng-to-the") {
        const result = await translateEnglishToThe(input);
        setOutput(result);
      } else {
        // The -> English Logic
        const parts = input.split(/(\s+|[^\w\s'])/g); // Keep delimiters
        const translatedParts = parts.map(part => {
           // Skip whitespace/punctuation for lookup
           if (!/[a-zA-Z]/.test(part)) return part;
           
           // Normalize input part just in case (NFD)
           const normalizedPart = part.normalize("NFD");
           const lower = normalizedPart.toLowerCase();
           
           // Try exact match then lowercase
           if (reverseMap.has(normalizedPart)) return reverseMap.get(normalizedPart)!;
           if (reverseMap.has(lower)) return reverseMap.get(lower)!;
           
           return part; // Return as is if unknown
        });
        
        // Capitalize sentence
        let result = translatedParts.join("");
        if (result.length > 0) result = result.charAt(0).toUpperCase() + result.slice(1);
        
        setOutput(result);
      }
    } catch (err) {
      toast({
        title: "Translation Failed",
        description: "Something went wrong while translating.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDiscordCopy = () => {
    if (!output) return;
    const textToCopy = `${output}\n-# ${input}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied for Discord", description: "Format: Translated text + subtext" });
  };

  const handleRegularCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Translator</h2>
          <p className="text-muted-foreground">Translate between English and The.</p>
        </div>
        
        <Tabs 
          value={mode} 
          onValueChange={(v) => {
             setMode(v as any);
             setInput("");
             setOutput("");
          }}
          className="mt-4 md:mt-0"
        >
          <TabsList className="bg-black/20 border border-white/10">
            <TabsTrigger value="eng-to-the">English → The</TabsTrigger>
            <TabsTrigger value="the-to-eng">The → English</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Side */}
        <div className="glass-card rounded-xl p-6 flex flex-col gap-4 min-h-[400px]">
          <label className="text-sm font-medium text-muted-foreground">
            {mode === "eng-to-the" ? "English Input" : "The Input"}
          </label>
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "eng-to-the" ? "Type something..." : "Type The the..."}
            className="flex-1 text-lg font-normal bg-transparent border-0 ring-0 focus-visible:ring-0 p-0 resize-none placeholder:text-muted-foreground/50"
          />
          <div className="pt-4 border-t border-white/5 flex justify-end">
             <Button 
               onClick={handleTranslate} 
               disabled={!input.trim() || isTranslating}
               className="w-full sm:w-auto"
             >
               {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
               Translate
             </Button>
          </div>
        </div>

        {/* Output Side */}
        <motion.div 
          className="glass-card rounded-xl p-6 flex flex-col gap-4 min-h-[400px] bg-white/[0.02]"
          animate={{ opacity: output ? 1 : 0.8 }}
        >
          <label className="text-sm font-medium text-muted-foreground flex justify-between">
            <span>{mode === "eng-to-the" ? "The Output" : "English Output"}</span>
            {output && <span className="text-xs text-emerald-400">Translated</span>}
          </label>
          
          <div className={clsx(
            "flex-1 text-lg whitespace-pre-wrap leading-relaxed",
            !output && "text-muted-foreground/30 italic"
          )}>
            {output || "Translation will appear here..."}
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-end">
             {mode === "eng-to-the" && (
                <Button 
                  variant="secondary" 
                  onClick={handleDiscordCopy}
                  disabled={!output}
                  className="w-full sm:w-auto"
                >
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <span className="mr-2 font-mono text-xs">#</span>}
                  Discord Copy
                </Button>
             )}
             <Button 
               variant="outline" 
               onClick={handleRegularCopy}
               disabled={!output}
               className="w-full sm:w-auto"
             >
               {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
               Copy
             </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
