<template>
  <section class="home-page">
    <header class="home-header">
      <nav class="homepage-nav">
        <!-- <router-link class="main-logo" :to="'/board/'">Tablero</router-link> -->
        <router-link :style="textColor" class="main-logo" :to="'/board/'">
          <img src="../assets/logo.png" class="logo-icon" />
          <img src="../assets/logowhite.png" class="logo-icon" style="display:none" />
          <img src="../assets/logodarkblue.png" class="logo-icon" style="display:none" />
          <span class="logo-text">Tablero</span>
        </router-link>
        <div class="login-container">
          <router-link class="login" :to="'/login/'">Log in</router-link>
          <router-link class="logout" :to="'/login/'">Sign up</router-link>
        </div>
      </nav>
    </header>

    <section class="home-container">
      <div class="home-page-content">
        <div class="home-page-content-container">
          <div class="home-page-left">
            <h1 class="header">Tablero helps teams move work forward.</h1>
            <p class="home-text">
              Collaborate, manage projects, and reach new productivity peaks.
              From high rises to the home office, the way your team works is
              unique - accomplish it all with Tablero.
            </p>
            <form action class="form-container">
              <!-- <div class="input-container">
                <input type="email" class="email-input" placeholder="Email" />
              </div>-->
              <div class="start-btn-container">
                <router-link :to="'/board/'" class="start-btn">Try live demo!</router-link>
              </div>
            </form>
          </div>
          <div class="home-page-right">
            <img src="@/assets/img/home.png" alt width="445" height="575" />
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script>
export default {
  // props: [''],
  components: {},
  created() { },
  data() {
    return {};
  },
  methods: {},
  computed: {},
  unmounted() { },
};
</script>