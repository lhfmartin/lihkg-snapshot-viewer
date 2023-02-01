import Message from '../interfaces/message';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import styles from './MessageCard.module.css';
import moment from 'moment';
import Stack from '@mui/material/Stack';

export default function MessageCard({
  message,
  originalPosterUserId,
}: {
  message: Message;
  originalPosterUserId: Message['user']['user_id'];
}) {
  return message.status > 1 ? (
    <></>
  ) : (
    <div id={message.msg_num} className={styles.card}>
      <div className={styles.metadata}>
        <span
          className={
            message.user.user_id === originalPosterUserId
              ? styles.msgNumOp
              : styles.msgNum
          }
        >
          #{message.msg_num}
        </span>
        <span
          className={
            styles[
              message.user.level === '999'
                ? 'username--admin'
                : `username--${message.user_gender}`
            ]
          }
        >
          {message.user_nickname}
        </span>
        <span className={styles.replyTime}>
          {moment(new Date(message.reply_time * 1000)).format(
            'YYYY年M月D日 HH:mm:ss'
          )}
        </span>
      </div>
      <div className={styles.quote}>
        {message.quote && (
          <a
            href={`#${message.quote.msg_num}`}
          >{`Go to quote (#${message.quote.msg_num})`}</a>
        )}
      </div>
      <div
        className={styles.msg}
        dangerouslySetInnerHTML={{ __html: message.msg }}
      />
      <div className={styles.votes}>
        <Stack
          direction='row'
          alignItems='stretch'
          justifyContent='space-around'
          gap={2}
        >
          <Stack direction='row' alignItems='center' gap={1}>
            <ThumbUpOffAltIcon fontSize='small' /> {message.like_count}
          </Stack>
          <Stack direction='row' alignItems='center' gap={1}>
            <ThumbDownOffAltIcon fontSize='small' /> {message.dislike_count}
          </Stack>
        </Stack>
      </div>
    </div>
  );
}
