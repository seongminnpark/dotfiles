import {isCashBackURL} from 'logic/cashback';
export default async ({url}) => {
  return isCashBackURL(url);
};