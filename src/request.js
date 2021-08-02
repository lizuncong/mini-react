export default function ajax(){
    let xhr = new XMLHttpRequest();
    const url = 'http://localhost:3000/get'
    xhr.onload = ()=>{
        if(xhr.status === 200){
            const myHeader = xhr.getResponseHeader('X-My-Custom-Header');
            console.log('myHeader...', myHeader)
            return console.log(xhr.response||xhr.responseText);
        }
        return console.error('请求失败');
    }
    xhr.onerror = ()=>{
        return console.error('出错了');
    }
    xhr.open('GET',url);
    xhr.send('hello');
}