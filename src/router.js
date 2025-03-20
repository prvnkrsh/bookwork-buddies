import { createRouter, createWebHistory } from "vue-router";
import { auth } from "./firebase";

// Lazy-load components
const Home = () => import("./views/Home.vue");
const Profile = () => import("./views/Profile.vue");
const Login = () => import("./views/Login.vue");

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true }, // Requires user to be logged in
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const user = auth.currentUser;

  if (requiresAuth && !user) {
    next("/login");
  } else if (to.path === "/login" && user) {
    next("/profile");
  } else {
    next();
  }
});

export default router;
