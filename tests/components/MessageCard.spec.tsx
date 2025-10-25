import { expect, it } from 'vitest';
import { render } from '@testing-library/react';
import MessageCard from '@/src/components/MessageCard';
import Message from '@/src/interfaces/message';

it('renders MessageCard (poster is original poster)', async () => {
  const message: Message = {
    msg: 'This is a test message',
    msg_num: '1',
    user_gender: 'M',
    user_nickname: 'TestUser',
    user: {
      user_id: '1',
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

it('renders MessageCard (poster is male)', async () => {
  const message: Message = {
    msg: 'This is a test message',
    msg_num: '2',
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

it('renders MessageCard (poster is female)', async () => {
  const message: Message = {
    msg: 'This is a test message',
    msg_num: '2',
    user_gender: 'F',
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

it('renders MessageCard (poster is admin)', async () => {
  const message: Message = {
    msg: 'This is a test message',
    msg_num: '2',
    user_gender: 'M',
    user_nickname: 'LIHKG',
    user: {
      user_id: '1',
      level: '999',
    },
    reply_time: 1571379600,
    like_count: '10',
    dislike_count: '2',
    status: 1,
  };

  const { container } = await render(
    <MessageCard message={message} originalPosterUserId='1' />,
  );
  expect(container).toMatchSnapshot();
});
