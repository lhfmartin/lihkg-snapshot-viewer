export default interface Message {
  msg: string;
  msg_num: string;
  user_gender: string;
  user_nickname: string;
  user: {
    user_id: string;
    level: string;
  };
  reply_time: number;
  quote?: Message;
  like_count: string;
  dislike_count: string;
  status: number;
}
