import api from "@/api";

export const getIntegrations = async () => {
  const response = await api.get("/api/integrations");
  return response.data;
};

export const getGoogleConnectUrl = async () => {
  const response = await api.get("/api/integrations/google/url");
  return response.data.url;
};

export const connectInstagram = async (accessToken: string) => {
  const response = await api.post("/api/integrations/instagram", { accessToken });
  return response.data;
};

export const disconnectIntegration = async (provider: string) => {
  const response = await api.delete(`/api/integrations/${provider}`);
  return response.data;
};
