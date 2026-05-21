import { handleAlarm, handleTabUpdate } from "./traversalEngine"

chrome.alarms?.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith("utt:alarm:")) return

  const tabId = Number(alarm.name.replace("utt:alarm:", ""))
  handleAlarm(tabId)
})

chrome.tabs?.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    handleTabUpdate(tabId, changeInfo.url)
  }
})
