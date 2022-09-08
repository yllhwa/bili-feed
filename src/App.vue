<script setup>
import { GM_xmlhttpRequest } from '$';
import { onMounted } from '@vue/runtime-core';

let accesskey = $ref('');
let feeds = $ref([]);

let getNewFeeds = () => {
  console.log(accesskey);
  GM_xmlhttpRequest(
    {
      method: 'GET',
      url: `https://app.bilibili.com/x/v2/feed/index?access_key=${accesskey}&appkey=1d8b6e7d45233436&autoplay_card=11&autoplay_timestamp=0&build=6870300&c_locale=zh_CN&column=2&column_timestamp=0&device_type=0&disable_rcmd=0&flush=6&fnval=976&fnver=0&force_host=2&fourk=1&guidance=0&https_url_req=1&inline_danmu=2&inline_sound=1&interest_id=0&login_event=0&mobi_app=android&network=wifi&open_event=hot&platform=android&player_net=1&pull=true&qn=120&recsys_mode=0&video_mode=-1&voice_balance=1`,
      onload: (res) => {
        // decode json
        let data = JSON.parse(res.responseText);
        for (let i = 0; i < data.data.items.length; i++) {
          let item = data.data.items[i];
          if (item.card_type == 'small_cover_v2') {
            feeds.push(item);
          }
        }
        console.log(feeds);
      },
    },
  );
}

let getAccessKeyBySESSDATA = () => {
  fetch('https://passport.bilibili.com/login/app/third?appkey=27eb53fc9058f8c3&api=https%3A%2F%2Fwww.mcbbs.net%2Ftemplate%2Fmcbbs%2Fimage%2Fspecial_photo_bg.png&sign=04224646d1fea004e79606d3b038c84a', {
    method: 'GET',
    credentials: 'include',
    mode: 'cors'
  })
    .then(res => res.json())
    .then(res => {
      if (res.code !== 0) {
        throw new Error("API Error");
      }
      return res.data;
    })
    .then(res => {
      let confirm_uri = res.confirm_uri;
      console.log(confirm_uri);

      // GM_xmlhttpRequest获取302跳转后的地址
      GM_xmlhttpRequest({
        synchronous: false,
        method: 'GET',
        url: confirm_uri,
        onload: (res) => {
          let url = res.finalUrl;
          console.log(this);
          let access_key = url.split('access_key=')[1].split('&')[0];
          accesskey = access_key;
          console.log("新aceess_key", access_key);
          // 写入localStorage
          localStorage.setItem('access_key', access_key);
          getNewFeeds();
        },
        onerror: (err) => {
          console.log(err);
        }
      })
    });
};

onMounted(() => {
  // body下除了id=feedApp的元素和子元素，其他元素全部移除
  let feedApp = document.getElementById('feedApp');
  let body = document.getElementsByTagName('body')[0];
  while (body.firstChild != feedApp) {
    body.removeChild(body.firstChild);
  }
  // 清空css
  // document.head.innerHTML = '';
  // 设置标题
  document.title = '哔哩哔哩推荐';
  // 获取access_key
  let access_key = localStorage.getItem('access_key');
  console.log("从localStorage获取access_key",access_key);
  if (access_key && access_key!=='' && access_key !== 'null') {
    accesskey = access_key;
  } else {
    console.log('access_key不存在');
    getAccessKeyBySESSDATA();
  }
  getNewFeeds();
});

let onCardClick = (item) => {
  let targetUri = "https://www.bilibili.com/video/" + item.card_goto + item.param
  window.open(targetUri, '_blank');
}

// 监控滚动到底部
function getScrollTop() {
  let scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
  if (document.body) {
    bodyScrollTop = document.body.scrollTop;
  }
  if (document.documentElement) {
    documentScrollTop = document.documentElement.scrollTop;
  }
  scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
  return scrollTop;
}

function getScrollHeight() {
  let scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
  if (document.body) {
    var bSH = document.body.scrollHeight;
  }
  if (document.documentElement) {
    var dSH = document.documentElement.scrollHeight;
  }
  scrollHeight = (bSH - dSH > 0) ? bSH : dSH;
  return scrollHeight;
}

function getWindowHeight() {
  let windowHeight = 0;
  if (document.compatMode == "CSS1Compat") {
    windowHeight = document.documentElement.clientHeight;
  } else {
    windowHeight = document.body.clientHeight;
  }
  return windowHeight;
}

window.onscroll = function () {
  if (getScrollTop() + getWindowHeight() == getScrollHeight()) {
    getNewFeeds();
  }
};

</script>

<template>
  <div class="grid grid-cols-2 gap-3 mt-4" style="max-width: 640px;">
    <div v-for="feed in feeds" :key="feed.idx" @click="onCardClick(feed)" class="cursor-pointer">
      <div class="relative">
        <img :src="feed.cover" class="rounded-lg w-80 h-44 object-cover">
        <div class="absolute bottom-0 text-white">
          <!-- 暂时懒得做 -->
        </div>
      </div>

      <div class="pr-2 max2Line">{{ feed.title }}</div>
      <div class="text-sm text-gray-500">{{ feed?.args?.up_name }}· 8-17</div>
    </div>
  </div>
</template>

<style>
#feedApp {
  /* 子元素居中 */
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.max2Line {
  /* 最多显示两行 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  /* 不足两行补齐 */
  line-height: 1.5;
  height: 3em;
}
</style>
