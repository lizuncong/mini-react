import React from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import ajax from './request'

function Index() {

  return (
    <Router>
        <Switch>
            <Route path="/about">
                <button onClick={() => { ajax('/login')}}>登录</button>
                <button
                    onClick={() => {
                        ajax('/get', { id: 2 })
                    }}
                >
                    get请求
                </button>
            </Route>
            <Route path="/users">
                <div>用户页面</div>
            </Route>
            <Route path="/">
                <Link to="/about">About</Link>
                <button onClick={() => { ajax('/login')}}>登录</button>
                <button
                    onClick={() => {
                        for(let i = 0; i < 200; i ++){
                            ajax('/get', { id: i }).then((res) => {
                                console.log(`第${i}个请求返回：`, res)
                            })
                        }
                    }}
                >
                    get请求
                </button>
            </Route>
        </Switch>
    </Router>
  );
}

export default Index;