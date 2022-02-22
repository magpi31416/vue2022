
const url = "https://vue3-course-api.hexschool.io/v2/api";
const api_path = "magshop";

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, numeric, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);
defineRule('numeric', numeric);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const app = Vue.createApp({
  data() {
    return {
      cartData: {
        carts: [],
      },
      products: [],
      productId: '',
      isLoadingItem: '',
      form: {
        user: {
          name:'',
          email:'',
          tel:'',
          address:'',
        },
        message: '',
      },

    };
  },

  components: {
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },

  methods: {
    getProducts() {
      axios.get(`${url}/${api_path}/products/all`)
        .then((res) => {
            // console.log(res);
            this.products = res.data.products;
        })
    },
    openProductModal(id) {
      this.productId = id;
      this.$refs.productModal.openModal();
    },
    getCart() {
      axios.get(`${url}/${api_path}/cart`)
        .then((res) => {
            // console.log(res);
            this.cartData = res.data.data;
        })
    },
    addToCart(id, qty=1) {
      const data = {
        product_id: id,
        qty,
      };
      this.isLoadingItem = id;
      axios.post(`${url}/${api_path}/cart`, { data })
        .then((res) => {
          //console.log(res);
          this.getCart();
          this.$refs.productModal.closeModal();
          this.isLoadingItem = '';
        }).catch((err) => {
          alert(err.data.message);
        });
    },
    removeCartItem(id) {
      this.isLoadingItem = 'id';
      axios.delete(`${url}/${api_path}/cart/${id}`)
        .then((res) => {
          console.log(res);
          this.getCart();
          this.isLoadingItem = '';
        }).catch((err) => {
          alert(err.data.message);
        });
    },
    updateCartItem(item) {
      const data = {
        product_id: item.id,
        qty: item.qty,
      };
      this.isLoadingItem = item.id;
      axios.put(`${url}/${api_path}/cart/${item.id}`, { data })
        .then((res) => {
          //console.log(res);
          this.getCart();
          this.isLoadingItem = '';
        }).catch((err) => {
          alert(err.data.message);
        });
    },
    removeCartAllItem() {
      axios.delete(`${url}/${api_path}/carts`)
        .then((res) => {
          alert(res.data.message);
          //console.log(res);
          this.getCart();
        }).catch((err) => {
          alert(err.data.message);
        });
    },
    submitOrder() {
      const order = this.form;
      axios.post(`${url}/${api_path}/order`, { data: order })
        .then((res) => {
          alert(res.data.message);
          console.log(res.data);
          this.$refs.form.resetForm();
          this.getCart();
        }).catch((err) => {
          alert(err.data.message);
        })
    },
  },

  mounted() {
    this.getProducts();
    this.getCart();
  }
});

app.component('product-modal', {
  props: ['id'],
  template:'#userProductModal',
  data() {
    return {
      modal: {},
      product: {},
      qty: 1,
    };
  },
  watch: {
    id() {
      this.getProduct();
    },
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    getProduct() {
      axios.get(`${url}/${api_path}/product/${this.id}`)
      .then((res) => {
          console.log(res);
          this.product = res.data.product;
      });
    },
    addToCart() {
      this.$emit('add-cart', this.product.id, this.qty)
    },
  },
  mounted() {
    //ref="modal" 223行
    this.modal = new bootstrap.Modal(this.$refs.modal);
    
  },
});

app.mount("#app");
