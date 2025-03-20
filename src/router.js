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
    meta: { requiresAuth: true }, // Add this to protect the Home route
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
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
    next("/login"); // Redirect to login if user is not authenticated
  } else if (to.path === "/login" && user) {
    next("/profile"); // Redirect to profile if user is already logged in
  } else {
    next();
  }
});

export default router;
