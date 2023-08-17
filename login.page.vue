<template>
  <section class="login-page">
    <div class="logo-container">
      <!-- <div class="logo-img"></div> -->
      <!-- <div class="logo-text"> -->
      <img src="@/assets/logo.png" class="logo-icon" />
      <span class="logo-text">Tablero</span>
      <!-- </div> -->
    </div>

    <section class="login-content-container">
      <div class="content-wrapper">
        <div class="login-content">
          <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>
          <h1 v-if="!this.isSignUpPageOpen" class="header" @click="toggleLoginPage">Login to Tablero</h1>
          <h1 v-else class="header" @click="toggleLoginPage">Sign up for your acount</h1>

          <div class="login-password-container">
            <div class="email-password">
              <div class="inputs-container">
                <input
                  v-if="this.isSignUpPageOpen"
                  type="text"
                  v-model="user.username"
                  class="login-input"
                  placeholder="Enter username"
                />
                <input
                  type="email"
                  class="login-input"
                  placeholder="Enter email "
                  v-model="user.email"
                  ref="mailInput"
                  autofocus
                />
                <input
                  type="password"
                  v-model="user.password"
                  class="login-input"
                  placeholder="Enter password"
                />
              </div>
              <input
                v-if="!this.isSignUpPageOpen"
                type="submit"
                class="login-submit"
                value="Log in"
                @click="login"
              />
              <input v-else type="submit" value="Sign Up" :class="isValidMail" @click="signup" />
            </div>

            <div :style="checkTypingSignUp" class="login-methods-container">
              <div class="login-methods-seperator">OR</div>

              <div class="login-methods">
                <div class="method-btn">
                  <span class="google-icon"></span>
                  <span @click="googleLogin" class="text">Continue with Google</span>
                </div>

                <div class="method-btn">
                  <span class="facebook-icon"></span>
                  <span class="text">Continue with Facebook</span>
                </div>
              </div>
            </div>
          </div>

          <hr />

          <ul class="bottom-link">
            <li class="sign-up-link">
              <div
                v-if="!this.isSignUpPageOpen"
                class="sign-up"
                @click="toggleLoginPage"
              >Sign up for an acount</div>
              <div
                v-else
                :to="'/login/'"
                class="sign-up"
                @click="toggleLoginPage"
              >Already have an acount? Log in</div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <div class="background">
      <div class="left-img">
        <img src="@/assets/img/tablero-left.svg" alt class="left" />
      </div>
      <div class="right-img">
        <img src="@/assets/img/tablero-right.svg" alt class="right" />
      </div>
    </div>
  </section>
</template>

<script>import { userService } from "../services/user.service";

export default {
  components: {},
  created() { },
  data() {
    return {
      isSignUpPageOpen: false,
      user: {
        email: "",
        password: "",
      },
      errorMsg: '',
    };
  },
  methods: {
    async googleLogin() {
      const googleUser = await this.$gAuth.signIn();
      const newUser = googleUser.getBasicProfile()

      const user = {
        email: newUser.getEmail(),
        username: newUser.getName(),
        googleId: newUser.getId(),
        password: newUser.getId(),
        imgUrl: newUser.getImageUrl()
      }
      this.$store.dispatch({ type: 'googleLogin', user });
    },
    toggleLoginPage() {
      this.isSignUpPageOpen = !this.isSignUpPageOpen;
      this.$refs.mailInput.focus();
      if (this.isSignUpPageOpen) {
        this.user = {
          email: "",
          username: "",
          password: "",
        };
      } else {
        this.user = {
          email: "",
          password: "",
        };
      }
    },
    async login() {
      try {
        if (!this.testMail(this.user.email) || !this.user.password) {
          this.$refs.mailInput.focus();
          this.errorMsg = 'Password and email required'
          setTimeout(() => {
            this.errorMsg = ''
          }, 3000)
          return;
        } else {
          await this.$store.dispatch({ type: "login", user: this.user });
        }
      } catch (err) {
        this.errorMsg = 'Username or password incorrect'
        setTimeout(() => {
          this.errorMsg = '';
        }, 3000)
      }
    },
    async signup() {
      try {
        if (
          !this.testMail(this.user.email) ||
          !this.user.password ||
          !this.user.username
        ) {
          this.$refs.mailInput.focus();
          return;
        } else {
          await this.$store.dispatch({ type: "signup", user: this.user });
        }
      } catch (err) {
        console.log(err)
        this.errorMsg = 'Username or email already taken'
        setTimeout(() => {
          this.errorMsg = ''
        }, 3000)
      }
    },
    testMail(mail) {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return true;
      }
      return false;
    },
  },
  computed: {
    checkPage() {
      return this.isSignUpPageOpen ? "display : none" : "";
    },
    checkTypingSignUp() {
      return (this.user.email || this.user.password) && this.isSignUpPageOpen
        ? "display : none"
        : "";
    },
    isValidMail() {
      return this.user.email.includes("@") ? "login-submit" : "unvalid-mail";
    },
  },
  unmounted() { },
};
</script>