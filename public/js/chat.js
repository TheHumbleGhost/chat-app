const socket = io();
const form = document.querySelector('form');
const search = document.querySelector('input');
const submitBtn = form.querySelector('button');
const shareLoc = document.querySelector('.share-location');
const messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.time).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    // Todo: add auto scrolling
});

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    }
});

socket.on('locationMessage', (location) => {
    console.log(location);
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    // Todo: add auto scrolling
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    });
    document.querySelector('.chat__sidebar').innerHTML = html;
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = search.value;
    submitBtn.setAttribute('disabled', 'disabled');
    socket.emit("sendMessage", message, () => {
        submitBtn.removeAttribute('disabled');
        search.value = '';
        search.focus();
    });
});

shareLoc.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert("Location fetching is not supported");
    }
    shareLoc.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((location) => {
        socket.emit('sendLocation', {
            lat: location.coords.latitude,
            long: location.coords.longitude,
        }, (message) => {
            shareLoc.removeAttribute('disabled');
        });
    })
});