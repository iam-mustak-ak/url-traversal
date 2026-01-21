export const getActiveTabsUrl = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })

  return tab?.url
}
