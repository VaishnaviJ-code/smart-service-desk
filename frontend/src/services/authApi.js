import api from "./api";

export const loginRequest = async (email, password) => {
  const res = await api.post("/auth/login/", { email, password });
  return res.data;
};

export const registerRequest = async (payload) => {
  const res = await api.post("/auth/register/", payload);
  return res.data;
};

export const fetchProfile = async () => {
  const res = await api.get("/auth/profile/");
  return res.data;
};
