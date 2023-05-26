import { ChangeEvent, createContext, useRef, useState } from 'react';
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

export const PushClickedQuoteFromMsgNumsContext = createContext<Function>(
  (msg_num: string) => {}
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

  function findImageSrcs(msg: string) {
    return Array.from(msg.matchAll(/src="(.*?)"/g)).map((x) => x[1]);
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

    if (input.files!.length === 0) {
      return;
    }

    let files: File[] = Array.from(input.files!);

    let topicFile: File = findFile('topic.json', files);

    setTitle(JSON.parse(await topicFile.text()).title);
    setShowDirectoryInput(false);

    let imagesFile: File = findFile('images.json', files);

    let imageFilenames: Record<string, string> = JSON.parse(
      await imagesFile.text()
    )['downloaded'];

    let messagesFile: File = findFile('messages.json', files);

    let messages: Message[] = JSON.parse(await messagesFile.text());

    messages.forEach((x) => {
      let imageSrcs = findImageSrcs(x.msg);
      for (const src of imageSrcs) {
        if (src in imageFilenames) {
          if (!objectUrls.current.has(imageFilenames[src])) {
            let objectURL = URL.createObjectURL(
              findFile(imageFilenames[src], files)
            );
            objectUrls.current.add(objectURL);
            imageFilenames[src] = objectURL;
          }
          x.msg = x.msg.replace(`src="${src}"`, `src="${imageFilenames[src]}"`);
        }
      }
    });

    setProcessedMessages(messages);
  }

  function gotoLastClickedQuoteMsg() {
    if (clickedQuoteFromMsgNums.length) {
      window.location.hash = clickedQuoteFromMsgNums.pop()!;
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
        value={(msg_num: string) => {
          if (
            msg_num !==
            clickedQuoteFromMsgNums[clickedQuoteFromMsgNums.length - 1]
          )
            setClickedQuoteFromMsgNums(
              clickedQuoteFromMsgNums
                .filter((x) => parseInt(x) > parseInt(msg_num))
                .concat([msg_num])
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
