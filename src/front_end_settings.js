export async function get_settings() {
  return await window.electronAPI.getsettings();
}

export function save_settings(settings) {
  window.electronAPI.savesettings(settings);
}
