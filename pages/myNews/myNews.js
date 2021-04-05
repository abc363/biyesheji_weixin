var app = getApp()
Page({
  data: {
   //判断小程序的API，回调，参数，组件等是否在当前版本可用。
   canIUse: wx.canIUse('button.open-type.getUserInfo'),
   isHide: false,
   data:[],
   id:0
  },
 onLoad(options){
   var that = this;
   this.setData({ isHide: decodeURIComponent(options.isActivity)})
  this.setData({ id: decodeURIComponent(options.id)})

  //  TODO 根据uaid去获取自己的新闻列表
  wx.request({
    url: `${app.globalData._server}/news/${app.globalData.userId}/showNewsByUser`, //仅为示例，并非真实的接口地址
    data:{
      startPage:0,
      pageSize:10
    },
    success (res) {
      const arr = res.data.data;
      let arr1=[];
      arr.forEach(e=>{
        if(e.news_isPass == 1){
          arr1.push(e)
        }
      })
      that.setData({
        data: arr1
      })
      if(that.data.data == []){
        wx.showLoading({
          title: '您暂无创作，快去发表一下新闻吧',
          duration: 1500
        })
        setTimeout(function(){
          wx.navigateTo({
            //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
            url:`../personal/personal`
          })
        },1500)
      }
    }
  })
  wx.showLoading({
    title: '加载中，请稍候',
    duration: 1500
  })
 },
 toMore(event){
  wx.navigateTo({
    //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
    url:`../more/more?id=${event.target.dataset.num}`
  })
 },
 joinActivity(event){
   let obj = event.target.dataset.num;
   obj.uaid = app.globalData.userId;
   obj.news_activity = this.data.id;

  wx.request({
    url: app.globalData._server+'/news/'+obj.nid+'/change_info', //仅为示例，并非真实的接口地址
    data:obj,
    method:'post',
    success (res) {
      wx.showToast({
        title: '参与成功',
        icon: 'success',
        mask: true,
        duration: 1000
      })
      setTimeout(function(){
        wx.navigateTo({
          //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
          url:`../awards/awards`
        })
      },1200)
    }
  })
 }
  
 })