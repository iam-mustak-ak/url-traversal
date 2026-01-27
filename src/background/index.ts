import { handleAlarm } from "./traversalEngine"

chrome.alarms?.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith("utt:alarm:")) return

  const tabId = Number(alarm.name.replace("utt:alarm:", ""))
  handleAlarm(tabId)
})
