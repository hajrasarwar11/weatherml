import { useQuery } from "@tanstack/react-query";

const API_BASE = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export function useApiKeyStatus() {
  return useQuery({
    queryKey: ["weather", "api-key-status"],
    queryFn: () => fetchJson(`${API_BASE}/weather/api-key-status`),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCurrentWeather(city: string) {
  return useQuery({
    queryKey: ["weather", "current", city],
    queryFn: () => fetchJson(`${API_BASE}/weather/current?city=${encodeURIComponent(city)}`),
    enabled: !!city,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useForecast(city: string) {
  return useQuery({
    queryKey: ["weather", "forecast", city],
    queryFn: () => fetchJson(`${API_BASE}/weather/forecast?city=${encodeURIComponent(city)}`),
    enabled: !!city,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useGeocode(city: string) {
  return useQuery({
    queryKey: ["weather", "geocode", city],
    queryFn: () => fetchJson(`${API_BASE}/weather/geocode?city=${encodeURIComponent(city)}`),
    enabled: !!city,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

export function useOneCall(lat: number | null, lon: number | null) {
  return useQuery({
    queryKey: ["weather", "onecall", lat, lon],
    queryFn: () => fetchJson(`${API_BASE}/weather/onecall?lat=${lat}&lon=${lon}`),
    enabled: lat !== null && lon !== null,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
