// Türkmen halk pähimleri
export const TURKMEN_PROVERBS: { text: string; meaning?: string }[] = [
  { text: "Watan ýaly ýer bolmaz, ene-ata ýaly ynsan bolmaz." },
  { text: "Il agzybir bolsa, dag gymyldar." },
  { text: "Bilim — bahasyz hazyna." },
  { text: "Çörek — başyň täji." },
  { text: "Dost başa düşeniňde tanalýar." },
  { text: "Dilden çykan — ýaýdan çykan." },
  { text: "Az iý — köp ýaşa." },
  { text: "Akyl ýaşda däl, başda." },
  { text: "Kitap — bilimiň açary." },
  { text: "Zähmet soňy — rahatlyk." },
  { text: "Ýagşy söz ýylany hininden çykarar." },
  { text: "Adam alasy içinde, mal alasy daşynda." },
  { text: "Ýedi ölçe, bir kes." },
  { text: "Köp gepleseň — köp ýalňyşarsyň." },
  { text: "Sabyrly — myradyna ýeter." },
  { text: "Dogry söz dogan ýaly." },
  { text: "Mertlik — myradyň açary." },
  { text: "Ata gören ok ýonar, ene gören don biçer." },
  { text: "Suw görmän, aýakgabyňy çykarma." },
  { text: "Bir elin sesi çykmaz." },
];

export function getRandomProverb() {
  return TURKMEN_PROVERBS[Math.floor(Math.random() * TURKMEN_PROVERBS.length)];
}
