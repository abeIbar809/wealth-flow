export type TextStyleType = "default" | "normal" | "title" | "defaultSemiBold" | "subtitle" | "link" | "subtitleNormal" | "titleNormal" | "caption";

export const TextStyles = {
  caption: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  normal: {
    fontSize: 13,
    lineHeight: 18,
  },
  default: {
    fontSize: 14.5,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 14.5,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 29,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 24, //20
    fontWeight: "bold",
  },
  titleNormal: {
    fontSize: 29,
    lineHeight: 32,
  },
  subtitleNormal: {
    fontSize: 24, //20
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
};
