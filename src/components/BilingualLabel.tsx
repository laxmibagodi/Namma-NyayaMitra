import React from "react";
import { useAuth } from "../context/AuthContext";

interface BilingualLabelProps {
  en: string;
  hi: string;
  classNameEn?: string;
  classNameHi?: string;
}

export default function BilingualLabel({
  en,
  hi,
  classNameEn = "text-[15px] text-text font-medium",
  classNameHi = "text-[12px] text-muted font-normal italic leading-snug",
}: BilingualLabelProps) {
  const { nativeLanguage } = useAuth();

  if (nativeLanguage === "Hindi") {
    return <span className={classNameEn}>{hi}</span>;
  }

  return <span className={classNameEn}>{en}</span>;
}
