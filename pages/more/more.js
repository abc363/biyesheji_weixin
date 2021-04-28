var app = getApp() 
Page({
  data: {
   //判断小程序的API，回调，参数，组件等是否在当前版本可用。
   canIUse: wx.canIUse('button.open-type.getUserInfo'),
   isHide: false,
   id:0,
   moreData:'',
   news_title:'',
   news_date:'',
   usernameList:[],
   detail:'',
   inputValue:'',
   commentValue:'',
   userId:'',
   news_comment:0,
   data:{}, 
   news_view:0,
  },
  
  onLoad: function(options) {
    this.setData({ id: decodeURIComponent(options.id),detail:decodeURIComponent(options.detail),
    userId:app.globalData.userId})
    var that = this;
    wx.request({
      url: `${app.globalData._server}/news/${this.data.id}/showNews`, //仅为示例，并非真实的接口地址
      success (res) {
        that.setData({
          //富文本内容
          moreData: res.data.data.news_content.replace(/\<img/gi, '<img style="max-width:100%;height:auto"'),
          news_title: res.data.data.news_title,
          news_date:res.data.data.news_date,
          data:res.data.data,
          news_comment:res.data.data.news_comment,
          news_view:res.data.data.news_view,
      })
        // that.setData({ moreData: res.data.data.news_content})
      }
    })
    // 浏览后添加用户行为
    wx.request({
      url: `${app.globalData._server}/UsersActivity/add`, //仅为示例，并非真实的接口地址
      data:{
        uaid:app.globalData.userId,
        news_id:parseInt(that.data.id),
        add_tag:'tag_view',
        tag_view:1,
        tag_praise:0,
        tag_comment:0,
        tag_share:0,
      },
      method:'post',
      success (res) {
      }
    })
    wx.request({
      url: `${app.globalData._server}/news/${this.data.id}/${that.data.news_view+1}/change_view`, //仅为示例，并非真实的接口地址
      method:'post',
      success (res) {
      }
    })
   this.getList(); 
  },
  getList(){
    var that = this;
    wx.request({
      url: `${app.globalData._server}/NewsComment/show`, //仅为示例，并非真实的接口地址
      data:{
        news_id:this.data.id,
        startPage:0,
        pageSize:20
      },
      success (res) {
        const arr = res.data.data.tableData;
        let arr1=[];
        arr.forEach(e=>{
          arr1.push({name:e.user_name,avatar:e.user_avatar,date:e.comment_date,content:e.content,uaid:e.uaid,cid:e.cid});
        })
        that.setData({ usernameList: arr1})
      } 
    })
  },
  getInputComment(e){
    this.setData({
      inputValue:e.detail.value
    })
  },
  addComment(){
    var that = this;
    that.setData({
      ['data.news_comment']:that.data.news_comment+1
    })
    wx.request({
      url: `${app.globalData._server}/NewsComment/add`, //仅为示例，并非真实的接口地址
      data:{
        news_id:this.data.id,
        uaid:app.globalData.userId,
        user_name:app.globalData.username,
        user_avatar:app.globalData.avatar,
        comment_date:new Date().toLocaleDateString(),
        content:that.data.inputValue
      },
      method:'post',
      success (res) {
        that.getList();
        app.globalData.commentList.forEach(e=>{
          if(e.id == that.data.id){
            e.comment +=1;
          }
        })
        console.log(app.globalData.commentList);
        that.setData({ commentValue: ''})
      }
    })
    wx.request({
      url: `${app.globalData._server}/news/${that.data.id}/change_info`, //仅为示例，并非真实的接口地址
      data:that.data.data,
      method:'post',
      success (res) {
        that.setData({ news_comment: that.data.news_comment+1})
      }
    })
      // 评论后添加用户行为
      wx.request({
      url: `${app.globalData._server}/UsersActivity/add`, //仅为示例，并非真实的接口地址
      data:{
        uaid:app.globalData.userId,
        news_id:that.data.id,
        add_tag:'tag_comment',
        tag_comment:1,
        tag_view:0,
        tag_praise:0,
        tag_share:0,
      },
      method:'post',
      success (res) {
      }
    })
  },
  deleteComment(event){
    var that = this;
    wx.request({
      url: `${app.globalData._server}/NewsComment/${event.currentTarget.dataset.num.cid}/delete`, //仅为示例，并非真实的接口地址
      success (res) {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          mask: true,
          duration: 1000
        })
        that.getList();
      }
    })
  }
  
  
 })