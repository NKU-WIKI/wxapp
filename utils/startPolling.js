// ==================== 实时监听 ====================
//所有data全都由https获得，使用定时轮询的方法来实时更新

function fetchData(url){
    wx.request({
        url: url,
        method: 'GET',
        success: (res) => {
            return res.data;
        },
        fail: (err) => {
            console.error(err);
        }
    });
}

const startPolling = (func,delay)=> {
    setInterval(() => {
        func();
        console.log('更新图标');
    }, delay)
}

module.exports = {
    startPolling,
    fetchData
}