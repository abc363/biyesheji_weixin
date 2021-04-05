var app = getApp() 
const iamge = "http://qiufengfu363.oss-cn-hangzhou.aliyuncs.com/2021/03/27/472aa0ad-c26e-4e02-b791-9e7aa961c28dWechatIMG250.jpeg" 
Page({
  data: {
    news:[],
    menu_hidden:true,
    products_item:[],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    types:[],
    type_re:[],
    searchValue:'',
    arrPraise:[],
    personalPraise:[],
    arrComment:[],
    type:[],
    product:[],
    slider: [iamge,iamge,iamge],
    swiperCurrent: 0
  },
  onShow: function() {
    // 当返回当前页面的时候，会自动调用这个参数，则实现自动返回刷新
    this.onLoad()
  },
  // 开始加载
  onLoad:function(){
    this.getNewsList();
      // 查看是否授权
  },
  getNewsList(){
    var that = this;
    // tODO 拿微信名去请求id，后台拿到id后做推荐算法
    wx.showLoading({
      title: '加载中，请稍候',
      duration: 500
    })
    wx.request({
      url: app.globalData._server+'/news/show', //仅为示例，并非真实的接口地址
      data:{
        startPage:0,
        pageSize:10
      },
      success (res) {
       let arr = [];
       let arr1 = []
      let arr2 = []
      let arr3 = [];
      let result = [];
      let resultInterest =[];
       res.data.data.tableData.forEach((e,index)=>{
         if(e.news_isPass == 1){
           arr.push(e);
           arr1.push(e.news_praise)
           arr2.push(e.news_comment)
         }
         const arr4 = JSON.parse(JSON.stringify(e.news_praiseArr)) || [];
         if(arr4.indexOf(app.globalData.userId)!==-1){
          arr3.push(1);
         }else{
           arr3.push(0);
         }
        //  推荐算法
        let tag = e.news_tag;
        result[index] = new Array();
        resultInterest[index] = new Array();
        const resultKey = e.news_keywords.split("、");
        res.data.data.tableData.forEach((el,i)=>{
          // 计算相似矩阵
          result[index][i] =0
          el.news_tag == tag && (result[index][i] +=1);
          const arrKey = el.news_keywords.split("、");
          resultKey.forEach(element=>{
            if(arrKey.indexOf(element)!==-1){
              result[index][i] +=1;
            }
          })
          // 计算用户兴趣度
          if(app.globalData.userId == el.uaid){
            resultInterest[index][i] = el.news_praise*3+el.news_comment*4+el.news_view*1+el.news_share*2;
          }else{
            resultInterest[index][i] =0;
          }
        })

       })
       that.setData({
         news: arr,
         arrPraise:arr1,
        arrComment:arr2,
        personalPraise:arr3,
       })
      }
    })
  },
  // 悬浮按钮点击事件
  menuShow: function () {
    var that = this;
    wx.navigateTo({
      //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
      url:'../editor/editor'
    })
  },
  bindKeyInput(e){
    this.setData({
      searchValue:e.detail.value
    })
  },
  searchNews(){
    var that = this;
    wx.request({
      url: app.globalData._server+'/news/search', //仅为示例，并非真实的接口地址
      data:{
        news_title:this.data.searchValue,
        news_tag:'',
        pageSize:30,
        startPage:0,
      },
      method:'post',
      success (res) {
        that.setData({
          news: res.data.data.tableData
        })
      }
    })
  },
   addPraise(event){
     var that = this;
    let el = event.target.dataset.num
    const index = event.target.dataset.index
    that.setData({
      [`personalPraise[${index}]`]:1
    })
    el.news_praise +=1;
    let arr5 = el.news_praiseArr == '' ? []:JSON.parse(el.news_praiseArr);
    arr5.push(app.globalData.userId);
    el.news_praiseArr = JSON.stringify(arr5);
    wx.request({
      url: `${app.globalData._server}/news/${el.nid}/change_info`, //仅为示例，并非真实的接口地址
      data:el,
      method:'post',
      success (res) {
        that.setData({
          [`arrPraise[${index}]`]:that.data.arrPraise[index]+1,
        })
      }
    })
    // 点赞后添加用户行为
    wx.request({
      url: `${app.globalData._server}/usersActivity/add`, //仅为示例，并非真实的接口地址
      data:{
        uaid:app.globalData.userId,
        news_id:el.nid,
        add_tag:'praise'
      },
      method:'post',
      success (res) {
      }
    })
   },
  //轮播图的切换事件
  swiperChange: function(e){
    //只要把切换后当前的index传给<swiper>组件的current属性即可
        this.setData({
          swiperCurrent: e.detail.current
        })
      },
      //点击指示点切换
      chuangEvent: function(e){
        this.setData({
          swiperCurrent: e.currentTarget.id
        })
      },
      toMore:function(event){
        wx.navigateTo({
          //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
          url:`../more/more?id=${event.target.dataset.num}`
        })
      },
      addComment(event){
        wx.navigateTo({
          //跳转页面的路径，可带参数 ，用?隔开，不同参数用&分隔；
          url:`../more/more?id=${event.target.dataset.num}&detail=comment`
        })
      }
})