import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.26/vue.esm-browser.min.js';
import pagination from './pagination.js';

const url = 'https://vue3-course-api.hexschool.io/v2/api';
const api_path = 'magshop';

let productModal = null;
let delProductModal = null;


const app = createApp({
  components: {
    pagination
  },
  data() {
    return {
      products: [],
      tempProduct: {
          imagesUrl: [],
      },
      isNew: false,
      pagination: {},
    };
  },

  methods: {
    checkLogin() {
        //取得我剛存的Token (Token僅需要設定一次)
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)magShopToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        // 把token存到header作為auth,以後request都用此token
        axios.defaults.headers.common['Authorization'] = token;

        //確認用此token是否有正確登入,也確認token是否有無過期
        axios.post(`${url}/user/check`)
        .then((res) => {
          this.getProducts();
        }).catch((err) => {
          alert(err);
          window.location = 'index.html'; //重新回到登入畫面
        })
    },

    getProducts(page = 1) { //參數預設值
      axios.get(`${url}/${api_path}/admin/products/?page=${page}`)
      .then( (res) => {
        this.products = res.data.products;
        this.pagination = res.data.pagination;
      }).catch( (err) => {
        //alert(err.data.message);
        alert(err);
        window.location = 'index.html';
      })
    },

    openModal(status, product) {
      if (status === 'new'){
        this.tempProduct = {  //清空欄位,避免還有殘留的資訊在欄位中
          imagesUrl: [],
        };
        productModal.show();
        this.isNew = true;  //isNew = true 指新建立的表單
      } else if (status === 'edit'){
        this.tempProduct = { ...product }; //注意! 淺層copy
        productModal.show();
        this.isNew = false;
      } else if (status === 'delete'){
        delProductModal.show();
        this.tempProduct = { ...product };      
      }
    },
  },

  mounted() {
    this.checkLogin();  
    productModal = new bootstrap.Modal(document.getElementById('productModal'), { keyboard: false });
    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), { keyboard: false });
  },
});

//新增/編輯元件
app.component('productModal', {
  props: ['tempProduct','isNew'],
  template: '#templateForProductModal',
  methods: {
    updateProduct() {
      let urlPath = `${url}/${api_path}/admin/product`;
      let method = `post`;

      // edit後之更新資料
      if (!this.isNew) { 
        urlPath = `${urlPath}/${this.tempProduct.id}`;
        method = `put`;
      }

      axios[method]( urlPath, { data: this.tempProduct })
        .then( (res) => {
          console.log(res);
          // this.getProducts(); //重新取得產品資訊 - 這沒有getProduct(外層的方法)
          this.$emit('get-products');
          productModal.hide();
      }).catch( (err) => {
          alert(err);
          alert("欄位不能空白");
      })
    },
    createImages() {
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push('');
    },
  },
});

//刪除元件
app.component('delProductModal', {
  props: ['tempProduct'],
  template: '#templateForDelProductModal',
  methods: {
    deleteProduct() {
      let urlPath = `${url}/${api_path}/admin/product/${this.tempProduct.id}`;
      axios.delete(urlPath)
        .then( res => {
          this.$emit('get-products');
          delProductModal.hide();
      }).catch((err) => {
        alert(err);
      });
    },
  },
});

app.mount("#app");
