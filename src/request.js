export default function ajax(type ,url , data ){
    let xhr = new XMLHttpRequest();
    let promise = new Promise(function(resolve , reject){
        xhr.onload = ()=>{
            if(xhr.status === 200){
                return resolve(xhr.response||xhr.responseText);
            }
            return reject('请求失败');
        }
        xhr.onerror = ()=>{
            return reject('出错了');
        }
        xhr.open(type,url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        // xhr.setRequestHeader('Cookies', 'fdsaf');
        // xhr.withCredentials = true;
        xhr.send(data ? data:null);
    });
    return promise;
}