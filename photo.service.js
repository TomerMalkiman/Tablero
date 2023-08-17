import axios from 'axios';
export const photoService = {
  loadDefaultPhotos,
  getPhotosByKeyword,
  savePhotosToStorage,
  uploadPhoto
};


const KEY = 'photos';

async function loadDefaultPhotos() {
  const storagePhotos = localStorage.getItem(KEY);
  let photos = storagePhotos ? JSON.parse(storagePhotos) : [];
  if (!photos || !photos.length) {
    const res = await axios.get(
      'https://api.unsplash.com/photos/random/?count=40&&query=view&&client_id=uFlXoOBB-1QIZ9Qf2FIQEBZjmO6n3HlN6XtOulT3ciA'
    );
    res.data.forEach((p) => photos.push(p.urls.regular));
    localStorage.setItem(KEY, JSON.stringify(photos));
  }
  return photos;
}

async function getPhotosByKeyword(keyword = null) {
  let photos = [];

  if (!keyword) keyword = nature;

  const res = await axios.get(`https://api.unsplash.com/photos/random/?count=60&&query=${keyword}&&client_id=uFlXoOBB-1QIZ9Qf2FIQEBZjmO6n3HlN6XtOulT3ciA`)
  res.data.forEach(p => photos.push(p.urls.regular));
  return photos;
}

function savePhotosToStorage(photos) {
  localStorage.setItem(KEY, JSON.stringify(photos));
}

async function uploadPhoto (file){
  //gets the file and upload it to cloudinary
  // Defining our variables
  const UPLOAD_PRESET = 'Tablero'; // Insert yours
  const CLOUD_NAME = 'dwu2p9wyb'; // Insert yours
  const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const FORM_DATA = new FormData();
  // Building the request body
  FORM_DATA.append('file', file);
  FORM_DATA.append('upload_preset', UPLOAD_PRESET);
  // Sending a post method request to Cloudniarys' API
  try {
    const res = await axios.post(UPLOAD_URL, FORM_DATA);
    return res.data;
  } catch (err) {
    console.error('ERROR!', err);
  }
};