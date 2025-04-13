import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/RegisterView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginView.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/pages/HomeView.vue')
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/privateChats',
    name: 'privateChats',
    component: () => import('@/pages/PrivateChats.vue')
  },
  {
    path: '/profiles/:username',
    name: 'profiles',
    component: () => import('@/pages/ProfileView.vue')
  },
  {
    path: '/:notFound(.*)*',
    name: 'notFound',
    component: () => import('@/pages/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const publicPages = ['/login', '/register'];
  const isPublicPage = publicPages.includes(to.path);

  if (token && isPublicPage) {
    return next('/home'); 
  }

  if (!token && !isPublicPage) {
    return next('/login'); 
  }

  if (token && !isPublicPage) {
    try {
      const response = await fetch(`${process.env.VUE_APP_API_URL}/api/auth/verify`, { 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        localStorage.removeItem('token'); 
        return next('/login'); 
      }

      const data = await response.json();
      if (data.valid) {
        next(); 
      } else {
        localStorage.removeItem('token'); 
        return next('/login'); 
      }
    } catch (error) {
      console.error('Error al validar el token:', error);
      localStorage.removeItem('token'); 
      return next('/login'); 
    }
  } else {
    next(); 
  }
});

export default router;