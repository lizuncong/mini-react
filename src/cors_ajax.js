export default function ajax(){
    const url = 'http://localhost:3000'
    let xhr = new XMLHttpRequest();
    xhr.onload = ()=>{
        if(xhr.status === 200){
            return console.log(xhr.response||xhr.responseText);
        }
        return console.log('请求失败');
    }
    xhr.onerror = ()=>{
        return console.log('出错了');
    }
    xhr.open('PUT', url);
    // xhr.withCredentials = true; 
    xhr.send();
}
