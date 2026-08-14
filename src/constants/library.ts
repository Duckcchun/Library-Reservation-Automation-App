export interface LibraryColor {
  name: string
  color: string
  displayName?: string
}

export const LIBRARY_COLORS: LibraryColor[] = [
  { name: "광진정보도서관", color: "#135198" },
  { name: "자양한강도서관", color: "#F15C22" },
  { name: "중곡도서관", color: "#4B7725", displayName: "중곡문화체육센터도서관" },
  { name: "자양제4동도서관", color: "#EDCA00" },
  { name: "구의제3동도서관", color: "#5F5BB3" },
  { name: "군자동도서관", color: "#E77F9B" },
  { name: "아차산숲속도서관", color: "#446E98" },
  { name: "광진어린이영어도서관", color: "#EF4036" },
  { name: "광진구새마을작은도서관", color: "#2DA144" },
  // 스마트 도서관
  { name: "군자역스마트도서관", color: "#666666" },
  { name: "중곡스마트도서관", color: "#666666" },
  { name: "구의역스마트도서관", color: "#666666" },
  { name: "광진구민체육센터스마트도서관", color: "#666666" },
  { name: "광진문화예술회관 스마트도서관", color: "#666666" },
  { name: "어린이대공원역 스마트도서관", color: "#666666" },
  { name: "아차산역 스마트도서관", color: "#666666" },
]

export function getLibraryColor(libraryName: string): string {
  const library = LIBRARY_COLORS.find((lib) => {
    // 정확히 일치하거나 displayName으로 일치하는 경우
    if (lib.name === libraryName || lib.displayName === libraryName) {
      return true
    }
    // 부분 일치하는 경우 (예: "중곡문화체육센터도서관" → "중곡도서관")
    if (libraryName.includes(lib.name) || lib.name.includes(libraryName)) {
      return true
    }
    return false
  })
  
  return library?.color || "#333333"
}

export function normalizeLibraryName(libraryName: string): string {
  // 중곡문화체육센터도서관 → 중곡도서관
  if (libraryName.includes("중곡")) {
    return "중곡도서관"
  }
  
  // 다른 도서관명 정규화
  const normalized = LIBRARY_COLORS.find((lib) => {
    return lib.displayName === libraryName || 
           libraryName.includes(lib.name) || 
           lib.name.includes(libraryName)
  })
  
  return normalized?.name || libraryName
}