import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.min.js';

const url = 'https://vue3-course-api.hexschool.io/v2';

const app = createApp({
    data() {
      return {
        user: {
            username: '',
            password: '',
        },
      };
    },

    methods: {
      login() {       
        axios.post( `${url}/admin/signin`, this.user ).then((res) => {
          const{ token, expired } = res.data; //儲存token和token到期日
          document.cookie = `magShopToken=${token}; expires=${new Date(expired)};`;
          window.location = 'products.html';
        }).catch((err) => {
          alert("帳號或密碼錯誤,請重新輸入")
          window.location = 'index.html';
        });
      },
    },
  });

app.mount('#app');