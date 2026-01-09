import { useState } from "react";
import { Translator } from "@/components/Translator";
import { DictionaryManager } from "@/components/DictionaryManager";
import { motion } from "framer-motion";
import { Book, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"translator" | "dictionary">("translator");

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center bg-fixed text-foreground relative">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />

      <main className="relative z-10 container max-w-5xl mx-auto px-4 py-8 md:py-16">
        <header className="mb-12 text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 mb-2">
              TheDictionary
            </h1>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            A minimal, cryptographic translator for the esoteric "The" language.
          </motion.p>
        </header>

        <nav className="flex justify-center mb-12">
          <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
            <button
              onClick={() => setActiveTab("translator")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                activeTab === "translator" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Languages className="w-4 h-4" />
              Translator
            </button>
            <button
              onClick={() => setActiveTab("dictionary")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                activeTab === "dictionary" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Book className="w-4 h-4" />
              Dictionary
            </button>
          </div>
        </nav>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "translator" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="min-h-[500px]"
        >
          {activeTab === "translator" ? <Translator /> : <DictionaryManager />}
        </motion.div>
        
        <footer className="mt-20 text-center text-sm text-muted-foreground border-t border-white/5 pt-8">
          <p>© {new Date().getFullYear()} TheDictionary. Minimalist "The" Language Tool.</p>
        </footer>
      </main>
    </div>
  );
}
