const generateMessage = (username,message) => {
    return {
        username,
        text: message,
        time: new Date().getTime()
    }
};

const generateLocationMessage = (username, url) => {
    return {
        username,
        url: url,
        time: new Date().getTime()
    }
};

module.exports = {
    generateMessage,
    generateLocationMessage
};