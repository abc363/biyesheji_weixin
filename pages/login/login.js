var app = getApp()
const md5 = require('../reg/md5.js');

Page({
  data: {
   //判断小程序的API，回调，参数，组件等是否在当前版本可用。
   canIUse: wx.canIUse('button.open-type.getUserInfo'),
   isHide: false,
   username:'',
   password:''
  },
  toReg(){
    wx.navigateTo({
      //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
      url:`../reg/reg`
    })
  },
  loginUser(){
    var that = this;
    wx.request({
      url: app.globalData._server+'/userApplication/login', //仅为示例，并非真实的接口地址
      data:{
        username:that.data.username,
        password:md5.hex_md5(that.data.password)
      },
      method:'post',
      success (res) {
        app.globalData.userId = res.data.data.uaid;
        app.globalData.username = res.data.data.username;
        app.globalData.avatar = res.data.data.user_avatar;
        console.log(app.globalData.avatar)
        wx.showToast({
          title: '登陆成功',
          icon: 'success',
          mask: true,
          duration: 1000
        })
        setTimeout(function(){
          wx.switchTab({
            //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
            url:`../index/index`
          })
        },1200)
        
      }
    })
   
  },
  usernameChange(e){
    this.setData({
      username:e.detail.value
    })
  },
  passwordChange(e){
    this.setData({
      password:e.detail.value
    })
  },

 })