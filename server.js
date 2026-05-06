const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

// 存储接收到的数据
let receivedData = [];

// 接收图片上报（GET 请求）
app.get('/reportData', (req, res) => {
    let reportData;
    if (req.query.data) {
        try {
            reportData = JSON.parse(decodeURIComponent(req.query.data));
        } catch (e) {
            reportData = req.query.data;
        }
    }
    const data = {
        timestamp: new Date().toISOString(),
        data: reportData || req.query
    };
    receivedData.push(data);
    console.log('收到图片上报数据:', data);
    res.status(200).send('success');
});

// 接收上报数据（POST 请求）
app.post('/reportData', (req, res) => {
    const data = {
        timestamp: new Date().toISOString(),
        data: req.body
    };
    receivedData.push(data);
    console.log('收到上报数据:', data);
    res.status(200).send('success');
});

// 获取接收到的数据
app.get('/api/data', (req, res) => {
    res.json(receivedData);
});

// 清空数据
app.delete('/api/data', (req, res) => {
    receivedData = [];
    res.json({ success: true, message: '数据已清空' });
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'demo')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.listen(8080, () => {
    console.log('Server is running on http://127.0.0.1:8080');
    console.log('错误测试页面: http://127.0.0.1:8080/error/index.html');
});
