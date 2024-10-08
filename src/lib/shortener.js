import fetch from 'node-fetch';

const shortener = (url) => {
    return new Promise(async (resolve, reject) => {
        console.log('Creating short url...')
        await fetch(`https://tinyurl.com/api-create.php?url=${url}`)
            .then(response => response.text())
            .then(json => {
                resolve(json)
            })
            .catch((err) => {
                reject(err)
            });
    })
};

export { shortener }