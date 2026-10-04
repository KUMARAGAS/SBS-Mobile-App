import type { TokenCache } from "@clerk/expo";
import type * as SecureStoreType from "expo-secure-store";
import { requireOptionalNativeModule } from "expo-modules-core";

/**
 * Session token cache that prefers expo-secure-store but falls back to
 * memory when the native module is unavailable (stale dev client, Expo Go, web).
 *
 * IMPORTANT: expo-secure-store calls requireNativeModule() at import time,
 * so a static import would crash the app on runtimes without the module.
 * requireOptionalNativeModule() returns null instead of throwing.
 */
const SecureStore =
  requireOptionalNativeModule<typeof SecureStoreType>("ExpoSecureStore");

const memoryFallback = new Map<string, string>();

async function getToken(key: string): Promise<string | null> {
  try {
    if (SecureStore) return await SecureStore.getItemAsync(key);
  } catch {
    // fall through to memory
  }
  return memoryFallback.get(key) ?? null;
}

async function saveToken(key: string, value: string): Promise<void> {
  try {
    if (SecureStore) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
  } catch {
    // fall through to memory
  }
  memoryFallback.set(key, value);
}

async function clearToken(key: string): Promise<void> {
  try {
    if (SecureStore) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
  } catch {
    // fall through to memory
  }
  memoryFallback.delete(key);
}

export const tokenCache: TokenCache = { getToken, saveToken, clearToken };
