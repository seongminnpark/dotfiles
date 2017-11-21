import xhr from 'utility/xhr';
import {WIKIBUY_API} from 'constants';

export async function getSession() {
  return await xhr('GET', `${WIKIBUY_API}/session`);
}