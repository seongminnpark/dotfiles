function getContent(selector) {
  try {
    const el = document.querySelector(selector);
    if (el) {
      return el.getAttribute('content');
    }
  } catch (e) {}
}

function parseOpenTable() {
  try {
    const latitude = getContent('[property="place:location:latitude"]');
    if (latitude) {
      const longitude = getContent('[property="place:location:longitude"]');
      const title = getContent('[property="og:description"]').split(',')[0];
      const website = getContent('[property="business:contact_data:website"]');
      const address = getContent('[property="business:contact_data:street_address"]');
      const phone = getContent('[property="business:contact_data:phone_number"]');
      return {
        latitude,
        longitude,
        title,
        website,
        address,
        phone
      };
    }
  } catch (e) {}
}

export default async () => {
  return parseOpenTable();
};