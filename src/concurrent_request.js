const queue = [] // 排队的请求
const max = 6; // 最大并发数
let currentCount = 0; 
export default function ajax(path, { id }){
    return new Promise((resolve, reject) => {
        currentCount++;
        const executeTask = () => {
            const task = queue.shift()
            currentCount--;
            if(task){
                task()
            }
        }
        const task = () => {
            let xhr = new XMLHttpRequest();
            const url = `http://localhost:3000${path}/?id=${id}`
            xhr.onload = ()=>{
                executeTask()
                if(xhr.status === 200){
                    return resolve(xhr.response||xhr.responseText);
                }
                return reject('请求失败');
            }
            xhr.onerror = ()=>{
                executeTask()
                return reject('出错了');
            }
            xhr.open('GET',url);
            xhr.withCredentials = true; 
            xhr.send('hello');
        }
        if(currentCount < max + 1){
            task();
        } else { // 超过最大并发数则排队
            queue.push(task)
        }
    })
}