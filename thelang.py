import os
import unicodedata
import string
import time
import hashlib

BASE_WORD = "the"
DICT_FILE = "dict.txt"
FULLDICT_FILE = "fulldict.txt"

PINK = "\033[95m"
LIME = "\033[92m"
RED  = "\033[91m"
RESET = "\033[0m"

DIACRITICS = [chr(c) for c in range(0x0300, 0x034F)] + [chr(c) for c in range(0x0350, 0x0363)]

ENG_TO_THE = {}
THE_TO_ENG = {}

def normalize(text):
    return unicodedata.normalize("NFD", text)

def clear_console():
    os.system("cls" if os.name == "nt" else "clear")

def load_words():
    if not os.path.exists(DICT_FILE):
        return []
    with open(DICT_FILE, "r", encoding="utf-8") as f:
        return [line.strip().lower() for line in f if line.strip()]

def word_to_the(word):
    word = word.lower()
    if word in ENG_TO_THE:
        return ENG_TO_THE[word]
    # deterministic hash
    h = hashlib.sha256(word.encode("utf-8")).digest()
    n = len(DIACRITICS)
    # decide how many diacritics to use (5 to 12) to avoid collisions
    r = 5 + h[0] % 8
    diacs = [DIACRITICS[h[i+1] % n] for i in range(r)]
    the_word = normalize(BASE_WORD + ''.join(diacs))
    ENG_TO_THE[word] = the_word
    THE_TO_ENG[the_word] = word
    return the_word

def build_maps():
    ENG_TO_THE.clear()
    THE_TO_ENG.clear()
    words = load_words()
    total = len(words)
    start_time = time.time()
    bar_len = 30
    for i, word in enumerate(words, start=1):
        word_to_the(word)
        progress = i / total
        filled = int(bar_len * progress)
        elapsed = time.time() - start_time
        speed = i / elapsed if elapsed > 0 else 1
        remaining = int((total - i) / speed) if speed > 0 else 0
        mins, secs = divmod(remaining, 60)
        bar = "█" * filled + "░" * (bar_len - filled)
        print(f"\rBuilding {LIME}maps {PINK}[{bar}]{RESET} {int(progress*100)}% ({i}/{total}) ETA: {mins:02d}:{secs:02d}", end="")
    print(f"\n{PINK}Maps ready 😭{RESET}")

def add_word(word):
    word = word.lower()
    words = load_words()
    if word in words:
        print("duplicate detected 💀")
        return False
    with open(DICT_FILE, "a", encoding="utf-8") as f:
        f.write(word + "\n")
    word_to_the(word)
    return True

def word_count():
    return len(load_words())

def export_fulldict():
    with open(FULLDICT_FILE, "w", encoding="utf-8") as f:
        for word, the in ENG_TO_THE.items():
            f.write(f"{word} - {the}\n")

def translate_english_sentence(sentence):
    parts = sentence.split()
    out = []
    for p in parts:
        core = p.strip(string.punctuation)
        suffix = p[len(core):]
        if core:
            out.append(word_to_the(core) + suffix)
        else:
            out.append(p)
    
    # Capitalize first word and words after punctuation
    if out:
        out[0] = out[0].capitalize()
        for i in range(1, len(out)):
            prev = out[i-1].strip()
            if prev and prev[-1] in ".?!":
                out[i] = out[i].capitalize()
            # else it stays lowercase as returned by word_to_the("the...")
            
    return " ".join(out)

def translate_the_sentence(sentence):
    parts = sentence.split()
    out = []
    for p in parts:
        norm = normalize(p)
        core = norm.strip(string.punctuation)
        suffix = p[len(core):]
        
        # Try exact match first, then lowercase match
        if core in THE_TO_ENG:
            out.append(THE_TO_ENG[core] + suffix)
        elif core.lower() in THE_TO_ENG:
            out.append(THE_TO_ENG[core.lower()] + suffix)
        else:
            out.append(p)
            
    if out:
        out[0] = out[0].capitalize()
    return " ".join(out)

def main():
    clear_console()
    print(f"{RESET}booting cursed language engine…{RESET}")
    build_maps()
    while True:
        print("\n1) Add word")
        print("2) English → The (sentence)")
        print("3) The → English (sentence)")
        print("4) Export fulldict.txt")
        print("5) Show word count")
        print("6) Exit")
        choice = input("> ").strip()
        clear_console()
        if choice == "1":
            w = input("Word to add: ").strip()
            if add_word(w):
                print("added + rebuilt maps 🔥")
            input("\nPress Enter...")
        elif choice == "2":
            s = input("English sentence: ")
            discord = input("discord copy (y/n): ").strip().lower()
            res = translate_english_sentence(s)
            if discord == 'y':
                res += f"\n-# {s}"
            print(res)
            input("\nPress Enter...")
        elif choice == "3":
            s = input("The sentence: ")
            print(translate_the_sentence(s))
            input("\nPress Enter...")
        elif choice == "4":
            export_fulldict()
            print("fulldict.txt wiped & rebuilt 😭")
            input("\nPress Enter...")
        elif choice == "5":
            print(f"word count: {word_count()}")
            input("\nPress Enter...")
        elif choice == "6":
            break
        else:
            print("pick a number bro 😭")
            input("\nPress Enter...")

if __name__ == "__main__":
    main()
