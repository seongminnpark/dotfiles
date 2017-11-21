import xhr from '../utility/xhr';
import _ from 'lodash';
import street from '../utility/street';
import LRU from 'lru-cache';
import Promise from 'bluebird';
import moment from 'moment';

const UPDATE_SEARCH_DISTANCE = 30; // km
const cache = LRU({
  max: 15,
  maxAge: 1000 * 60 * 60 * 1 // 1 hour
});

function formatDate(date) {
  if (date.indexOf('%2F') > -1) {
    return date;
  }
  const components = date.split('/');
  const elements = [];
  _.forEach(components, (c, i) => {
    if (i < 2 && c.length === 1) {
      elements.push(`0${c}`);
    } else {
      elements.push(c);
    }
  });
  return elements.join('%2F');
}

function simpleWords(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ');
}

function scoreWords(w1, w2) {
  const intersection = _.intersection(w1, w2);
  const minLength = Math.min(w1.join('').length, w2.join('').length);
  const length = intersection.join('').length;
  return length / minLength;
}

function scoreAddress(address1, address2) {
  const addressVariations = street(address1);
  addressVariations.push(address1);
  return addressVariations.indexOf(address2) !== -1;
}

function scoreResults(results, input) {
  const inputTitle = simpleWords(input.title);
  const inputAddress = simpleWords(input.address);

  const {latitude, longitude} = input;

  return _.map(results, r => {
    const lat = _.get(r, 'hotel.address.latitude');
    const long = _.get(r, 'hotel.address.longitude');
    const dx = parseFloat(latitude) - lat;
    const dy = parseFloat(longitude) - long;
    const distance = Math.pow((dx * dx + dy * dy), 0.5);

    const name = simpleWords(r.hotel.name);
    const address = simpleWords(r.hotel.address.line1);
    const nameScore = scoreWords(inputTitle, name);
    const addressScore = scoreWords(inputAddress, address);
    const addressMatch = scoreAddress(address.join(' '), inputAddress.join(' '));
    r.score = {distance, nameScore, addressMatch, addressScore, total: nameScore * addressScore};
    return r;
  });
}
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const rLat = toRadians(lat1);
  const rLat2 = toRadians(lat2);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(rLat) * Math.cos(rLat2) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function midPoint(lat1, lon1, lat2, log2) {
  const dLng = toRadians(log2 - lon1);
  lat1 = toRadians(lat1);
  lat2 = toRadians(lat2);
  lon1 = toRadians(lon1);
  const bx = Math.cos(lat2) * Math.cos(dLng);
  const by = Math.cos(lat2) * Math.sin(dLng);
  return {
    latitude: toDegrees(Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by))),
    longitude: toDegrees(lon1 + Math.atan2(by, Math.cos(lat1) + bx))
  };
}
async function hotelSearch({checkIn, checkOut, adults, rooms, latitude, longitude}) {
  const cacheKey = btoa(JSON.stringify({checkIn, checkOut, adults, rooms}));
  const results = cache.get(cacheKey);
  if (
    results &&
    getDistanceFromLatLonInKm(
      parseFloat(_.get(results, 'region.latitude', 0)),
      parseFloat(_.get(results, 'region.longitude', 0)),
      parseFloat(latitude),
      parseFloat(longitude)
    ) <= UPDATE_SEARCH_DISTANCE
  ) {
    return results;
  } else {
    const url = `https://www.hotelstorm.com/rest/search?adults=${adults}&checkIn=${checkIn}&checkOut=${checkOut}&currency=USD&hotelImageHeight=202&hotelImageWidth=302&language=en&latitude=${latitude}&longitude=${longitude}&rooms=${rooms}&userGroup=wikibuy`;
    const headers = {
      authority: 'www.hotelstorm.com',
      'accept-language': 'en-US,en;q=0.8',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
    };
    const resp = await xhr('GET', url, null, headers);
    cache.set(cacheKey, resp);
    return resp;
  }
}

async function findHotel(input) {
  const checkIn = formatDate(input.checkIn);
  const checkOut = formatDate(input.checkOut);
  const searchData = {
    checkIn,
    checkOut,
    adults: input.adults,
    rooms: input.rooms,
    latitude: input.latitude,
    longitude: input.longitude
  };
  const resp = await hotelSearch(searchData);
  let results = scoreResults(_.get(resp, 'results'), input);
  let finalResult;
  let matches = _.filter(results, r => _.get(r, 'score.addressMatch'));
  if (matches.length > 1) {
    matches = _.filter(matches, r => _.get(r, 'score.nameScore') === 1);
    if (matches.length === 1) {
      finalResult = matches[0];
    }
  }
  if (!finalResult) {
    matches = _.filter(results, r => r.score.distance < 0.0005 && r.score.nameScore > 0);
    if (matches.length === 1) {
      finalResult = matches[0];
    }
  }
  if (!finalResult) {
    results = _(results)
      .filter(r => _.get(r, 'score.total') > 0.667)
      .sort((a, b) => b.score.total - a.score.total)
      .value();
    finalResult = _.get(results, '[0]');
  }
  if (finalResult) {
    const resultURL = `https://www.hotelstorm.com/details?region=${resp.region.id}&guests=${input.adults}&checkIn=${checkIn}&checkOut=${checkOut}&currency=USD&hotelImageHeight=202&hotelImageWidth=302&language=en&latitude=${input.latitude}&longitude=${input.longitude}&rooms=${input.rooms}&userGroup=wikibuy&id=${finalResult.hotel.id}`;
    const finalPrice = parseFloat(finalResult.lowestAveragePrice.amount * 100);
    const discount = input.price - finalPrice;
    if (discount > 0) {
      const hotelData = {
        discount: Math.floor(discount),
        title: finalResult.hotel.name,
        url: resultURL,
        totalDiscount: Math.floor(discount) * moment(new Date(input.checkOut)).diff(moment(new Date(input.checkIn)), 'days')
      };
      return hotelData;
    }
  }
}

export function searchBetweenTwoPoints({checkIn, checkOut, adults, rooms, latLongs}) {
  const {latitude, longitude} = midPoint(latLongs[0].latitude, latLongs[0].longitude, latLongs[1].latitude, latLongs[1].longitude);
  return hotelSearch({checkIn, checkOut, adults, rooms, latitude, longitude});
}
export async function findMultple(hotels) {
  await findHotel(hotels[0]);
  const results = await Promise.map(hotels, (hotel) => {
    return findHotel(hotel);
  });
  return _.compact(results);
}
export default findHotel;