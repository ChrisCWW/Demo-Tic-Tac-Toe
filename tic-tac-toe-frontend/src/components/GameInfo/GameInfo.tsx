import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MessageBox from '@/components/MessageBox/MessageBox';
import useSocket from '@/hooks/useSocket';
import { RootState } from '@/lib/store/store';
import { images } from '@/lib/utils/assets';
import { GameMode } from '@/types/GameTypes';
import styles from './GameInfo.module.css';

function GameInfo() {
  const socket = useSocket();
  const router = useRouter();
  const data = useSelector((state: RootState) => state.game);
  const [messageBox, setMessageBox] = useState(false);

  const exitGmae = () => {
    if (data.mode === GameMode.network) {
      socket?.emit('ttt-leave');
    }
    router.push('/');
  }

  const toggleMessageBox = (show: boolean) => setMessageBox(show);

  return (
    <div className={styles.info}>
      <div className={styles.boxView}>
        <div className={styles.content}>
          <Image
            className={`${styles.icon} ${!(data.turn % 2) && styles.on}`}
            src={images.circle}
            alt='Player 1 - circle'
            width={50}
            height={50}
          />
          <Image
            className={`${styles.icon} ${(data.turn % 2) && styles.on}`}
            src={images.cross}
            alt='Player 2 - cross'
            width={50}
            height={50}
          />
        </div>

        <button className={styles.exit} onClick={()=> toggleMessageBox(true)}>Exit</button>
      </div>

      { messageBox &&
        <MessageBox
          message='Leave Game?'
          button={{ name: 'Leave', action: exitGmae }}
          cancel={()=> toggleMessageBox(false)}
        />
      }
    </div>
  )
}

export default memo(GameInfo);