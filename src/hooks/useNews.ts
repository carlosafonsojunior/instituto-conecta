import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useNewsList(limit?: number) {
  return useQuery({
    queryKey: ["news", "list", limit],
    queryFn: async () => {
      let q = supabase.from("news").select("*").eq("published", true).order("published_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useNewsBySlug(slug?: string) {
  return useQuery({
    queryKey: ["news", "slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useAllNewsAdmin() {
  return useQuery({
    queryKey: ["news", "all-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
