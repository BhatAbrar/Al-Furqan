/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ayah {
  number: number;
  text: string;
  audio?: string;
  audioSecondary?: string[];
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  };
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface QuranResponse {
  code: number;
  status: string;
  data: Ayah[];
}

export async function fetchAyah(surah: number, ayah: number): Promise<{ arabic: Ayah; english: Ayah; transliteration: Ayah; audioArabic: Ayah; audioEnglish: Ayah }> {
  const url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,en.itani,en.transliteration,ar.alafasy,en.walk`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.data || 'Failed to fetch the verse. Please check the chapter and verse numbers.');
  }

  const result: QuranResponse = await response.json();
  
  if (result.code !== 200 || !result.data || result.data.length < 5) {
    throw new Error('Unexpected API response format.');
  }

  return {
    arabic: result.data[0],
    english: result.data[1],
    transliteration: result.data[2],
    audioArabic: result.data[3],
    audioEnglish: result.data[4],
  };
}

export async function fetchSurahCount(): Promise<number> {
  // Surahs are fixed at 114, but we can verify or just return constant
  return 114;
}
