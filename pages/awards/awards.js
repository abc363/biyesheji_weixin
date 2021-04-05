var app = getApp()
Page({
  data: {
   //判断小程序的API，回调，参数，组件等是否在当前版本可用。
   isHide: false,
   data:[],
   id:0
  },
 onLoad(options){
   var that = this;
  this.setData({ id: decodeURIComponent(options.id)})
  //  TODO 根据uaid去获取自己的新闻列表
  wx.request({
    url: app.globalData._server+'/activity/show', //仅为示例，并非真实的接口地址
    data:{
      startPage:0,
      pageSize:10
    },
    success (res) {
      let arr = [];
      res.data.data.tableData.forEach(e=>{
        if(e.activity_state == '1'){
          arr.push(e);
        }
      })
      that.setData({
        data: arr
      })
    }
  })
  wx.showLoading({
    title: '加载中，请稍候',
    duration: 1500
  })
 },
 joinActivity(event){
  wx.navigateTo({
    //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
    url:`../myNews/myNews?id=${event.target.dataset.num}&isActivity=true`
  })
 }
  
 })