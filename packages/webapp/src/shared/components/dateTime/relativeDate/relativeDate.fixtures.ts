import { SECOND_IN_MS } from './relativeDate.constants';

export const DAY = SECOND_IN_MS * 60 * 60 * 24;
export const nowSub = (time: number) => new Date(new Date().getTime() - time);

export const dateMinuteAgo = () => nowSub(SECOND_IN_MS * 60);
export const dateYesterday = () => nowSub(DAY);
