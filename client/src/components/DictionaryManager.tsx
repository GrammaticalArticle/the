import { useState } from "react";
import { useWords, useCreateWord } from "@/hooks/use-words";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DictionaryManager() {
  const [newWord, setNewWord] = useState("");
  const [search, setSearch] = useState("");
  const { data: words, isLoading } = useWords();
  const createWord = useCreateWord();

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    createWord.mutate({ word: newWord.trim() }, {
      onSuccess: () => setNewWord("")
    });
  };

  const handleExport = () => {
    if (!words) return;
    const dataStr = JSON.stringify(words.map(w => w.word), null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "thedictionary_export.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredWords = words?.filter(w => 
    w.word.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dictionary</h2>
          <p className="text-muted-foreground">Manage known words for the reverse translator.</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!words?.length}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-6">
        <form onSubmit={handleAddWord} className="flex gap-3">
          <Input 
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Add new word..."
            className="bg-black/20 border-white/10"
          />
          <Button type="submit" disabled={createWord.isPending}>
            {createWord.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Add Word</span>
          </Button>
        </form>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dictionary..."
              className="pl-9 bg-black/20 border-white/10"
            />
          </div>

          <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar rounded-md bg-black/10 border border-white/5 p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Loader2 className="animate-spin mr-2" /> Loading dictionary...
              </div>
            ) : filteredWords.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No words found.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <AnimatePresence>
                  {filteredWords.map((w) => (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="px-3 py-2 rounded-md bg-white/5 border border-white/5 text-sm hover:bg-white/10 transition-colors cursor-default truncate"
                    >
                      {w.word}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground text-right">
            Total: {words?.length || 0} words
          </div>
        </div>
      </div>
    </div>
  );
}
