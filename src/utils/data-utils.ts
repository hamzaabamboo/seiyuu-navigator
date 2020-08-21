import { Anime, Seiyuu, Character } from "@/store";

export const getTitle = (anime: Pick<Anime, "title">, lang = "en"): string => {
  if (lang === "en") {
    return anime.title.english || anime.title.native;
  } else {
    return anime.title.native || anime.title.english;
  }
};

export const getName = (
  person: Pick<Character | Seiyuu, "name">,
  lang = "en"
): string => {
  const enName =
    person.name.first && person.name.last
      ? `${person.name.first} ${person.name.last}`
      : person.name.first || person.name.last;
  if (lang === "en") {
    return enName || person.name.native;
  } else {
    return person.name.native || enName;
  }
};

export const getImage = (
  person: Pick<Character | Seiyuu, "image">
): string | undefined => {
  return person.image.large || person.image.medium || undefined;
};
