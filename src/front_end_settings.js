export const get_settings = async () => {
  return await window.electronAPI.getsettings();
};

export const save_settings = (settings) => {
  window.electronAPI.savesettings(settings);
};
