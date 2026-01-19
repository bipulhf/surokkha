export const PERMISSION_STORAGE_KEY = "surokha-permissions-granted";

export type PermissionStatus = "granted" | "denied" | "prompt";

export async function getLocationPermission(): Promise<PermissionStatus> {
  if (typeof navigator === "undefined" || !navigator.permissions) return "prompt";
  try {
    const { state } = await navigator.permissions.query({ name: "geolocation" });
    return state as PermissionStatus;
  } catch {
    return "prompt";
  }
}

export async function getCameraPermission(): Promise<PermissionStatus> {
  if (typeof navigator === "undefined" || !navigator.permissions) return "prompt";
  try {
    const { state } = await navigator.permissions.query({ name: "camera" as PermissionName });
    return state as PermissionStatus;
  } catch {
    return "prompt";
  }
}

export async function getMicrophonePermission(): Promise<PermissionStatus> {
  if (typeof navigator === "undefined" || !navigator.permissions) return "prompt";
  try {
    const { state } = await navigator.permissions.query({ name: "microphone" as PermissionName });
    return state as PermissionStatus;
  } catch {
    return "prompt";
  }
}

export async function requestLocation(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return false;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { enableHighAccuracy: true }
    );
  });
}

export async function requestCamera(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) return false;
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: true });
    s.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

export async function requestMicrophone(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) return false;
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

export function hasAllPermissionsGranted(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(PERMISSION_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setPermissionsGranted(): void {
  try {
    localStorage.setItem(PERMISSION_STORAGE_KEY, "true");
  } catch {}
}
