import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInstituteInfo() {
  return useQuery({
    queryKey: ["institute_info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institute_info")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

