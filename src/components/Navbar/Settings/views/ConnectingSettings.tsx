import lockIcon from "@material-symbols/svg-400/outlined/lock.svg";
import { AnimatedArtwork } from "../../../AnimatedArtwork/AnimatedArtwork.tsx";
import styles from "../Settings.module.css";

const CONNECTING_BODY = "Finishing sign-in. This takes a moment.";
const LOCK_MARK_PX = 32;

type ConnectingSettingsProps = {
  bodyId: string;
};

export function ConnectingSettings({ bodyId }: ConnectingSettingsProps) {
  return (
    <>
      <div className={styles.connectingArtwork}>
        <AnimatedArtwork compact>
          <span className={styles.lockDisc}>
            <img
              className={styles.lockMark}
              src={lockIcon}
              alt=""
              aria-hidden="true"
              width={LOCK_MARK_PX}
              height={LOCK_MARK_PX}
            />
          </span>
        </AnimatedArtwork>
      </div>
      <p id={bodyId} role="status" aria-busy="true" className={`${styles.body} ${styles.bodyCentered}`}>
        {CONNECTING_BODY}
      </p>
    </>
  );
}
