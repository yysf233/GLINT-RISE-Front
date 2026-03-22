import { useContext } from "react";
import { NoticeContext } from "./NoticeContext";

export function useNotice() {
  return useContext(NoticeContext);
}
