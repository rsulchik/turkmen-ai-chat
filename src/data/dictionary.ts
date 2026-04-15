// DICTIONARY_DATA — замените этот массив на свой словарь
// Формат: массив объектов { word: string, definition: string }
export const DICTIONARY_DATA: { word: string; definition: string }[] = [
  { word: "salam", definition: "Salamlaşma sözi, görüşende aýdylýar." },
  { word: "kitap", definition: "Ýazgylar ýerleşdirilen neşir, okamak üçin ulanylýar." },
  { word: "bilim", definition: "Ylym we maglumat toplumy, okuw arkaly gazanylýar." },
  { word: "kompýuter", definition: "Maglumat işlemek üçin elektron enjam." },
  { word: "internet", definition: "Dünýä boýunça kompýuterleri birikdirýän tor ulgamy." },
  { word: "dil", definition: "Adamlaryň aragatnaşyk serişdesi, gepleşik ulgamy." },
  { word: "mekdep", definition: "Bilim berýän okuw jaýy." },
  { word: "mugallym", definition: "Bilim berýän adam, okadyjy." },
  { word: "talyp", definition: "Ýokary okuw jaýynda bilim alýan adam." },
  { word: "watan", definition: "Adamyň doglan we ýaşaýan ýurdy." },
  { word: "türkmen", definition: "Türkmenistanyň esasy halky we dili." },
  { word: "Aşgabat", definition: "Türkmenistanyň paýtagty." },
  // Добавьте больше слов по необходимости
];

// Форматирует словарь для системного промпта
export function formatDictionaryForPrompt(): string {
  return DICTIONARY_DATA.map(d => `${d.word}: ${d.definition}`).join("\n");
}
