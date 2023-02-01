import { ChangeEvent, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import './App.css';
import Message from './interfaces/message';
import MessageCard from './components/MessageCard';

function App() {
  let [processedMessages, setProcessedMessages] = useState<Message[]>([]);
  let objectUrls = useRef<string[]>([]);

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

    setProcessedMessages(messages);
  }

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <input
            type='file'
            directory=''
            webkitdirectory=''
            onChange={(e: ChangeEvent) => {
              parseFiles(e.currentTarget as HTMLInputElement);
            }}
          />
        </Toolbar>
      </AppBar>
      {processedMessages.map((x) => (
        <MessageCard
          message={x}
          originalPosterUserId={processedMessages[0].user.user_id}
          key={x.msg_num}
        />
      ))}
    </>
  );
}

export default App;
