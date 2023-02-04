import { ChangeEvent, createContext, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import styles from './App.module.css';
import Message from './interfaces/message';
import MessageCard from './components/MessageCard';
import Fab from '@mui/material/Fab';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export const PushClickedQuoteFromMsgNumsContext = createContext<Function>(
  (msg_num: string) => {}
);

function App() {
  const [title, setTitle] = useState('');
  const [processedMessages, setProcessedMessages] = useState<Message[]>([]);
  const objectUrls = useRef<string[]>([]);
  const [clickedQuoteFromMsgNums, setClickedQuoteFromMsgNums] = useState<
    string[]
  >([]);

  function findImageSrcs(msg: string) {
    return Array.from(msg.matchAll(/src="(.*?)"/g)).map((x) => x[1]);
  }

  function findFile(name: string, files: File[]) {
    return files.filter((x) => x.webkitRelativePath.endsWith(name))[0];
  }

  async function parseFiles(input: HTMLInputElement) {
    while (objectUrls.current.length)
      URL.revokeObjectURL(objectUrls.current.pop()!);

    window.location.hash = '';

    setProcessedMessages([]);

    if (input.files!.length === 0) {
      return;
    }

    let files: File[] = Array.from(input.files!);

    let topicFile: File = findFile('topic.json', files);

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
          let objectURL = URL.createObjectURL(
            findFile(imageFilenames[src], files)
          );
          objectUrls.current.push(objectURL);
          x.msg = x.msg.replace(src, objectURL);
        }
      }
    });

    setTitle(JSON.parse(await topicFile.text()).title);
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
          {title || (
            <input
              type='file'
              directory=''
              webkitdirectory=''
              onChange={(e: ChangeEvent) => {
                parseFiles(e.currentTarget as HTMLInputElement);
              }}
            />
          )}
        </Toolbar>
      </AppBar>
      <PushClickedQuoteFromMsgNumsContext.Provider
        value={(msg_num: string) => {
          if (
            msg_num !==
            clickedQuoteFromMsgNums[clickedQuoteFromMsgNums.length - 1]
          )
            setClickedQuoteFromMsgNums(
              clickedQuoteFromMsgNums.concat([msg_num])
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

export default App;
