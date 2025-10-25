import { expect, it } from 'vitest';
import { render } from '@testing-library/react';
import MessageCard from '@/src/components/MessageCard';
import Message from '@/src/interfaces/message';

it('renders MessageCard', async () => {
  const message: Message = {
    msg: 'This is a test message',
    msg_num: '1',
    user_gender: 'M',
    user_nickname: 'TestUser',
    user: {
      user_id: '2',
      level: '10',
    },
    reply_time: 1625079600,
    like_count: '10',
    dislike_count: '2',
    status: 1,
  };

  const { container } = await render(
    <MessageCard message={message} originalPosterUserId='1' />,
  );
  expect(container).toMatchSnapshot();
});
