import xhr from 'utility/xhr';

export default async (url) => {
  await xhr('GET', url);
};