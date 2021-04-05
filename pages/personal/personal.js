var app = getApp()
Page({
  data: {
   //判断小程序的API，回调，参数，组件等是否在当前版本可用。
   canIUse: wx.canIUse('button.open-type.getUserInfo'),
   isHide: false,
   avatar:'',
   username:''
  },
  onLoad:function(){
    this.setData({
      avatar:app.globalData.avatar,
      username:app.globalData.username
    })
  },
  addNews:function(){
    wx.navigateTo({
      //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
      url:'../editor/editor'
    })
  },
  toCard(){
    wx.navigateTo({
      //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
      url:`../myNews/myNews?id=${app.globalData.userId}`
    })
  },
  awards(){
    wx.navigateTo({
      //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
      url:`../awards/awards`
    })
  }

 })