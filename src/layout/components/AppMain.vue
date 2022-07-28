<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
import notificationKoro from "notification-koro1"; // 引入npm包
export default {
  name: "AppMain",
  data() {
    return {
      notificationClass: null,
      notificationOptions: {
        dir: "ltr", // 文字从右到左
        body: "", // body部分的文字
        // lang: '', // 通知语言
        tag: '0', // 通知id，用以替换、刷新、移除的时候用
        renotify:true,
        requireInteraction: true, // 不自动关闭通知
        // icon: "https://upload-images.jianshu.io/upload_images/5245297-818e624b75271127.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240",
      },
    };
  },
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews;
    },
    key() {
      return this.$route.path;
    },
  },
  methods: {
    fitstNotification() {
      this.notificationClass = new notificationKoro(
        "BlackView-OA系统",
        this.notificationOptions
      ); // 初始化

      if (this.notificationClass.support) {
        return this.requestPermission();
      } else {
        // 浏览器不支持
        console.log("当前浏览器版本不支持natification,建议使用谷歌、火狐浏览器");
      }
    },
    requestPermission() {
      return this.notificationClass.initNotification(()=>{});
    },
  },
  created() {
    let that = this;
    this.fitstNotification();

    if ("WebSocket" in window) {
      // 打开一个 web socket
      var ws = new WebSocket(
        "ws" +
          process.env.VUE_APP_BASE_API.slice(
            4,
            process.env.VUE_APP_BASE_API.length
          ) +
          "/websocket/" +
          this.$store.state.user.userId
      );

      ws.onopen = function () {
        // Web Socket 已连接上，使用 send() 方法发送数据
        let timer = setInterval(function () {
          if (ws.readyState == 1) {
            ws.send("ping");
          } else {
            //IM连接已断开
            clearInterval(timer);
          }
        }, 110 * 1000);
      };

      ws.onmessage = function (evt) {
        that.notificationOptions.body = evt.data;
        if (that.notificationOptions.body != "pong") {
          that.notificationClass.userAgreed();
          that.fitstNotification();
        }
      };

      ws.onclose = function () {
        // 关闭 websocket
      };
    } else {
      // 浏览器不支持 WebSocket
      console.log("您的浏览器不支持 WebSocket!");
    }
  },
};
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
