import { ChangeEvent, createContext, useEffect, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import styles from './ThreadViewer.module.css';
import Message from '../interfaces/message';
import MessageCard from './MessageCard';
import Fab from '@mui/material/Fab';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import decodeHtml from '../utils/decodeHtml';

export const PushClickedQuoteFromMsgNumsContext = createContext<Function>(
  (from_msg_num: string, to_msg_num: string) => {},
);

function ThreadViewer() {
  const [showDirectoryInput, setShowDirectoryInput] = useState(true);
  const [title, setTitle] = useState('');
  const [processedMessages, setProcessedMessages] = useState<Message[]>([]);
  const objectUrls = useRef(new Set<string>());
  const [clickedQuoteFromMsgNums, setClickedQuoteFromMsgNums] = useState<
    string[]
  >([]);
  const [reverseTitleAndInputOrder, setReverseTitleAndInputOrder] =
    useState(true);
  const messageCardIdsInViewport = useRef(new Set<number>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            messageCardIdsInViewport.current.add(parseInt(entry.target.id));
          } else {
            messageCardIdsInViewport.current.delete(parseInt(entry.target.id));
          }
          setClickedQuoteFromMsgNums((clickedQuoteFromMsgNums) => {
            clickedQuoteFromMsgNums = clickedQuoteFromMsgNums.filter(
              (x) =>
                parseInt(x) > Math.min(...messageCardIdsInViewport.current),
            );
            return clickedQuoteFromMsgNums;
          });
        });
      },
      {
        rootMargin: '1px 0px 0px 0px',
        threshold: [0],
      },
    );

    for (let i = 0; i < processedMessages.length; i++) {
      let element = document.getElementById(`${i + 1}`);
      if (element) observer.observe(element);
    }

    return () => {
      observer.disconnect();
      messageCardIdsInViewport.current.clear();
    };
  }, [processedMessages.length]);

  useEffect(() => {
    document.title = (title && title + ' | ') + 'LIHKG Snapshot Viewer';
  }, [title]);

  function findImageSrcs(msg: string) {
    return Array.from(msg.matchAll(/ src="(.*?)"/g)).map((x) => x[1]);
  }

  function findFile(name: string, files: File[]) {
    return files.filter((x) => x.webkitRelativePath.endsWith(name))[0];
  }

  async function parseFiles(input: HTMLInputElement) {
    objectUrls.current.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
      objectUrls.current.delete(objectUrl);
    });

    window.location.hash = '';

    setTitle('');
    setProcessedMessages([]);
    setReverseTitleAndInputOrder(true);
    setClickedQuoteFromMsgNums([]);

    if (input.files!.length === 0) {
      return;
    }

    let files: File[] = Array.from(input.files!);

    let topicFile: File = findFile('topic.json', files);

    setTitle(JSON.parse(await topicFile.text()).title);
    setShowDirectoryInput(false);

    let imagesFile: File = findFile('images.json', files);

    let imageUrlToFilename: Record<string, string> = imagesFile
      ? JSON.parse(await imagesFile.text())['downloaded']
      : {};

    let messagesFile: File = findFile('messages.json', files);

    let messages: Message[] = JSON.parse(await messagesFile.text());

    messages.forEach((x) => {
      let imageSrcs = findImageSrcs(x.msg);
      for (const src of imageSrcs) {
        const srcDecoded = decodeHtml(src);
        if (srcDecoded in imageUrlToFilename) {
          if (!objectUrls.current.has(imageUrlToFilename[srcDecoded])) {
            let objectURL = URL.createObjectURL(
              findFile(imageUrlToFilename[srcDecoded], files),
            );
            objectUrls.current.add(objectURL);
            imageUrlToFilename[srcDecoded] = objectURL;
          }
          x.msg = x.msg.replace(
            `src="${src}"`,
            `src="${imageUrlToFilename[srcDecoded]}"`,
          );
        }
      }
    });

    setProcessedMessages(messages);
  }

  function gotoLastClickedQuoteMsg() {
    if (clickedQuoteFromMsgNums.length) {
      let itemsToPop = 1;

      if (clickedQuoteFromMsgNums.length >= 2) {
        if (
          (Math.round(
            document
              .getElementById(window.location.hash.substring(1))
              ?.getBoundingClientRect().top!,
          ) == 0 &&
            clickedQuoteFromMsgNums[clickedQuoteFromMsgNums.length - 1] ==
              window.location.hash.substring(1)) || // the msg id at the top of the viewport matches with the top of the stack
          window.scrollY + window.innerHeight + 1 >= document.body.offsetHeight // the page is already scrolled to the bottom, a buffer of 1 pixel is added to accomodate nuances across different window size / zoom level / browser when calculating the scroll position
        ) {
          itemsToPop++;
        }
      }
      for (let i = 0; i < itemsToPop; i++) {
        window.location.hash = '';
        window.location.hash = clickedQuoteFromMsgNums.pop()!;
      }

      setClickedQuoteFromMsgNums([...clickedQuoteFromMsgNums]);
    }
  }

  return (
    <>
      <AppBar position='static'>
        <Toolbar className={styles.topbar}>
          <Grid
            container
            wrap='nowrap'
            sx={{
              overflow: 'hidden',
              justifyContent: 'left',
              justifyItems: 'left',
            }}
            direction={reverseTitleAndInputOrder ? 'row-reverse' : 'row'}
          >
            <Grid item>
              <Collapse
                orientation='horizontal'
                in={!showDirectoryInput && !!title}
                onEntered={() => setReverseTitleAndInputOrder(false)}
                // unmountOnExit
              >
                <Typography noWrap>{title}</Typography>
              </Collapse>
            </Grid>
            <Grid item>
              <Collapse
                orientation='horizontal'
                in={showDirectoryInput || !title}
                // unmountOnExit
              >
                <input
                  type='file'
                  directory=''
                  webkitdirectory=''
                  onChange={(e: ChangeEvent) => {
                    parseFiles(e.currentTarget as HTMLInputElement);
                  }}
                />
              </Collapse>
            </Grid>
          </Grid>
          <IconButton
            aria-label='Change Input'
            color='inherit'
            disabled={!title}
            onClick={() => setShowDirectoryInput(!showDirectoryInput)}
          >
            <SwapHorizIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <PushClickedQuoteFromMsgNumsContext.Provider
        value={(from_msg_num: string, to_msg_num: string) => {
          setClickedQuoteFromMsgNums(
            clickedQuoteFromMsgNums
              .filter((x) => parseInt(x) > parseInt(from_msg_num))
              .concat([from_msg_num, to_msg_num]),
          );
        }}
      >
        {processedMessages.map((x) => (
          <MessageCard
            message={x}
            originalPosterUserId={processedMessages[0].user.user_id}
            key={x.msg_num}
          />
        ))}
      </PushClickedQuoteFromMsgNumsContext.Provider>
      {clickedQuoteFromMsgNums.length > 0 && (
        <Fab
          sx={{
            position: 'fixed',
            bottom: 30,
            right: 30,
          }}
          aria-label='Down'
          color='primary'
          onClick={gotoLastClickedQuoteMsg}
        >
          <KeyboardArrowDownIcon />
        </Fab>
      )}
    </>
  );
}

export default ThreadViewer;
