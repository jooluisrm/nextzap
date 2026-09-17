import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // Base URL para rotas internas do Next.js
});

// Você pode adicionar interceptors aqui depois, caso queira injetar tokens automaticamente
// api.interceptors.request.use((config) => { ... })
