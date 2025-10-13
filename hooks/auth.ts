import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

export type Usuario = {
  id: number;
  email: string;
  name?: string;
  role: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export function useMe() {
  return useQuery<Usuario>({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/auth/me")).data as Usuario,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  // <TData, TError, TVariables>
  return useMutation<Usuario, unknown, LoginPayload>({
    mutationFn: async (payload: LoginPayload) =>
      (await api.post("/auth/login", payload)).data as Usuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation<{ ok: true }, unknown, void>({
    mutationFn: async () => (await api.post("/auth/logout")).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
