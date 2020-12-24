import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')
// import Users from '../components/user/Users.vue'
// import Roles from '../components/power/Roles.vue'
// import Rights from '../components/power/Rights.vue'
const Users = () => import(/* webpackChunkName: "Users_Roles_Rights" */ '../components/user/Users.vue')
const Roles = () => import(/* webpackChunkName: "Users_Roles_Rights" */ '../components/power/Roles.vue')
const Rights = () => import(/* webpackChunkName: "Users_Roles_Rights" */ '../components/power/Rights.vue')

// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

// import GoodsList from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
const GoodsList = () => import(/* webpackChunkName: "List_Add" */ '../components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "List_Add" */ '../components/goods/Add.vue')

// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({ routes })

router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数,表示放行
  // next() 放行 next('/login') 强制跳转
  if (to.path === '/login') return next()
  const tokens = window.sessionStorage.getItem('token')
  if (!tokens) return next('/login')
  next()
})

export default router
