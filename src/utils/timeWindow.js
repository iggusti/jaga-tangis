export function isMonitoringWindow(date = new Date()) {
  const h = date.getHours();
  return h >= 18 || h < 6;
}

export function getWindowLabel(date = new Date()) {
  return isMonitoringWindow(date) ? 'Aktif (18.00 - 06.00)' : 'Non-aktif';
}
