import artwork400 from "../../assets/loading/loading_page-400.png";
import artwork400Webp from "../../assets/loading/loading_page-400.webp";
import artwork800 from "../../assets/loading/loading_page-800.png";
import artwork800Webp from "../../assets/loading/loading_page-800.webp";
import { AnimatedArtwork } from "./AnimatedArtwork.tsx";
import styles from "./LoadingPage.module.css";
import { useLoadingPage } from "./useLoadingPage.ts";
import { useRotatingCaption } from "./useRotatingCaption.ts";

const ARTWORK_W = 400;
const ARTWORK_H = 400;
const ARTWORK_ALT = "Tanuki calligraphing by lamplight while your lesson loads";
const ARTWORK_SIZES = "(max-width: 48rem) calc(100vw - 2rem), 400px";

type LoadingPageProps = {
  kanjiUserInput: string;
  onDone: (tanukiKanjiLessonOutput: string) => void;
};

export function LoadingPage({ kanjiUserInput, onDone }: LoadingPageProps) {
  useLoadingPage(kanjiUserInput, onDone);
  const caption = useRotatingCaption();

  return (
    <div className={styles.page}>
      <AnimatedArtwork>
        <picture>
          <source type="image/webp" srcSet={`${artwork400Webp} 400w, ${artwork800Webp} 800w`} sizes={ARTWORK_SIZES} />
          <img
            src={artwork400}
            srcSet={`${artwork400} 400w, ${artwork800} 800w`}
            sizes={ARTWORK_SIZES}
            alt={ARTWORK_ALT}
            width={ARTWORK_W}
            height={ARTWORK_H}
            decoding="async"
          />
        </picture>
      </AnimatedArtwork>
      <p role="status" aria-live="polite" aria-busy="true" className={styles.caption}>
        {caption}
      </p>
    </div>
  );
}
