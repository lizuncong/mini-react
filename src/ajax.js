import querystring from 'querystring'
export default function ajax(url, type, params){
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onload = ()=>{
            if(xhr.status === 200){
                return resolve(xhr.response||xhr.responseText);
            }
            return reject('请求失败');
        }
        xhr.onerror = ()=>{
            return reject('出错了');
        }
        xhr.open(type, url);
        // xhr.withCredentials = true; 
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        xhr.send(params);
    })
}

export const get = (path, params) => {
    const url = `http://localhost:3001${path}/?id=${params.id}`
    return ajax(url, 'GET')
}

export const post = (path, params) => {
    const url = `http://localhost:3001${path}`
    return ajax(url, 'POST', querystring.stringify(params))
}