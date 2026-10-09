import artwork from "../../assets/loading/stitch-tanuki-artwork.jpg";
import styles from "./LoadingPage.module.css";
import { LOADING_CAPTIONS } from "./loadingCaptions.ts";
import { useLoadingPage } from "./useLoadingPage.ts";

const ARTWORK_W = 512;
const ARTWORK_H = 512;
const ARTWORK_ALT = "Tanuki calligraphing by lamplight while your lesson loads";

type LoadingPageProps = {
  kanjiUserInput: string;
  onDone: (tanukiKanjiLessonOutput: string) => void;
};

export function LoadingPage({ kanjiUserInput, onDone }: LoadingPageProps) {
  useLoadingPage(kanjiUserInput, onDone);

  return (
    <div className={styles.page}>
      <picture className={styles.visual}>
        <img
          className={styles.artwork}
          src={artwork}
          alt={ARTWORK_ALT}
          width={ARTWORK_W}
          height={ARTWORK_H}
          decoding="async"
        />
      </picture>
      <p role="status" aria-live="polite" aria-busy="true" className={styles.caption}>
        {LOADING_CAPTIONS[0]}
      </p>
    </div>
  );
}
