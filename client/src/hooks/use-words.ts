import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertWord } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useWords() {
  return useQuery({
    queryKey: [api.words.list.path],
    queryFn: async () => {
      const res = await fetch(api.words.list.path);
      if (!res.ok) throw new Error("Failed to fetch dictionary");
      return api.words.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateWord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertWord) => {
      const res = await fetch(api.words.create.path, {
        method: api.words.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Word already exists in dictionary");
        }
        const error = await res.json();
        throw new Error(error.message || "Failed to add word");
      }
      
      return api.words.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.words.list.path] });
      toast({
        title: "Word Added",
        description: "The dictionary has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
